package com.slidepiper.service;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClient;
import com.amazonaws.services.simpleemail.model.Body;
import com.amazonaws.services.simpleemail.model.Content;
import com.amazonaws.services.simpleemail.model.Destination;
import com.amazonaws.services.simpleemail.model.Message;
import com.amazonaws.services.simpleemail.model.SendEmailRequest;
import com.amazonaws.services.sns.AmazonSNSClient;
import com.amazonaws.services.sns.model.MessageAttributeValue;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;
import com.slidepiper.model.component.ConfigurationPropertiesUtils;
import com.slidepiper.model.input.CustomerMessage;

@Service
public class CustomerMessageService {

  private static final Logger log = LoggerFactory.getLogger(CustomerMessageService.class);
  
  public void sendMessage(CustomerMessage customerMessage) {
    try {
      sendSMSMessage(customerMessage);  
    } catch (Exception e) {
      e.printStackTrace();
    }
    
    try {
      sendEmailMessage(customerMessage);  
    } catch (Exception e) {
      e.getStackTrace();
    }
  }

  private void sendSMSMessage(CustomerMessage customerMessage) {
    AWSCredentials awsCredentials = new BasicAWSCredentials(
      ConfigurationPropertiesUtils.amazonSNSCustomerMessage.getAccessKeyId(),
      ConfigurationPropertiesUtils.amazonSNSCustomerMessage.getSecretKey()
    );
    AmazonSNSClient snsClient = new AmazonSNSClient(awsCredentials);
    
    String message = customerMessage.getSmsMessage();
    String phoneNumber = "+" + customerMessage.getPhoneNumber();
    Map<String, MessageAttributeValue> smsAttributes = 
        new HashMap<String, MessageAttributeValue>();

    smsAttributes.put("AWS.SNS.SMS.SenderID", new MessageAttributeValue()
        .withStringValue(customerMessage.getSenderId())
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
  
  private void sendEmailMessage(CustomerMessage customerMessage) {
    final String FROM = customerMessage.getEmailFromAddress();
    final String TO = customerMessage.getEmailToAddress();
    final String SUBJECT = customerMessage.getEmailSubject();
    final String BODY = customerMessage.getEmailBody();
    
    Destination destination = new Destination().withToAddresses(new String[]{TO});
    
    Content subject = new Content().withData(SUBJECT);
    Content textBody = new Content().withData(BODY); 
    Body body = new Body().withText(textBody);
    
    Message message = new Message().withSubject(subject).withBody(body);
    
    SendEmailRequest request = new SendEmailRequest().withSource(FROM).withDestination(destination).withMessage(message);
    try {
      AWSCredentials awsCredentials = new BasicAWSCredentials(
        ConfigurationPropertiesUtils.amazonSESCustomerMessage.getAccessKeyId(),
        ConfigurationPropertiesUtils.amazonSESCustomerMessage.getSecretKey()
      );
      AmazonSimpleEmailServiceClient client = new AmazonSimpleEmailServiceClient(awsCredentials);
      
      Region REGION = Region.getRegion(Regions.US_EAST_1);
      client.setRegion(REGION);
       
      // Send the email.
      client.sendEmail(request);  
      log.info("Email sent to " + TO);
    } catch (Exception ex) {
      System.out.println("The email was not sent.");
      System.out.println("Error message: " + ex.getMessage());
    }
  }
}
