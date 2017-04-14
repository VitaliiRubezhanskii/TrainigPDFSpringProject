package com.slidepiper.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@CrossOrigin("${slidepiper.url}")
public class DocumentUtilsController {
    private final DocumentService documentService;

    @Autowired
    public DocumentUtilsController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/api/v1/document-utils/clone")
    public void clone(@RequestBody ObjectNode data) throws IOException {

        documentService.clone(
                data.get("sourceDocumentFriendlyId").asText(),
                data.get("destinationDocumentName").asText(),
                data.get("salesmanEmail").asText());
    }
}
