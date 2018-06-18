package com.slidepiper.controller.dashboard;

import com.slidepiper.model.customer.Customer;
import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.Viewer;
import com.slidepiper.repository.CustomerRepository;
import com.slidepiper.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import slidepiper.config.ConfigProperties;

import java.security.Principal;
import java.util.List;

@RestController
public class DocumentCustomerPortalPermissionController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DocumentRepository documentRepository;


    @GetMapping("/portals/customers")
    public List<Customer> getCustomersForSelection(Principal principal){
        System.out.println(principal.getName());
        return customerRepository.findCustomerBySalesMan(principal.getName());
    }

    @GetMapping("/portals/portals")
    public List<Document> getPortalsForSelection(Principal principal){
          return documentRepository.findDocumentBySalesManEmail(principal.getName());
    }

    @PostMapping("/api/v1/portals/customers")
    public void choosePortals(List<Document> documents){


    }






}
