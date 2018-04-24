package com.slidepiper.controller.dashboard;

import org.json.JSONObject;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import slidepiper.db.DbLayer;

import java.security.Principal;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardCustomerController {
    /** @deprecated */
    @PostMapping("/api/v1/customers")
    public int addUpdateCustomer(Principal principal, @RequestBody String body) {
        JSONObject input = new JSONObject(body);

        return DbLayer.addNewCustomer(
                input.getString("subAction"),
                principal.getName(),
                input.getString("customerFirstName"),
                input.getString("customerLastName"),
                input.getString("customerCompany"),
                input.getString("customerGroup"),
                input.getString("customerEmail"),
                input.getString("customerID"),
                input.getString("customerPhone")
        );
    }

    /** @deprecated */
    @PostMapping("/api/v1/customer-delete")
    public void deleteCustomer(Principal principal, @RequestBody String body) {
        JSONObject input = new JSONObject(body);
        DbLayer.deleteCustomer(input.getString("customer_email"), principal.getName());
    }
}