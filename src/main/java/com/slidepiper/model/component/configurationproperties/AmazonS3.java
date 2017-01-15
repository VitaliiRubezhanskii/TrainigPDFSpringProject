package com.slidepiper.model.component.configurationproperties;
 
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;
 
@Component
@ConfigurationProperties("amazon.s3")
@Data
public class AmazonS3 { 
  private String accessKeyId;
  private String secretKey;
  private String bucket;
  private String prefix;
  private String domain;
}
