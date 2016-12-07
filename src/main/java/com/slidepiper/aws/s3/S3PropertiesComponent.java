package com.slidepiper.aws.s3;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class S3PropertiesComponent {
  
  public static S3Properties properties;
  
  @Autowired
  public S3PropertiesComponent(S3Properties properties) {
    S3PropertiesComponent.properties = properties;
  }
}
