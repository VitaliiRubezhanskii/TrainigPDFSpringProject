package com.slidepiper.model.resource;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import org.hibernate.validator.constraints.Email;

import lombok.Data;

@Data
public class CustomerMessage {
  @NotNull @Email private final String emailFromAddress;
  @NotNull @Email private final String emailToAddress;
  @NotNull private final String emailSubject;
  @NotNull private final String emailBody;
  
  // TODO: Add further validation.
  // @see http://docs.aws.amazon.com/sns/latest/dg/sms_publish-to-phone.html#sms_publish_sdk 
  @NotNull @Size(min = 9, max = 12) private final String phoneNumber;
  @NotNull @Size(min = 1, max = 11) private final String senderId;
  @NotNull private final String smsMessage;
}
