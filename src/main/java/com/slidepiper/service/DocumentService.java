package com.slidepiper.service;

import com.amazonaws.services.s3.model.DeleteObjectsRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.Event;
import com.slidepiper.repository.DocumentRepository;
import com.slidepiper.repository.EventRepository;
import com.slidepiper.service.amazon.AmazonS3Service;
import org.hashids.Hashids;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;
import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import java.util.Objects;

@Service
public class DocumentService {
    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    @Value("${documents.amazon.s3.bucket}") private String bucket;
    @Value("${documents.amazon.s3.keyPrefix}") private String keyPrefix;
    @Value("${documents.hashids.salt}") private String salt;
    @Value("${documents.hashids.minHashLength}") private int minHashLength;
    @Value("${documents.hashids.alphabet}") private String alphabet;
    @Value("${slidepiper.url}") private String slidepiperUrl;
    @Value("${amazon.s3.url}") private String amazonS3Url;

    private final AmazonS3Service amazonS3Service;
    private final DocumentRepository documentRepository;
    private final EventRepository eventRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public DocumentService(AmazonS3Service amazonS3Service,
                           DocumentRepository documentRepository,
                           EventRepository eventRepository,
                           ObjectMapper objectMapper) {
        this.amazonS3Service = amazonS3Service;
        this.documentRepository = documentRepository;
        this.eventRepository = eventRepository;
        this.objectMapper = objectMapper;
    }

    public String getUrl(Document document, HttpServletRequest request) {
        UriComponentsBuilder baseUrl;
        if (Objects.nonNull(request.getHeader("X-Amz-Cf-Id"))) {
            baseUrl = UriComponentsBuilder.newInstance().scheme(request.getScheme()).host(request.getServerName());
        } else {
            baseUrl = UriComponentsBuilder.fromHttpUrl(amazonS3Url).pathSegment(bucket);
        }

        return baseUrl
                .path("/{keyPrefix}/{documentFriendlyId}/{documentName}")
                .queryParam("versionId", document.getVersionId())
                .buildAndExpand(keyPrefix, document.getFriendlyId(), document.getName())
                .encode()
                .toString();
    }

    public String getDocumentPrefix(Document document) {
        return String.join("/", keyPrefix, document.getFriendlyId());
    }

    public void upload(MultipartFile[] files, String email) throws IOException {
        for (MultipartFile file: files) {
            String name = file.getOriginalFilename();

            Document document = new Document(email, Document.Status.CREATED, name);
            documentRepository.save(document);

            Hashids hashids = new Hashids(salt, minHashLength, alphabet);
            String friendlyId = hashids.encode(document.getId());

            String key = String.join("/", keyPrefix, friendlyId, name);
            String versionId = amazonS3Service.upload(file, bucket, key);

            document.setFriendlyId(friendlyId);
            document.setVersionId(versionId);
            documentRepository.save(document);

            // Create default customer.
            String defaultCustomerEmail = ConfigProperties.getProperty("default_customer_email");
            if (false == DbLayer.isCustomerExist(email, defaultCustomerEmail)) {
                DbLayer.addNewCustomer(null, email, "Generic", "Link", null, null, defaultCustomerEmail);
            }
            DbLayer.setFileLinkHash(defaultCustomerEmail, friendlyId, email);

            // Save event.
            ObjectNode data = objectMapper.createObjectNode();
            data.put("id", document.getId());
            data.put("name", name);
            data.put("size", file.getSize());
            eventRepository.save(new Event(email, Event.EventType.CREATED_DOCUMENT, data));
        }
    }

    public void update(MultipartFile file, String friendlyId, String email) throws IOException {
        Document document = documentRepository.findByFriendlyIdAndEmail(friendlyId, email);

        List<DeleteObjectsRequest.KeyVersion> keysLatestVersion =
                amazonS3Service.getKeysLatestVersion(bucket, getDocumentPrefix(document));
        amazonS3Service.disableKeysLatestVersion(bucket, keysLatestVersion);

        String name = file.getOriginalFilename();
        String key = String.join("/", keyPrefix, friendlyId, name);
        String versionId = amazonS3Service.upload(file, bucket, key);

        document.setStatus(Document.Status.UPDATED);
        document.setName(name);
        document.setVersionId(versionId);
        documentRepository.save(document);

        // Save event.
        ObjectNode data = objectMapper.createObjectNode();
        data.put("id", document.getId());
        data.put("name", name);
        data.put("size", file.getSize());
        eventRepository.save(new Event(email, Event.EventType.UPDATED_DOCUMENT, data));
    }

    public void delete(String friendlyId, String email) {
        Document document = documentRepository.findByFriendlyIdAndEmail(friendlyId, email);

        List<DeleteObjectsRequest.KeyVersion> keysLatestVersion =
                amazonS3Service.getKeysLatestVersion(bucket, getDocumentPrefix(document));
        amazonS3Service.disableKeysLatestVersion(bucket, keysLatestVersion);

        document.setStatus(Document.Status.DELETED);
        documentRepository.save(document);

        // Save event.
        ObjectNode data = objectMapper.createObjectNode();
        data.put("id", document.getId());
        eventRepository.save(new Event(email, Event.EventType.DELETED_DOCUMENT, data));
    }
}
