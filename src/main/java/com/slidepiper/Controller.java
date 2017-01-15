package com.slidepiper;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.slidepiper.model.resource.CustomerMessage;
import com.slidepiper.model.service.CustomerMessageService;

import slidepiper.db.DbLayer;

@RestController
public class Controller {
  
  private final CustomerMessageService customerMessageService;
  
  @Autowired
  public Controller(CustomerMessageService customerMessageService) {
    this.customerMessageService = customerMessageService;
  }
  
  @CrossOrigin(origins = "*")
  @PostMapping("/v1/viewer-events")
  public ResponseEntity<CustomerEvent> setCustomerEvent(@RequestBody CustomerEvent customerEvent) {
    
    long eventId = DbLayer.setCustomerEvent(customerEvent);
    
    if (eventId > 0) {
      return new ResponseEntity<CustomerEvent>(customerEvent,
          HttpStatus.CREATED);
    } else {
      return new ResponseEntity<CustomerEvent>(customerEvent,
          HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  @CrossOrigin(origins = "*")
  @PostMapping("/v1/customer-message")
  public void sendMessage(@Valid @RequestBody CustomerMessage customerMessage) {
    customerMessageService.sendMessage(customerMessage);
  }
}
