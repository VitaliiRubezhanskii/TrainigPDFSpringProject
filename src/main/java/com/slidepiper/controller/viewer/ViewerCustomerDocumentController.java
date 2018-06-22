package com.slidepiper.controller.viewer;

import com.slidepiper.exception.FileInputEmptyException;
import com.slidepiper.repository.CustomerDocumentRepository;
import com.slidepiper.service.viewer.ViewerCustomerDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.Objects;

@RestController
public class ViewerCustomerDocumentController {
    private final CustomerDocumentRepository documentRepository;
    private final ViewerCustomerDocumentService viewerDocumentService;

    @Autowired
    public ViewerCustomerDocumentController(CustomerDocumentRepository documentRepository,
                                            ViewerCustomerDocumentService dashboardDocumentService) {
        this.documentRepository = documentRepository;
        this.viewerDocumentService = dashboardDocumentService;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/viewer/customer-documents")
    @ResponseBody
    public void uploadFile(Principal principal, @RequestParam("file") MultipartFile multipartFile, @RequestParam("initialChannelFriendlyId") String initialChannelFriendlyId,
                           @RequestParam("docsForCustomerId") int docsForCustomerId) throws IOException {
        if (Objects.isNull(multipartFile)) {
            throw new FileInputEmptyException();
        } else {
            viewerDocumentService.upload(multipartFile, principal.getName(), initialChannelFriendlyId, docsForCustomerId);
        }
    }

    /*@PutMapping("/api/v1/customerdocuments/{friendlyId}")
    public void update(Principal principal,
                       @PathVariable("friendlyId") String documentFriendlyId,
                       @RequestPart("file") MultipartFile file) throws IOException {
        if (Objects.isNull(file)) {
            throw new FileInputEmptyException();
        } else if (documentRepository.findByFriendlyId(documentFriendlyId).getViewer().getEmail().equals(principal.getName())) {
            viewerDocumentService.update(file, documentFriendlyId, principal.getName());
        }
    }

    @DeleteMapping("/api/v1/customerdocuments/{friendlyId}")
    public void delete(Principal principal,
                       @PathVariable("friendlyId") String documentFriendlyId) throws IOException {
        if (documentRepository.findByFriendlyId(documentFriendlyId).getViewer().getEmail().equals(principal.getName())) {
            viewerDocumentService.delete(documentFriendlyId, principal.getName());
        }
    }*/
}