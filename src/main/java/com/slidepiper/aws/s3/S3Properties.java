package com.slidepiper.aws.s3;
 
import org.springframework.boot.context.properties.ConfigurationProperties; 
import org.springframework.stereotype.Component;

import lombok.Data; 
 
@Component 
@ConfigurationProperties("aws.s3") 
@Data
public class S3Properties { 
  private String accessKeyId;
  private String secretKey;
  private String bucket;
  private String prefix;
  private String domain;
}
