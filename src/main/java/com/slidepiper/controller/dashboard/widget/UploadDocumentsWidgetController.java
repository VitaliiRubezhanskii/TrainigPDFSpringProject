package com.slidepiper.controller.dashboard.widget;

import com.google.gson.Gson;
import com.slidepiper.model.entity.widget.UploadDocumentWidget;
import com.slidepiper.model.input.widget.UploadFileWidgetInput;
import com.slidepiper.repository.DocumentRepository;
import com.slidepiper.repository.UploadDocumentWidgetRepository;
import com.slidepiper.repository.ViewerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLDecoder;
import java.security.Principal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class UploadDocumentsWidgetController {

    private final DocumentRepository documentRepository;
    private final ViewerRepository salesManRepository;
    private final UploadDocumentWidgetRepository uploadDocumentWidgetRepository;

    @Autowired
    public UploadDocumentsWidgetController(DocumentRepository documentRepository, ViewerRepository salesManRepository,
                                           UploadDocumentWidgetRepository uploadDocumentWidgetRepository) {
        this.documentRepository = documentRepository;
        this.salesManRepository = salesManRepository;
        this.uploadDocumentWidgetRepository = uploadDocumentWidgetRepository;
    }

    @ResponseStatus(HttpStatus.OK)
    @RequestMapping(value = "/api/v1/upload-document-widget/{friendlyId}", method = RequestMethod.POST)
    public void saveUploadDocumentWidget(Principal principal,
                                         @PathVariable("friendlyId") String documentFriendlyId, @RequestBody UploadFileWidgetInput body) throws UnsupportedEncodingException {
        if (documentRepository.findByFriendlyId(documentFriendlyId).getViewer().getEmail().equals(principal.getName())) {


            UploadDocumentWidget widget = new UploadDocumentWidget();
            widget.setSalesMan(salesManRepository.findByEmail(principal.getName()));
            widget.setDocument(documentRepository.findByFriendlyId(documentFriendlyId));
            widget.setIcon(body.getIcon());
            widget.setPageFrom(body.getPageFrom());
            widget.setPageTo(body.getPageTo());
            widget.setButtonText1(body.getButtonText1());
            widget.setButtonText2(body.getButtonText2());
            widget.setEnabled(body.isEnabled());
            uploadDocumentWidgetRepository.save(widget);
        }
    }

    public static Map<String, String> splitQuery(URL url) throws UnsupportedEncodingException {
        Map<String, String> query_pairs = new LinkedHashMap<String, String>();
        String query = url.getQuery();
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            query_pairs.put(URLDecoder.decode(pair.substring(0, idx), "UTF-8"), URLDecoder.decode(pair.substring(idx + 1), "UTF-8"));
        }
        return query_pairs;
    }
}
