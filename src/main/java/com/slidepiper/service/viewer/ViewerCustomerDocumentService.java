package com.slidepiper.service.viewer;

import com.amazonaws.services.s3.model.DeleteObjectsRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.amazon.AmazonCloudFrontService;
import com.slidepiper.model.customer.Customer;
import com.slidepiper.model.customer.CustomerDocument;
import com.slidepiper.model.entity.*;
import com.slidepiper.model.customer.CustomerDocument.Status;
import com.slidepiper.model.entity.widget.UploadDocumentWidgetDocsForCustomer;
import com.slidepiper.repository.*;
import com.slidepiper.service.amazon.AmazonS3Service;
import com.slidepiper.service.amazon.AmazonS3Service.ObjectMetaData;
import com.slidepiper.service.dashboard.widget.DashboardShareWidgetService;
import org.hashids.Hashids;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import javax.persistence.EntityManager;
import java.io.IOException;
import java.util.List;

@Service
@PreAuthorize("hasRole('ROLE_USER')")
public class ViewerCustomerDocumentService {
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String alphabet;
    private final String bucket;
    private final String keyPrefix;
    private final int minHashLength;
    private final String salt;
    private final AmazonCloudFrontService amazonCloudFrontService;
    private final AmazonS3Service amazonS3Service;
    private final CustomerDocumentRepository documentRepository;
    private final EntityManager entityManager;
    private final ViewerEventRepository eventRepository;
    private final DashboardShareWidgetService dashboardShareWidgetService;
    private final CustomerRepository customerRepository;
    private final ViewerRepository viewerRepository;
    private final ChannelRepository channelRepository;
    private final UploadDocumentWidgetDocsForCustomerRepository uploadDocumentWidgetDocsForCustomerRepository;

    @Autowired
    public ViewerCustomerDocumentService(@Value("${customerDocuments.amazon.s3.bucket}") String bucket,
                                         @Value("${customerDocuments.amazon.s3.keyPrefix}") String keyPrefix,
                                         @Value("${customerDocuments.hashids.salt}") String salt,
                                         @Value("${customerDocuments.hashids.minHashLength}") int minHashLength,
                                         @Value("${customerDocuments.hashids.alphabet}") String alphabet,
                                         AmazonCloudFrontService amazonCloudFrontService,
                                         AmazonS3Service amazonS3Service,
                                         CustomerDocumentRepository documentRepository,
                                         EntityManager entityManager,
                                         ViewerEventRepository eventRepository,
                                         DashboardShareWidgetService dashboardShareWidgetService,
                                         CustomerRepository customerRepository,
                                         ViewerRepository viewerRepository,
                                         ChannelRepository channelRepository,
                                         UploadDocumentWidgetDocsForCustomerRepository uploadDocumentWidgetDocsForCustomerRepository) {
        this.bucket = bucket;
        this.keyPrefix = keyPrefix;
        this.salt = salt;
        this.minHashLength = minHashLength;
        this.alphabet = alphabet;
        this.amazonCloudFrontService = amazonCloudFrontService;
        this.amazonS3Service = amazonS3Service;
        this.documentRepository = documentRepository;
        this.entityManager = entityManager;
        this.eventRepository = eventRepository;
        this.dashboardShareWidgetService = dashboardShareWidgetService;
        this.customerRepository = customerRepository;
        this.viewerRepository = viewerRepository;
        this.channelRepository = channelRepository;
        this.uploadDocumentWidgetDocsForCustomerRepository = uploadDocumentWidgetDocsForCustomerRepository;
    }

    private String getDocumentPrefix(CustomerDocument document) {
        return String.join("/", keyPrefix, document.getFriendlyId());
    }

    private String getDocumentPath(CustomerDocument document) {
        return UriComponentsBuilder
                .newInstance()
                .path("/{keyPrefix}/{documentFriendlyId}/*")
                .buildAndExpand(keyPrefix, document.getFriendlyId())
                .toUriString();
    }

    public void upload(MultipartFile file, String username, String initialChannelFriendlyId, int docsForCustomerId) throws IOException {
            String name = file.getOriginalFilename();

            Customer customer = customerRepository.findCustomerByEmail(username);
            if (customer == null) {
                customer = customerRepository.findCustomerByCustomerId(username);
            }
            CustomerDocument document = new CustomerDocument(customer, viewerRepository.findByEmail(customer.getUsername()), channelRepository.findByFriendlyId(initialChannelFriendlyId), Status.CREATED, name, uploadDocumentWidgetDocsForCustomerRepository.findById(docsForCustomerId));
            documentRepository.save(document);

            Hashids hashids = new Hashids(salt, minHashLength, alphabet);
            String friendlyId = hashids.encode(document.getId());

            String key = String.join("/", keyPrefix, friendlyId, name);
            String versionId = amazonS3Service.upload(file, file.getContentType(), bucket, key, ObjectMetaData.VERSION_ID);

            document.setFriendlyId(friendlyId);
            document.setVersionId(versionId);
            documentRepository.save(document);

            // Save event.
            ObjectNode data = objectMapper.createObjectNode();
            data.put("id", document.getId());
            data.put("name", name);
            data.put("size", file.getSize());
            eventRepository.save(new ViewerEvent(ViewerEvent.ViewerEventType.UPLOAD_DOCUMENT, initialChannelFriendlyId));
    }

    public void update(MultipartFile file, String friendlyId, String initialChannelFriendlyId) throws IOException {
        CustomerDocument document = documentRepository.findByFriendlyId(friendlyId);

        List<DeleteObjectsRequest.KeyVersion> keysLatestVersion =
                amazonS3Service.getKeysLatestVersion(bucket, getDocumentPrefix(document));
        amazonS3Service.disableKeysLatestVersion(bucket, keysLatestVersion);

        String name = file.getOriginalFilename();
        String key = String.join("/", keyPrefix, friendlyId, name);
        String versionId = amazonS3Service.upload(file, file.getContentType(), bucket, key, ObjectMetaData.VERSION_ID);

        document.setStatus(Status.UPDATED);
        document.setName(name);
        document.setVersionId(versionId);
        documentRepository.save(document);

        // Invalidate document path.
        // @TODO: Run command asynchronously.
        amazonCloudFrontService.invalidate(getDocumentPath(document));

        // Save event.
        ObjectNode data = objectMapper.createObjectNode();
        data.put("id", document.getId());
        data.put("name", name);
        data.put("size", file.getSize());
        eventRepository.save(new ViewerEvent(ViewerEvent.ViewerEventType.UPDATE_DOCUMENT, initialChannelFriendlyId));
    }

    public void delete(String friendlyId, String initialChannelFriendlyId) {
        CustomerDocument document = documentRepository.findByFriendlyId(friendlyId);

        List<DeleteObjectsRequest.KeyVersion> keysLatestVersion =
                amazonS3Service.getKeysLatestVersion(bucket, getDocumentPrefix(document));
        amazonS3Service.disableKeysLatestVersion(bucket, keysLatestVersion);

        document.setStatus(Status.DELETED);
        documentRepository.save(document);

        // Invalidate document path.
        amazonCloudFrontService.invalidate(getDocumentPath(document));

        // Save event.
        eventRepository.save(new ViewerEvent(ViewerEvent.ViewerEventType.DELETE_DOCUMENT, initialChannelFriendlyId));
    }
}