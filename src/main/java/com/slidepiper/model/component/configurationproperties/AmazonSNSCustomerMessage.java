package com.slidepiper.model.component.configurationproperties;
 
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;
 
@Component 
@ConfigurationProperties("slidepiper.amazon")
@Data
public class AmazonSNSCustomerMessage {
  private String accessKey;
  private String secretKey;
}
