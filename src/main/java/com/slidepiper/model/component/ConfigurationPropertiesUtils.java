package com.slidepiper.model.component;

import com.slidepiper.model.component.configurationproperties.AmazonSNSCustomerMessage;
import com.slidepiper.model.component.configurationproperties.SpringProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ConfigurationPropertiesUtils {
    public static AmazonSNSCustomerMessage amazonSNSCustomerMessage;
    public static SpringProfiles springProfiles;

    @Autowired
    public ConfigurationPropertiesUtils(AmazonSNSCustomerMessage amazonSNSCustomerMessage,
                                        SpringProfiles springProfiles) {
        ConfigurationPropertiesUtils.amazonSNSCustomerMessage = amazonSNSCustomerMessage;
        ConfigurationPropertiesUtils.springProfiles = springProfiles;
    }
}