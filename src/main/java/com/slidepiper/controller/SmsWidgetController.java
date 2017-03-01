package com.slidepiper.controller;

import com.slidepiper.model.input.SmsWidgetInput;
import com.slidepiper.service.SmsWidgetService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@AllArgsConstructor(onConstructor = @__(@Autowired))
public class SmsWidgetController {
  private final SmsWidgetService smsWidgetService;
  
  @CrossOrigin(origins = "*")
  @PostMapping(value = "/utils/widgets/sms")
  public void handleSmsRequest(@Valid @RequestBody SmsWidgetInput smsWidgetInput) {
    smsWidgetService.sendSms(smsWidgetInput);
  }
}
