package com.slidepiper.service.dashboard;

import com.amazonaws.services.s3.model.DeleteObjectsRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.amazon.AmazonCloudFrontService;
import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.Document.Status;
import com.slidepiper.model.entity.Event;
import com.slidepiper.model.entity.Viewer;
import com.slidepiper.repository.DocumentRepository;
import com.slidepiper.repository.EventRepository;
import com.slidepiper.repository.ViewerRepository;
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
import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;

import javax.persistence.EntityManager;
import java.io.IOException;
import java.util.List;

@Service
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardCustomerDocumentService {
    private static final boolean IS_PROCESS_MODE = false;
    private static final boolean IS_MFA_ENABLED = false;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String alphabet;
    private final String bucket;
    private final String keyPrefix;
    private final int minHashLength;
    private final String salt;
    private final AmazonCloudFrontService amazonCloudFrontService;
    private final AmazonS3Service amazonS3Service;
    private final DocumentRepository documentRepository;
    private final EntityManager entityManager;
    private final EventRepository eventRepository;
    private final DashboardShareWidgetService dashboardShareWidgetService;
    private final ViewerRepository viewerRepository;

    @Autowired
    public DashboardCustomerDocumentService(@Value("${customerDocuments.amazon.s3.bucket}") String bucket,
                                            @Value("${customerDocuments.amazon.s3.keyPrefix}") String keyPrefix,
                                            @Value("${customerDocuments.hashids.salt}") String salt,
                                            @Value("${customerDocuments.hashids.minHashLength}") int minHashLength,
                                            @Value("${customerDocuments.hashids.alphabet}") String alphabet,
                                            AmazonCloudFrontService amazonCloudFrontService,
                                            AmazonS3Service amazonS3Service,
                                            DocumentRepository documentRepository,
                                            EntityManager entityManager,
                                            EventRepository eventRepository,
                                            DashboardShareWidgetService dashboardShareWidgetService,
                                            ViewerRepository viewerRepository) {
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
        this.viewerRepository = viewerRepository;
    }

    private String getDocumentPrefix(Document document) {
        return String.join("/", keyPrefix, document.getFriendlyId());
    }

    private String getDocumentPath(Document document) {
        return UriComponentsBuilder
                .newInstance()
                .path("/{keyPrefix}/{documentFriendlyId}/*")
                .buildAndExpand(keyPrefix, document.getFriendlyId())
                .toUriString();
    }

    public void upload(MultipartFile file, String username) throws IOException {
        String name = file.getOriginalFilename();

        Viewer viewer = viewerRepository.findByEmail(username);
        Document document = new Document(viewer, Status.CREATED, name, IS_PROCESS_MODE, IS_MFA_ENABLED);
        documentRepository.save(document);

        Hashids hashids = new Hashids(salt, minHashLength, alphabet);
        String friendlyId = hashids.encode(document.getId());

        String key = String.join("/", keyPrefix, friendlyId, name);
        String versionId = amazonS3Service.upload(file, file.getContentType(), bucket, key, ObjectMetaData.VERSION_ID);

        document.setFriendlyId(friendlyId);
        document.setVersionId(versionId);
        documentRepository.save(document);

        // Create default customer.
        String defaultCustomerEmail = ConfigProperties.getProperty("default_customer_email");
        if (false == DbLayer.isCustomerExist(username, defaultCustomerEmail)) {
            DbLayer.addNewCustomer(null, username, "Generic", "Link", null, null, defaultCustomerEmail, null, null);
        }
        DbLayer.setFileLinkHash(defaultCustomerEmail, friendlyId, username);

        // Save event.
        ObjectNode data = objectMapper.createObjectNode();
        data.put("id", document.getId());
        data.put("name", name);
        data.put("size", file.getSize());
        eventRepository.save(new Event(username, Event.EventType.CREATED_DOCUMENT, data));
    }

    public void update(MultipartFile file, String friendlyId, String email) throws IOException {
        Document document = documentRepository.findByFriendlyId(friendlyId);

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
        eventRepository.save(new Event(email, Event.EventType.UPDATED_DOCUMENT, data));
    }

    public void delete(String friendlyId, String email) {
        Document document = documentRepository.findByFriendlyId(friendlyId);

        List<DeleteObjectsRequest.KeyVersion> keysLatestVersion =
                amazonS3Service.getKeysLatestVersion(bucket, getDocumentPrefix(document));
        amazonS3Service.disableKeysLatestVersion(bucket, keysLatestVersion);

        document.setStatus(Status.DELETED);
        documentRepository.save(document);

        // Invalidate document path.
        // @TODO: Run command asynchronously.
        amazonCloudFrontService.invalidate(getDocumentPath(document));

        // Save event.
        ObjectNode data = objectMapper.createObjectNode();
        data.put("id", document.getId());
        eventRepository.save(new Event(email, Event.EventType.DELETED_DOCUMENT, data));
    }

    public void save(String friendlyId, String email, Boolean isProcessMode, Boolean isMFAEnabled) {
        Document document = documentRepository.findByFriendlyId(friendlyId);

        if (isProcessMode != null) {
            document.setProcessMode(isProcessMode);
        }
        if (isMFAEnabled != null) {
            document.setMfaEnabled(isMFAEnabled);
        }
        documentRepository.save(document);

        // Save event.
        ObjectNode data = objectMapper.createObjectNode();
        data.put("id", document.getId());
        eventRepository.save(new Event(email, Event.EventType.PROCESS_MODE_ENABLED_FOR_DOCUMENT, data));
    }
}