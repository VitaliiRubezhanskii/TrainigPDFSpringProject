package com.slidepiper.aws.s3;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.slidepiper.model.component.ConfigurationPropertiesUtils;

public class S3Client {
  
  /**
   * Create an AWS S3 client.
   */
  static AmazonS3 getS3Client() {
    AWSCredentials awsCredentials = new BasicAWSCredentials(
      ConfigurationPropertiesUtils.amazonS3.getAccessKeyId(),
      ConfigurationPropertiesUtils.amazonS3.getSecretKey()
    );
    AmazonS3 s3Client = new AmazonS3Client(awsCredentials);
    
    return s3Client;
  }
}
