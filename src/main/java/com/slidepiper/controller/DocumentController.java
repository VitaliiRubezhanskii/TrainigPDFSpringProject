package com.slidepiper.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.exception.FileInputEmptyException;
import com.slidepiper.service.DocumentService;
import org.apache.commons.lang3.ArrayUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;

@RestController
@CrossOrigin("${slidepiper.url}")
public class DocumentController {
    private final DocumentService documentService;

    @Autowired
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/v1/documents")
    public void upload(
            @RequestPart("files[]") MultipartFile[] files,
            @RequestPart("data") ObjectNode data) throws IOException {

        if (ArrayUtils.isEmpty(files)) {
            throw new FileInputEmptyException();
        }

        documentService.upload(files, data.get("salesmanEmail").asText());
    }

    @PutMapping("/v1/documents/{friendlyId}")
    public void update(
            @PathVariable("friendlyId") String friendlyId,
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") ObjectNode data) throws IOException {

        if (Objects.isNull(file)) {
            throw new FileInputEmptyException();
        }

        documentService.update(file, friendlyId, data.get("salesmanEmail").asText());
    }

    @DeleteMapping("/v1/documents/{friendlyId}")
    public void delete(
            @PathVariable("friendlyId") String friendlyId,
            @RequestPart("data") ObjectNode data) throws IOException {

        documentService.delete(friendlyId, data.get("salesmanEmail").asText());
    }
}
