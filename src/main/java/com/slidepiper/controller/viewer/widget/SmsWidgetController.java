package com.slidepiper.controller.viewer.widget;

import com.slidepiper.model.input.widget.SmsWidgetInput;
import com.slidepiper.service.viewer.widget.SmsWidgetService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.io.IOException;

@RestController
@AllArgsConstructor(onConstructor = @__(@Autowired))
public class SmsWidgetController {
  private final SmsWidgetService smsWidgetService;
  
  @CrossOrigin(origins = "*")
  @PostMapping(value = "/utils/widgets/sms")
  public void handleSmsRequest(@Valid @RequestBody SmsWidgetInput smsWidgetInput) throws IOException {
    smsWidgetService.sendSms(smsWidgetInput);
  }
}
