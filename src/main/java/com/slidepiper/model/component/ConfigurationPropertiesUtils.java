package com.slidepiper.model.component;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.slidepiper.model.component.configurationproperties.AmazonS3;
import com.slidepiper.model.component.configurationproperties.AmazonSESCustomerMessage;
import com.slidepiper.model.component.configurationproperties.AmazonSNSCustomerMessage;

@Component
public class ConfigurationPropertiesUtils {
  
  public static AmazonS3 amazonS3;
  public static AmazonSESCustomerMessage amazonSESCustomerMessage;
  public static AmazonSNSCustomerMessage amazonSNSCustomerMessage;
  
  @Autowired
  public ConfigurationPropertiesUtils(AmazonS3 amazonS3,
      AmazonSESCustomerMessage amazonSESCustomerMessage,
      AmazonSNSCustomerMessage amazonSNSCustomerMessage) {
    
    ConfigurationPropertiesUtils.amazonS3 = amazonS3;
    ConfigurationPropertiesUtils.amazonSESCustomerMessage = amazonSESCustomerMessage;
    ConfigurationPropertiesUtils.amazonSNSCustomerMessage = amazonSNSCustomerMessage;
  }
}
