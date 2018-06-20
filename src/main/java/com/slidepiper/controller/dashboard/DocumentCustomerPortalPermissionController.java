package com.slidepiper.controller.dashboard;

import com.slidepiper.dto.CustomerSlideDTO;
import com.slidepiper.model.customer.Customer;
import com.slidepiper.model.entity.Document;
import com.slidepiper.repository.CustomerRepository;
import com.slidepiper.repository.DocumentRepository;
import com.slidepiper.repository.ViewerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;

@RestController
public class DocumentCustomerPortalPermissionController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private ViewerRepository viewerRepository;


    @GetMapping(value = "/portal-assignment/customers",
            produces = "application/json; charset=UTF-8")
    public ResponseEntity<List<Customer>> getCustomersForSelection(Principal principal){
        List<Customer> foundCustomers=customerRepository
                .findCustomerBySalesMan(principal.getName());
            return new ResponseEntity<>(foundCustomers, HttpStatus.OK);


    }

    @GetMapping(value = "/portal-assignment/portals",
            produces = "application/json; charset=UTF-8")
    public ResponseEntity<List<Document>> getPortalsForSelection(Principal principal){
        List<Document> foundDocuments=documentRepository.findDocumentBySalesManEmail(principal.getName());
            return new ResponseEntity<>(foundDocuments, HttpStatus.OK);

    }

    @PostMapping(value = "/portal-assignment/portals")
    public ResponseEntity<String[]> choosePortalsForCustomer(@RequestBody CustomerSlideDTO customerSlideDTO){
          String customerEmail=customerSlideDTO.getCustomerEmail();
          String[] documents=customerSlideDTO.getDocumentList();

          List<String> friendlyIDs = Arrays.asList(documents);

          Customer customer = customerRepository.findCustomerByEmail(customerEmail);

          friendlyIDs.forEach(documentFriendlyId -> customer.getDocuments().add(documentRepository.findByFriendlyId(documentFriendlyId)));
          customerRepository.save(customer);
          return new ResponseEntity<>(documents,HttpStatus.OK);
    }



    /*@DeleteMapping(value ="/portals/portals",
                   produces = "application/json; charset=UTF-8")
    public ResponseEntity<List<CustomerSlide>>detachPortalsFromCustomer(@RequestBody CustomerSlideDTO customerSlideDTO){
        String customerEmail=customerSlideDTO.getCustomer().getEmail();
        List<CustomerSlide> customerSlideList=customerSlideRepository.getCustomerSlideByCustomerMail(customerEmail);
        customerSlideList.forEach(customerSlide ->  customerSlideRepository.deleteByCustomerEmail(customerEmail));
        return new ResponseEntity<>(customerSlideList,HttpStatus.OK);
    }*/






}
