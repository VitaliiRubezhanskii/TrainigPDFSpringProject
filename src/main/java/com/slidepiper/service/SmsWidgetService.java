package com.slidepiper.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.sns.AmazonSNSClient;
import com.amazonaws.services.sns.model.MessageAttributeValue;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;
import com.slidepiper.model.component.ConfigurationPropertiesUtils;
import com.slidepiper.model.entity.widget.SmsWidget;
import com.slidepiper.model.entity.widget.SmsWidgetData;
import com.slidepiper.model.exception.WidgetDisabledException;
import com.slidepiper.model.exception.WidgetNotFoundException;
import com.slidepiper.model.input.SmsWidgetInput;
import com.slidepiper.repository.widget.SmsWidgetRepository;

import slidepiper.db.DbLayer;

@Service
public class SmsWidgetService {
  private static final Logger log = LoggerFactory.getLogger(SmsWidgetService.class);
  
  @Autowired private SmsWidgetRepository smsWidgetRepository;
  
  public void sendSms(SmsWidgetInput smsWidgetInput) {
    SmsWidgetData smsWidgetData = getSmsWidgetDataByChannelName(smsWidgetInput.getChannelName());
    
    AWSCredentials awsCredentials = new BasicAWSCredentials(
      ConfigurationPropertiesUtils.amazonSNSCustomerMessage.getAccessKeyId(),
      ConfigurationPropertiesUtils.amazonSNSCustomerMessage.getSecretKey()
    );
    AmazonSNSClient snsClient = new AmazonSNSClient(awsCredentials);
    
    String message = smsWidgetData.getBody() + smsWidgetInput.getUrl();
    String phoneNumber = "+" + smsWidgetInput.getPhoneNumber();
    Map<String, MessageAttributeValue> smsAttributes = 
        new HashMap<String, MessageAttributeValue>();

    smsAttributes.put("AWS.SNS.SMS.SenderID", new MessageAttributeValue()
        .withStringValue(smsWidgetData.getSenderId())
        .withDataType("String"));
    smsAttributes.put("AWS.SNS.SMS.MaxPrice", new MessageAttributeValue()
        .withStringValue("0.1")
        .withDataType("Number"));
    smsAttributes.put("AWS.SNS.SMS.SMSType", new MessageAttributeValue()
        .withStringValue("Transactional")
        .withDataType("String"));
    
    PublishResult result =
        snsClient.publish(new PublishRequest()
            .withMessage(message)
            .withPhoneNumber(phoneNumber)
            .withMessageAttributes(smsAttributes));
    log.info("SMS sent to " + phoneNumber + " " + result);
  }
  
  private SmsWidgetData getSmsWidgetDataByChannelName(String channelName)
      throws WidgetDisabledException {
    
    long documentId = DbLayer.getFileIdFromFileLinkHash(channelName);
    SmsWidget smsWidget =
        Optional.ofNullable(smsWidgetRepository.findByDocumentId(documentId))
            .orElseThrow(() -> new WidgetNotFoundException());
    
    if (smsWidget.isEnabled()) {
      return smsWidget.getData();
    } else {
      throw new WidgetDisabledException();
    }
  }
}
