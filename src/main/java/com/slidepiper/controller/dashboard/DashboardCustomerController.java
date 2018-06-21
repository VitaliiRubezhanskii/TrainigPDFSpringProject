package com.slidepiper.controller.dashboard;

import com.slidepiper.dto.CustomerDTO;
import com.slidepiper.model.customer.Customer;
import com.slidepiper.repository.CustomerRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import slidepiper.db.DbLayer;

import java.security.Principal;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardCustomerController {


    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
     private DbLayer dbLayer;
//
//    /** @deprecated */
//    @PostMapping("/api/v1/customers")
//    public int addUpdateCustomer(Principal principal, @RequestBody String body) {
//        JSONObject input = new JSONObject(body);
//
//        return dbLayer.addNewCustomer(
//                input.getString("subAction"),
//                principal.getName(),
//                input.getString("customerFirstName"),
//                input.getString("customerLastName"),
//                input.getString("customerCompany"),
//                input.getString("customerGroup"),
//                input.getString("customerEmail"),
//                input.getString("customerID"),
//                input.getString("customerPhone")
//        );
//    }


    /** @deprecated */
    @PostMapping("/api/v1/customers")
    public int addUpdateCustomer(Principal principal, @RequestBody CustomerDTO customerDTO) {
        customerDTO.setSalesMan(principal.getName());
        return dbLayer.addNewCustomer(customerDTO);
    }

//    /** @deprecated */
//    @PostMapping("/api/v1/customer-delete")
//    public void deleteCustomer(Principal principal, @RequestBody String body) {
//        JSONObject input = new JSONObject(body);
//        DbLayer.deleteCustomer(input.getString("customer_email"), principal.getName());
//    }


    @PostMapping("/api/v1/customer-delete")
    public void deleteCustomer(Principal principal, @RequestBody Customer customer) {
          customerRepository.deleteCustomerByEmailAndSalesMan(customer.getEmail(),principal.getName());
    }



}