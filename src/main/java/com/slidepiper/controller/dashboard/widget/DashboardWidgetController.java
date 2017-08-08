package com.slidepiper.controller.dashboard.widget;

import com.slidepiper.repository.DocumentRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import slidepiper.customer_servlets.DocumentShareServlet;
import slidepiper.db.DbLayer;

import java.io.IOException;
import java.security.Principal;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardWidgetController {
    private final DocumentRepository documentRepository;

    @Autowired
    public DashboardWidgetController(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    /** @deprecated */
    @GetMapping("/api/v1/widgets")
    public String getWidgetsConfiguration(Principal principal,
                                          @RequestBody @RequestParam("fileHash") String documentFriendlyId) {
        if (documentRepository.findByFriendlyId(documentFriendlyId).getViewer().getEmail().equals(principal.getName())) {
            long documentId = documentRepository.findByFriendlyId(documentFriendlyId).getId();
            return DbLayer.getWidgetsSettings(documentId).toString();
        } else {
            return null;
        }
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

                resultCode = DbLayer.setWidgetSettings(widgetSetting, input.getString("fileHash"));
            }
        }

        return resultCode;
    }
}