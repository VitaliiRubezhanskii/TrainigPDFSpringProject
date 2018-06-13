package com.slidepiper.controller.dashboard.widget;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.gson.Gson;
import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.widget.UploadDocumentWidget;
import com.slidepiper.model.entity.widget.UploadDocumentWidgetDocsTemplate;
import com.slidepiper.model.entity.widget.Widget;
import com.slidepiper.model.input.widget.UploadFileWidgetInput;
import com.slidepiper.repository.DocumentRepository;
import com.slidepiper.repository.UploadDocumentWidgetDocsTemplateRepository;
import com.slidepiper.repository.UploadDocumentWidgetRepository;
import com.slidepiper.repository.ViewerRepository;
import org.hibernate.boot.jaxb.SourceType;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLDecoder;
import java.security.Principal;
import java.util.*;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class UploadDocumentsWidgetController {

    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private ViewerRepository salesManRepository;
    @Autowired
    private UploadDocumentWidgetRepository uploadDocumentWidgetRepository;
    @Autowired
    private UploadDocumentWidgetDocsTemplateRepository uploadDocumentWidgetDocsTemplateRepository;
    @Autowired
    private ObjectMapper objectMapper;

    public UploadDocumentsWidgetController() {
    }

    @ResponseStatus(HttpStatus.OK)
    @RequestMapping(value = "/api/v1/upload-document-widget/{friendlyId}", method = RequestMethod.GET)
    public ObjectNode getUploadDocumentWidget(Principal principal,
                                         @PathVariable("friendlyId") String documentFriendlyId) {
        if (documentRepository.findByFriendlyId(documentFriendlyId).getViewer().getEmail().equals(principal.getName())) {
            Document doc = documentRepository.findByFriendlyId(documentFriendlyId);
            if (doc != null) {
                UploadDocumentWidget widget = uploadDocumentWidgetRepository.findByDocument(doc);
                if (widget != null) {
                    ObjectNode objectNode = objectMapper.createObjectNode();
                    objectNode.put("widgetId", widget.getId());
                    objectNode.put("icon", widget.getIcon());
                    objectNode.put("pageFrom", widget.getPageFrom());
                    objectNode.put("pageTo", widget.getPageTo());
                    objectNode.put("buttonText1", widget.getButtonText1());
                    objectNode.put("buttonText2", widget.getButtonText2());
                    objectNode.put("isEnabled", widget.isEnabled());LinkedHashMap<String, Object>[] docs;

                    List<LinkedHashMap> docsList = new ArrayList<>();

                    for (UploadDocumentWidgetDocsTemplate template : uploadDocumentWidgetDocsTemplateRepository.getAllByWidgetAndDeleted(widget, false)) {
                        LinkedHashMap<String, Object> tempData = new LinkedHashMap<>();
                        tempData.put("docName", template.getDocumentName());
                        tempData.put("docId", template.getId());
                        tempData.put("isUpdate", template.isCanUpdate());
                        docsList.add(tempData);
                    }

                    ArrayNode arrayNode = objectMapper.valueToTree(docsList);
                            objectNode.putArray("documents").addAll(arrayNode);
                    return objectNode;
                }
                return null;
            }
        }
        return null;
    }

    @ResponseStatus(HttpStatus.OK)
    @RequestMapping(value = "/api/v1/upload-document-widget/{friendlyId}", method = RequestMethod.POST)
    public void saveUploadDocumentWidget(Principal principal,
                                         @PathVariable("friendlyId") String documentFriendlyId, @RequestBody UploadFileWidgetInput body) throws UnsupportedEncodingException {
        if (documentRepository.findByFriendlyId(documentFriendlyId).getViewer().getEmail().equals(principal.getName())) {
            Document doc = documentRepository.findByFriendlyId(documentFriendlyId);
            if (doc != null) {

                UploadDocumentWidget widget;

                if (body.getWidgetId() != 0) {
                    widget = uploadDocumentWidgetRepository.findById(body.getWidgetId());
                } else {
                    widget = new UploadDocumentWidget();
                    widget.setSalesMan(salesManRepository.findByEmail(principal.getName()));
                    widget.setDocument(documentRepository.findByFriendlyId(documentFriendlyId));
                }

                widget.setIcon(body.getIcon());
                widget.setPageFrom(body.getPageFrom());
                widget.setPageTo(body.getPageTo());
                widget.setButtonText1(body.getButtonText1());
                widget.setButtonText2(body.getButtonText2());
                widget.setEnabled(body.getIsEnabled());
                uploadDocumentWidgetRepository.save(widget);

                List<UploadDocumentWidgetDocsTemplate> templatesToUpdate = uploadDocumentWidgetDocsTemplateRepository.getAllByWidget(widget);
                for (int i = 0; i < body.getDocuments().length; i++) {
                    HashMap<String, Object> map = (HashMap<String, Object>) body.getDocuments()[i];
                    UploadDocumentWidgetDocsTemplate template = new UploadDocumentWidgetDocsTemplate();
                    int docId = Integer.valueOf((String) map.get("docId"));
                    if (docId != 0) {
                        template = uploadDocumentWidgetDocsTemplateRepository.findById(docId);
                    } else {
                        template = uploadDocumentWidgetDocsTemplateRepository.findByDocumentNameAndWidget((String) map.get("docName"), widget);
                    }

                    if (template != null) {
                        template.setDocumentName((String) map.get("docName"));
                        template.setCanUpdate((Boolean) map.get("isUpdate"));
                        templatesToUpdate.remove(template);
                    } else {
                        template = new UploadDocumentWidgetDocsTemplate(widget, (String) map.get("docName"), (Boolean) map.get("isUpdate"), false);
                    }
                    uploadDocumentWidgetDocsTemplateRepository.save(template);

                    if (templatesToUpdate.size() > 0) {
                        for (UploadDocumentWidgetDocsTemplate tmpl : templatesToUpdate) {
                            tmpl.setDeleted(true);
                        }
                    }
                }
            }
        }
    }

    private static boolean cmp( List<?> l1, List<?> l2 ) {
        // make a copy of the list so the original list is not changed, and remove() is supported
        ArrayList<?> cp = new ArrayList<>( l1 );
        for ( Object o : l2 ) {
            if ( !cp.remove( o ) ) {
                return false;
            }
        }
        return cp.isEmpty();
    }
}
