package com.slidepiper.controller.dashboard.widget;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.repository.DocumentRepository;
import com.slidepiper.service.dashboard.widget.DashboardLinkWidgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardLinkWidgetController {
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final DocumentRepository documentRepository;
    private final DashboardLinkWidgetService dashboardLinkWidgetService;

    @Autowired
    public DashboardLinkWidgetController(DocumentRepository documentRepository,
                                         DashboardLinkWidgetService dashboardLinkWidgetService) {
        this.documentRepository = documentRepository;
        this.dashboardLinkWidgetService = dashboardLinkWidgetService;
    }

    @PostMapping("/api/v1/widgets/link")
    public ObjectNode uploadFile(Principal principal,
                                 @RequestBody @RequestParam("file") MultipartFile file,
                                 @RequestBody @RequestParam("documentFriendlyId") String documentFriendlyId) throws IOException {

        ObjectNode objectNode = objectMapper.createObjectNode();
        if (documentRepository.findByFriendlyId(documentFriendlyId).getViewer().getEmail().equals(principal.getName())) {
            objectNode.put("url", dashboardLinkWidgetService.uploadFile(file, documentFriendlyId));
        }
        return objectNode;
    }
}