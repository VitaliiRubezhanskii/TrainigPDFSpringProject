package com.slidepiper.aws.s3;

import java.util.Objects;

public class ObjectLinkUtils {
  
  /**
   * Get AWS S3 bucket name.
   * 
   * e.g. If document link is https://slidepiper-documents.s3.amazonaws.com/production/documents/documnetHash/document.pdf
   * then bucket name is slidepiper-documents.
   */
  public static String getBucket() {
    return S3PropertiesComponent.properties.getBucket()
        .replaceAll("/$", "");
  }
  
  /**
   * Get AWS S3 predefined prefix name.
   * 
   * e.g. If document link is https://slidepiper-documents.s3.amazonaws.com/production/documents/documnetHash/document.pdf
   * then predefined prefix name is production/documents.
   */
  public static String getPrefix() {
    return S3PropertiesComponent.properties.getPrefix()
        .replaceAll("/$", "");
  }
  
  /**
   * Get AWS S3 predefined prefix name with document container.
   * 
   * e.g. If document link is https://slidepiper-documents.s3.amazonaws.com/production/documents/documnetHash/document.pdf
   * then predefined prefix name with document container is production/documents/documnetHash.
   */
  public static String getPrefix(String documentHash) {
    String prefix;
    
    if (Objects.nonNull(getPrefix())) {
      prefix = String.join("/", getPrefix(), documentHash);
    } else {
      prefix = String.join("/", documentHash);
    }
    
    return prefix;
  }
  
  /**
   * Get AWS S3 key name.
   * 
   * e.g. If document link is https://slidepiper-documents.s3.amazonaws.com/production/documents/documnetHash/document.pdf
   * then key name is production/documents/documnetHash/document.pdf.
   */
  public static String getKey(String documentHash, String documentName) {
    return String.join("/", getPrefix(documentHash), documentName);
  }
  
  /**
   * Get AWS S3 (or for example CloudFront) domain name.
   * 
   * e.g. If document link is https://slidepiper-documents.s3.amazonaws.com/production/documents/documnetHash/document.pdf
   * then domain name is https://slidepiper-documents.s3.amazonaws.com.
   */
  public static String getDomain() {
    return S3PropertiesComponent.properties.getDomain()
        .replaceAll("/$", "");
  }
}
