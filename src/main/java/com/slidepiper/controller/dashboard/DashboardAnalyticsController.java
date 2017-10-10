package com.slidepiper.controller.dashboard;

import com.slidepiper.repository.DocumentRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import slidepiper.db.Analytics;
import slidepiper.db.DbLayer;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardAnalyticsController {
    private final DocumentRepository documentRepository;

    @Autowired
    public DashboardAnalyticsController(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    /** @deprecated */
    @GetMapping("/api/v1/analytics")
    public String analytics(Principal principal,
                            @RequestParam(value = "action") String action,
                            @RequestParam(value = "customerEmail", required = false) String customerEmail,
                            @RequestParam(value = "fileHash", required = false) String fileHash) {
        JSONObject data = new JSONObject();
        ArrayList<String> parameterList = new ArrayList<>();
        List<String[]> sqlData = new ArrayList<>();

        switch (action) {
            case "getFileData":
                if (documentRepository.findByFriendlyId(fileHash).getViewer().getEmail().equals(principal.getName())) {
                    parameterList.add(fileHash);
                    sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileData);
                    data.put("fileData", sqlData);
                }
                break;

            case "getFilesList":
                parameterList.add(principal.getName());
                sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFilesList);
                data.put("filesList", sqlData);
                break;

            case "getCustomersList":
                parameterList.add(principal.getName());
                sqlData = DbLayer.getEventData(parameterList, Analytics.sqlCustomersList);
                data.put("customersList", sqlData);
                break;

            case "getFileLinkHash":
                if (documentRepository.findByFriendlyId(fileHash).getViewer().getEmail().equals(principal.getName())) {
                    String salesmanEmail = principal.getName();
                    if (!DbLayer.isCustomerExist(salesmanEmail, customerEmail)) {
                        DbLayer.addNewCustomer(null, salesmanEmail, "Test", "Viewer", null, null, customerEmail);
                    }
                    String fileLinkHash = DbLayer.setFileLinkHash(customerEmail, fileHash, salesmanEmail);
                    data.put("fileLinkHash", fileLinkHash);
                }
                break;

            case "getCustomersFilesList":
                parameterList.add(principal.getName());
                sqlData = DbLayer.getEventData(parameterList, Analytics.sqlCustomersFilesList);
                data.put("customersFilesList", sqlData);
                break;

            case "getFileCustomerData":
                if (documentRepository.findByFriendlyId(fileHash).getViewer().getEmail().equals(principal.getName())) {
                    parameterList.add(fileHash);
                    parameterList.add(customerEmail);
                    sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileCustomerData);
                    data.put("fileCustomerData", sqlData);
                }
                break;

            case "getTopExitPage":
                if (documentRepository.findByFriendlyId(fileHash).getViewer().getEmail().equals(principal.getName())) {
                    parameterList.add(fileHash);
                    parameterList.add(principal.getName());
                    sqlData = DbLayer.getEventData(parameterList, Analytics.sqlTopExitPage);
                    data.put("topExitPage", sqlData);
                }
                break;

            case "getFileBarChart":
                if (documentRepository.findByFriendlyId(fileHash).getViewer().getEmail().equals(principal.getName())) {
                    parameterList.add(fileHash);
                    parameterList.add(principal.getName());
                    if (null == customerEmail || customerEmail.equals("")) {
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileBarChart);
                    } else {
                        parameterList.add(customerEmail);
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileCustomerBarChart);
                    }
                    data.put("fileBarChart", sqlData);
                }
                break;

            case "getFileLineChart":
                if (documentRepository.findByFriendlyId(fileHash).getViewer().getEmail().equals(principal.getName())) {
                    parameterList.add(fileHash);
                    parameterList.add(principal.getName());
                    if (null == customerEmail || customerEmail.equals("")) {
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileLineChart);
                    } else {
                        parameterList.add(customerEmail);
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileCustomerLineChart);
                    }
                    data.put("fileLineChart", sqlData);
                }
                break;

            case "getFileVisitorsMap":
                if (documentRepository.findByFriendlyId(fileHash).getViewer().getEmail().equals(principal.getName())) {
                    parameterList.add(fileHash);
                    parameterList.add(principal.getName());
                    if (null == customerEmail || customerEmail.equals("")) {
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileVisitorsMap);
                    } else {
                        parameterList.add(customerEmail);
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileCustomerVisitorsMap);
                    }
                    data.put("fileVisitorsMap", sqlData);
                }
                break;

            case "getVideoWidgetMetrics":
                if (documentRepository.findByFriendlyId(fileHash).getViewer().getEmail().equals(principal.getName())) {
                    parameterList.add(principal.getName());
                    parameterList.add(fileHash);
                    if (null == customerEmail || customerEmail.equals("")) {
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileTotalNumberYouTubePlays);
                    } else {
                        parameterList.add(customerEmail);
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileLinkTotalNumberYouTubePlays);
                    }
                    data.put("totalNumberYouTubePlays", sqlData);
                }
                break;

            case "getViewerWidgetAskQuestion":
                if (documentRepository.findByFriendlyId(fileHash).getViewer().getEmail().equals(principal.getName())) {
                    parameterList.add(principal.getName());
                    parameterList.add(fileHash);
                    if (null == customerEmail || customerEmail.equals("")) {
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileWidgetAskQuestion);
                    } else {
                        parameterList.add(customerEmail);
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileLinkWidgetAskQuestion);
                    }
                    data.put("widgetAskQuestion", sqlData);
                }
                break;

            case "getWidgetLikesCount":
                if (documentRepository.findByFriendlyId(fileHash).getViewer().getEmail().equals(principal.getName())) {
                    parameterList.add(principal.getName());
                    parameterList.add(fileHash);
                    if (null == customerEmail || customerEmail.equals("")) {
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileCountLikes);
                    } else {
                        parameterList.add(customerEmail);
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlCustomerCountLikes);
                    }
                    data.put("likesCount", sqlData);
                }
                break;

            case "getWidgetUniqueViewsCount":
                if (documentRepository.findByFriendlyId(fileHash).getViewer().getEmail().equals(principal.getName())) {
                    parameterList.add(principal.getName());
                    parameterList.add(fileHash);
                    if (null == customerEmail || customerEmail.equals("")) {
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileCountUniqueViews);
                    } else {
                        parameterList.add(customerEmail);
                        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlCustomerCountUniqueViews);
                    }
                    data.put("uniqueViewsCount", sqlData);
                }
                break;

            case "getNotifications":
                JSONArray notifications = DbLayer.getNotifications(principal.getName(), Analytics.sqlTableNotifications);
                data.put("notifications", notifications);
                break;
        }

        return data.toString();
    }
}