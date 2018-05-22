package com.slidepiper.controller.dashboard;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonParser;
import com.google.gson.internal.LinkedTreeMap;
import com.slidepiper.repository.CustomerDocumentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import slidepiper.db.Analytics;
import slidepiper.db.DbLayer;

import javax.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardCustomerDocumentController {
    private final CustomerDocumentRepository documentRepository;

    @Autowired
    public DashboardCustomerDocumentController(CustomerDocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    // Get portals for specific customer
    @GetMapping("/api/v1/customer-portals")
    public String getCustomerPortals(Principal principal, HttpServletRequest request) {
        JsonParser jsonParser = new JsonParser();
        String customersList = request.getParameter("customers");
        JsonArray arrayFromString = jsonParser.parse(customersList).getAsJsonArray();

        // Convert JSON Array String into Java Array List
        Gson googleJson = new Gson();
        ArrayList<String> customers = googleJson.fromJson(arrayFromString, ArrayList.class);

        JSONObject data = new JSONObject();

        List<String[]> sqlData = new ArrayList<>();
        for (String customerEmail : customers) {
            ArrayList<String> parameterList = new ArrayList<>();
            parameterList.add(principal.getName());
            parameterList.add(customerEmail);
            sqlData.addAll(DbLayer.getEventData(parameterList, Analytics.sqlPortalsListForCustomer));
        }
        data.put("portalsList", sqlData);

        return data.toString();
    }

    //Get all documents customer customer uploaded on specific portal
    @GetMapping("/api/v1/customer-documents")
    public String createChannel(Principal principal, HttpServletRequest request) {
        JsonParser jsonParser = new JsonParser();
        String customersList = request.getParameter("data");

        JsonArray arrayFromString = jsonParser.parse(customersList).getAsJsonArray();

        // Convert JSON Array String into Java Array List
        Gson googleJson = new Gson();
        ArrayList<LinkedTreeMap> customers = googleJson.fromJson(arrayFromString, ArrayList.class);

        JSONObject data = new JSONObject();

        List<String[]> sqlData = new ArrayList<>();
        for (LinkedTreeMap portalsForCustomer : customers) {
            sqlData.addAll(DbLayer.getDocumentsForSpecificPortal(principal.getName(), portalsForCustomer));
        }
        data.put("filesList", sqlData);

        return data.toString();
    }
}