package com.slidepiper.model.component.configurationproperties;
 
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;
 
@Component 
@ConfigurationProperties("amazon.sns.sns-customer-message")
@Data
public class AmazonSNSCustomerMessage {
  private String accessKeyId;
  private String secretKey;
}
