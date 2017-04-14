package com.slidepiper.model.component.configurationproperties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component 
@ConfigurationProperties("spring.profiles")
@Data
public class SpringProfiles {
  private String active;
}
