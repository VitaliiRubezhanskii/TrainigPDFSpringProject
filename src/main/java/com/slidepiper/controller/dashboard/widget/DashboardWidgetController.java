package com.slidepiper.controller.dashboard.widget;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.exception.WidgetNotFoundException;
import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.widget.HopperWidget;
import com.slidepiper.model.entity.widget.LinkWidget;
import com.slidepiper.model.entity.widget.Widget;
import com.slidepiper.repository.DocumentRepository;
import com.slidepiper.widget.WidgetRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import slidepiper.customer_servlets.DocumentShareServlet;
import slidepiper.db.DbLayer;

import java.io.IOException;
import java.security.Principal;
import java.util.Objects;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardWidgetController {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final DocumentRepository documentRepository;
    private final WidgetRepository widgetRepository;

    @Autowired
    private DbLayer dbLayer;

    @Autowired
    public DashboardWidgetController(DocumentRepository documentRepository,
                                     WidgetRepository widgetRepository) {
        this.documentRepository = documentRepository;
        this.widgetRepository = widgetRepository;
    }

    /** @deprecated */
    @GetMapping("/api/v1/widgets")
    public String getWidgetsConfiguration(Principal principal,
                                          @RequestParam("fileHash") String documentFriendlyId,
                                          @RequestParam(value = "type", required = false) String type) throws JsonProcessingException {
        Document document = documentRepository.findByFriendlyId(documentFriendlyId);
        if (document.getViewer().getEmail().equals(principal.getName())) {
            if (Objects.isNull(type)) {
                return DbLayer.getWidgetsSettings(document.getId()).toString();
            } else {
                Widget widget = widgetRepository.findByDocumentAndType(document, type);
                if (Objects.nonNull(widget)) {
                    return objectMapper.writeValueAsString(widget);
                } else {
                    throw new WidgetNotFoundException();
                }
            }
        }

        return null;
    }

    /** @deprecated */
    @PostMapping("/api/v1/widgets")
    public int saveWidgetsConfiguration(Principal principal, @RequestBody String body) throws IOException {

        JSONObject input = new JSONObject(body);
        JSONArray widgetsSettings = input.getJSONArray("widgetsSettings");
        int resultCode = 0;

        if (documentRepository.findByFriendlyId(input.getString("fileHash")).getViewer().getEmail().equals(principal.getName())) {
            for (int i = 0; i < widgetsSettings.length(); i++) {
                JSONObject widgetSetting = widgetsSettings.getJSONObject(i);
                JSONArray items = widgetSetting.getJSONObject("data").getJSONArray("items");
                JSONObject widgetData = widgetSetting.getJSONObject("data");

                if (widgetData.getInt("widgetId") == 11) {
                    if (items.getJSONObject(0).has("imageBase64")
                            && null != items.getJSONObject(0).getString("imageBase64")
                            && !items.getJSONObject(0).getString("imageBase64").equals("")) {
                        String imageUrl = DocumentShareServlet.getS3ImageUrl(
                                input.getString("fileHash"),
                                items.getJSONObject(0).getString("imageBase64"),
                                items.getJSONObject(0).getString("imageFileName")
                        );

                        if (null != imageUrl && !imageUrl.equals("")) {
                            items.getJSONObject(0).remove("imageBase64");
                            items.getJSONObject(0).remove("imageFileName");
                            items.getJSONObject(0).put("imageUrl", imageUrl);
                        }
                    } else {
                        if (items.getJSONObject(0).getString("imageUrl").equals("")) {
                            items.getJSONObject(0).put("imageUrl", "https://static.slidepiper.com/images/slidepiper/logo-1200x630.png");
                        }
                    }
                }

                resultCode = dbLayer.setWidgetSettings(widgetSetting, input.getString("fileHash"));
            }
        }

        return resultCode;
    }

    @PatchMapping("/api/v1/widgets/{widgetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateWidget(Principal principal,
                             @PathVariable("widgetId") long id,
                             @RequestBody String body) throws IOException {
        JsonNode jsonNode = objectMapper.readTree(body);
        Widget widget = widgetRepository.findById(id);

        if (widget.getDocument().getViewer().getEmail().equals(principal.getName())) {
            switch (jsonNode.get("type").asText()) {
                case "5":
                    HopperWidget hopperWidget = (HopperWidget) widget;
                    ((ObjectNode) hopperWidget.getData().get("data")).set("items", jsonNode.get("items"));
                    break;

                case "9":
                    LinkWidget linkWidget = (LinkWidget) widget;
                    ((ObjectNode) linkWidget.getData().get("data")).set("items", jsonNode.get("items"));
                    break;
            }
            widgetRepository.save(widget);
        }
    }
}