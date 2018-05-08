package com.slidepiper.controller.dashboard;

import com.slidepiper.repository.CustomerDocumentRepository;
import com.slidepiper.repository.DocumentRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import slidepiper.db.Analytics;
import slidepiper.db.DbLayer;

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

    @PostMapping("/api/v1/customer-documents")
    public String createChannel(Principal principal, @RequestParam(value = "customerEmail", required = false) String customerEmail) {
        JSONObject data = new JSONObject();

            JSONObject customer = new JSONObject();
            JSONArray files = new JSONArray();

            ArrayList<String> parameterList = new ArrayList<>();
            List<String[]> sqlData = new ArrayList<>();
            parameterList.add(principal.getName());
            parameterList.add(customerEmail);
            sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFilesListForCustomer);
            data.put("filesList", sqlData);

        return data.toString();
    }
}