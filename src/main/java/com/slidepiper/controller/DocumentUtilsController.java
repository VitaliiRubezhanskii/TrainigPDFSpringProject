package com.slidepiper.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.service.DocumentService;
import com.slidepiper.service.widget.LinkWidgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@CrossOrigin("${slidepiper.url}")
public class DocumentUtilsController {
    private final DocumentService documentService;
    private final LinkWidgetService linkWidgetService;
    private final ObjectMapper objectMapper;

    @Autowired
    public DocumentUtilsController(DocumentService documentService, LinkWidgetService linkWidgetService, ObjectMapper objectMapper) {
        this.documentService = documentService;
        this.linkWidgetService = linkWidgetService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/api/v1/document-utils/clone")
    public void clone(@RequestBody ObjectNode data) throws IOException {

        documentService.clone(
                data.get("sourceDocumentFriendlyId").asText(),
                data.get("destinationDocumentName").asText(),
                data.get("salesmanEmail").asText());
    }

    @PostMapping("/api/v1/widget/link")
    public ObjectNode uploadFile(@RequestBody @RequestParam("file") MultipartFile file,
                                 @RequestBody @RequestParam("salesmanEmail") String salesmanEmail,
                                 @RequestBody @RequestParam("documentFriendlyId") String documentFriendlyId) throws IOException {

        ObjectNode objectNode = objectMapper.createObjectNode();
        objectNode.put("url", linkWidgetService.uploadFile(file, salesmanEmail, documentFriendlyId));
        return objectNode;
    }
}
