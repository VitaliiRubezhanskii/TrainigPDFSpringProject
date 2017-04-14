package com.slidepiper.model.component;

import com.slidepiper.model.component.configurationproperties.AmazonSESCustomerMessage;
import com.slidepiper.model.component.configurationproperties.AmazonSNSCustomerMessage;
import com.slidepiper.model.component.configurationproperties.SpringProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ConfigurationPropertiesUtils {

  public static AmazonSESCustomerMessage amazonSESCustomerMessage;
  public static AmazonSNSCustomerMessage amazonSNSCustomerMessage;
  public static SpringProfiles springProfiles;
  
  @Autowired
  public ConfigurationPropertiesUtils(AmazonSESCustomerMessage amazonSESCustomerMessage,
      AmazonSNSCustomerMessage amazonSNSCustomerMessage,
      SpringProfiles springProfiles) {
    ConfigurationPropertiesUtils.amazonSESCustomerMessage = amazonSESCustomerMessage;
    ConfigurationPropertiesUtils.amazonSNSCustomerMessage = amazonSNSCustomerMessage;
    ConfigurationPropertiesUtils.springProfiles = springProfiles;
  }
}
