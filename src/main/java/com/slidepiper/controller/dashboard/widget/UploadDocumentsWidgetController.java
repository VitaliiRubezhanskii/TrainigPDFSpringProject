package com.slidepiper.controller.dashboard.widget;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class UploadDocumentsWidgetController {

    @ResponseStatus(HttpStatus.OK)
    @RequestMapping(value = "/api/v1/upload-document-widget", method = RequestMethod.POST)
    public void saveUploadDocumentWidget() {

    }
}
