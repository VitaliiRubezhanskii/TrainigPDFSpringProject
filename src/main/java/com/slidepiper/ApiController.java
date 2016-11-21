package com.slidepiper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import slidepiper.db.DbLayer;

@RestController
public class ApiController {
  
  @CrossOrigin(origins = "*")
  @PostMapping("/v1/events")
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
}