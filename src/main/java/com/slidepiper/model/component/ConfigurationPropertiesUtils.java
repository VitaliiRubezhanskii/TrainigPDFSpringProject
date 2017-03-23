package com.slidepiper.model.component;

import com.slidepiper.model.component.configurationproperties.AmazonSESCustomerMessage;
import com.slidepiper.model.component.configurationproperties.AmazonSNSCustomerMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ConfigurationPropertiesUtils {

  public static AmazonSESCustomerMessage amazonSESCustomerMessage;
  public static AmazonSNSCustomerMessage amazonSNSCustomerMessage;
  
  @Autowired
  public ConfigurationPropertiesUtils(AmazonSESCustomerMessage amazonSESCustomerMessage,
      AmazonSNSCustomerMessage amazonSNSCustomerMessage) {

    ConfigurationPropertiesUtils.amazonSESCustomerMessage = amazonSESCustomerMessage;
    ConfigurationPropertiesUtils.amazonSNSCustomerMessage = amazonSNSCustomerMessage;
  }
}
