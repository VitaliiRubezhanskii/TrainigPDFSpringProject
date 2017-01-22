package com.slidepiper;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.slidepiper.model.component.resource.ViewerConfiguration;
import com.slidepiper.model.resource.CustomerMessage;
import com.slidepiper.model.service.CustomerMessageService;

@RestController
public class Controller {
  
  private final CustomerMessageService customerMessageService;
  private final ViewerConfiguration viewerConfiguration;
  
  @Autowired
  public Controller(CustomerMessageService customerMessageService,
      ViewerConfiguration viewerConfiguration) {
    
    this.customerMessageService = customerMessageService;
    this.viewerConfiguration = viewerConfiguration;
  }
  
  @CrossOrigin(origins = "*")
  @PostMapping("/v1/customer-message")
  public void sendMessage(@Valid @RequestBody CustomerMessage customerMessage) {
    customerMessageService.sendMessage(customerMessage);
  }
  
  @CrossOrigin(origins = "*")
  @GetMapping("/v1/viewer-configuration")
  public ViewerConfiguration viewerConfiguration() {
    return viewerConfiguration;
  }
}
