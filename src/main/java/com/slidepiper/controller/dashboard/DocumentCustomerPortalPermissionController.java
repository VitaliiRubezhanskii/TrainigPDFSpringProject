package com.slidepiper.controller.dashboard;

import com.slidepiper.dto.CustomerSlideDTO;
import com.slidepiper.model.customer.Customer;
import com.slidepiper.model.customer.CustomerSlide;
import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.Viewer;
import com.slidepiper.repository.CustomerRepository;
import com.slidepiper.repository.CustomerSlideRepository;
import com.slidepiper.repository.DocumentRepository;
import com.slidepiper.repository.ViewerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DocumentCustomerPortalPermissionController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private CustomerSlideRepository customerSlideRepository;

    @Autowired
    private ViewerRepository viewerRepository;


    @GetMapping(value = "/portals/customers",
            produces = "application/json; charset=UTF-8")
    public ResponseEntity<List<Customer>> getCustomersForSelection(Principal principal){
        List<Customer> foundCustomers=customerRepository
                .findCustomerBySalesMan(principal.getName());
            return new ResponseEntity<>(foundCustomers, HttpStatus.OK);


    }

    @GetMapping(value = "/portals/portals",
                produces = "application/json; charset=UTF-8")
    public ResponseEntity<List<Document>> getPortalsForSelection(Principal principal){
        List<Document> foundDocuments=documentRepository.findDocumentByViewer(viewerRepository.findByEmail(principal.getName()));
            return new ResponseEntity<>(foundDocuments, HttpStatus.OK);

    }

    @PostMapping(value = "/portals/portals",
            produces = "application/json; charset=UTF-8",
            consumes = "application/json")
    public ResponseEntity<List<Document>> choosePortalsForCustomer(@RequestBody CustomerSlideDTO customerSlideDTO){
          String customerEmail=customerSlideDTO.getCustomer().getEmail();
          List<Document>documents=customerSlideDTO.getDocumentList();

          documents.forEach(document -> customerSlideRepository.save(
                new CustomerSlide(customerEmail,document.getFriendlyId()))
               );
          return new ResponseEntity<>(documents,HttpStatus.OK);
    }



    @DeleteMapping(value ="/portals/portals",
                   produces = "application/json; charset=UTF-8")
    public ResponseEntity<List<CustomerSlide>>detachPortalsFromCustomer(@RequestBody CustomerSlideDTO customerSlideDTO){
        String customerEmail=customerSlideDTO.getCustomer().getEmail();
        List<CustomerSlide> customerSlideList=customerSlideRepository.getCustomerSlideByCustomerMail(customerEmail);
        customerSlideList.forEach(customerSlide ->  customerSlideRepository.deleteByCustomerEmail(customerEmail));
        return new ResponseEntity<>(customerSlideList,HttpStatus.OK);
    }






}
