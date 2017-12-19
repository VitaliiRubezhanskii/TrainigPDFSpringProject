package com.slidepiper.task;

import com.samskivert.mustache.Mustache;
import com.slidepiper.model.entity.Customer;
import com.slidepiper.model.entity.CustomerData;
import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.Viewer;
import com.slidepiper.repository.CustomerRepository;
import com.slidepiper.repository.DocumentRepository;
import com.slidepiper.repository.EventRepository;
import com.slidepiper.repository.ViewerRepository;
import com.slidepiper.service.amazon.AmazonSesService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import slidepiper.db.DbLayer;

import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import static com.slidepiper.task.TaskAction.EMAIL;

@Service
class DocumentScheduledTaskService extends AbstractScheduledTaskService {
    private final String url;
    private final String accessKey;
    private final String secretKey;
    private final String templatesPrefix;
    private final AmazonSesService amazonSesService;
    private final CustomerRepository customerRepository;
    private final DocumentRepository documentRepository;

    DocumentScheduledTaskService(EventRepository eventRepository,
                                 TaskRepository taskRepository,
                                 ViewerRepository viewerRepository,
                                 @Value("${slidepiper.url}") String url,
                                 @Value("${slidepiper.amazon.accessKey}") String accessKey,
                                 @Value("${slidepiper.amazon.secretKey}")String secretKey,
                                 @Value("${slidepiper.templates.prefix}") String templatesPrefix,
                                 AmazonSesService amazonSesService,
                                 CustomerRepository customerRepository,
                                 DocumentRepository documentRepository) {
        super(eventRepository, taskRepository, viewerRepository);
        this.url = url;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.templatesPrefix = templatesPrefix;
        this.amazonSesService = amazonSesService;
        this.customerRepository = customerRepository;
        this.documentRepository = documentRepository;
    }

    @Override
    public void execute(Task task) {
        task = super.initialize(task);

        try {
            validate(task);

            DocumentTask documentTask = (DocumentTask) task;
            Document document = documentRepository.findById(documentTask.getDocumentId());
            switch (documentTask.getAction()) {
                case EMAIL:
                    Customer customer = customerRepository.findById(documentTask.getCustomerId());
                    Viewer viewer = document.getViewer();

                    // Set from.
                    String fromTemplate = "{{userCompany}} <do-not-reply@slidepiper.com>";
                    Map<String, String> fromVariables = new HashMap<>();
                    fromVariables.put("userCompany", viewer.getCompany());
                    String from = Mustache.compiler().compile(fromTemplate).execute(fromVariables);

                    // Set subject.
                    String subjectTemplate = "Action required: {{userCompany}} - Task reminder";
                    Map<String, String> subjectVariables = new HashMap<>();
                    subjectVariables.put("userCompany", viewer.getCompany());
                    String subject = Mustache.compiler().compile(subjectTemplate).execute(subjectVariables);

                    // Set body.
                    Map<String, String> bodyVariables = new HashMap<>();
                    bodyVariables.put("customerFirstName", customer.getFirstName());
                    bodyVariables.put("taskMessage", documentTask.getData().getTaskMessage());
                    bodyVariables.put("userCompany", viewer.getCompany());

                    String link = UriComponentsBuilder.fromHttpUrl(url)
                            .pathSegment("view")
                            .queryParam("f", DbLayer.setFileLinkHash(customer.getEmail(), document.getFriendlyId(), customer.getUsername()))
                            .fragment("page=" + documentTask.getData().getPageNumber())
                            .build()
                            .toUriString();
                    bodyVariables.put("link", link);

                    String userEmail = viewer.getEmail();
                    if (Objects.nonNull(viewer.getData()) && Objects.nonNull(viewer.getData().getNotificationEmail())) {
                        userEmail = viewer.getData().getNotificationEmail();
                    }
                    bodyVariables.put("userEmail", userEmail);

                    InputStreamReader inputStreamReader = new InputStreamReader(
                            getClass().getClassLoader().getResourceAsStream(String.join("/", "templates", templatesPrefix, "task-email.html")));
                    String body = Mustache.compiler().compile(inputStreamReader).execute(bodyVariables);

                    // Send email.
                    String bcc = null;
                    if (Objects.nonNull(viewer.getData()) && viewer.getData().isReceiveCustomerEmailEnabled()) {
                        bcc = viewer.getEmail();
                        if (Objects.nonNull(viewer.getData().getNotificationEmail())) {
                            bcc = viewer.getData().getNotificationEmail();
                        }
                    }
                    amazonSesService.sendEmail(accessKey, secretKey, from, customer.getEmail(), subject, body, viewer.getEmail(), bcc);
                    break;
            }

            super.complete(task);
        } catch (RuntimeException e) {
            if (e instanceof TaskInvalidException) {
                super.abort(task, (TaskInvalidException) e);
            } else {
                super.fail(task, e);
            }
        }
    }

    @Override
    public void validate(Task task) {
        Long documentId = ((DocumentTask) task).getDocumentId();
        if (Objects.isNull(documentId)
                || documentRepository.findById(documentId).getStatus() == Document.Status.DELETED) {
            throw new TaskInvalidException("Document not found");
        }

        Customer customer = customerRepository.findById(task.getCustomerId());
        if (task.getAction() == EMAIL
                && Optional.ofNullable(customer.getData()).map(CustomerData::isUnsubscribedEmail).orElse(false)) {
            throw new TaskInvalidException("Customer unsubscribed from email");
        }

        if (Objects.isNull(viewerRepository.findByUserId(task.getUserId()).getCompany())) {
            throw new TaskInvalidException("User company is null");
        }
    }
}