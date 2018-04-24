package com.slidepiper.controller.dashboard;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.exception.FileInputEmptyException;
import com.slidepiper.repository.DocumentRepository;
import com.slidepiper.service.dashboard.DashboardDocumentService;
import org.apache.commons.lang3.ArrayUtils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.Objects;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardDocumentController {
    private final DocumentRepository documentRepository;
    private final DashboardDocumentService dashboardDocumentService;

    @Autowired
    public DashboardDocumentController(DocumentRepository documentRepository,
                                       DashboardDocumentService dashboardDocumentService) {
        this.documentRepository = documentRepository;
        this.dashboardDocumentService = dashboardDocumentService;
    }

    @PostMapping("/api/v1/documents")
    public void upload(Principal principal,
                       @RequestPart(value = "files[]", required = false) MultipartFile[] files) throws IOException {
        if (Objects.nonNull(files)) {
            if (ArrayUtils.isEmpty(files)) {
                throw new FileInputEmptyException();
            } else {
                dashboardDocumentService.upload(files, principal.getName());
            }
        }
    }

    @PutMapping("/api/v1/documents/{friendlyId}")
    public void update(Principal principal,
                       @PathVariable("friendlyId") String documentFriendlyId,
                       @RequestPart("file") MultipartFile file) throws IOException {
        if (Objects.isNull(file)) {
            throw new FileInputEmptyException();
        } else if (documentRepository.findByFriendlyId(documentFriendlyId).getViewer().getEmail().equals(principal.getName())) {
            dashboardDocumentService.update(file, documentFriendlyId, principal.getName());
        }
    }

    @DeleteMapping("/api/v1/documents/{friendlyId}")
    public void delete(Principal principal,
                       @PathVariable("friendlyId") String documentFriendlyId) throws IOException {
        if (documentRepository.findByFriendlyId(documentFriendlyId).getViewer().getEmail().equals(principal.getName())) {
            dashboardDocumentService.delete(documentFriendlyId, principal.getName());
        }
    }

    @PostMapping("/api/v1/document-utils/clone")
    public void clone(Principal principal,
                      @RequestBody ObjectNode data) throws IOException {
        String sourceDocumentFriendlyId = data.get("sourceDocumentFriendlyId").asText();
        String destinationDocumentName = data.get("destinationDocumentName").asText();
        if (documentRepository.findByFriendlyId(sourceDocumentFriendlyId).getViewer().getEmail().equals(principal.getName())) {
            dashboardDocumentService.clone(sourceDocumentFriendlyId, destinationDocumentName, principal.getName());
        }
    }

    @PostMapping("/api/v1/documents/{friendlyId}")
    public void save(Principal principal,
                       @PathVariable("friendlyId") String documentFriendlyId, @RequestBody String body) throws IOException {
        if (documentRepository.findByFriendlyId(documentFriendlyId).getViewer().getEmail().equals(principal.getName())) {
            JSONObject input = new JSONObject(body);

            Boolean isProcessMode = null;
            Boolean isMFAEnabled = null;
            if (input.has("isProcessMode")) {
                isProcessMode = input.getBoolean("isProcessMode");
            }
            if (input.has("isMFAEnabled")) {
                isMFAEnabled = input.getBoolean("isMFAEnabled");
            }

            dashboardDocumentService.save(documentFriendlyId, principal.getName(), isProcessMode, isMFAEnabled);
        }
    }
}