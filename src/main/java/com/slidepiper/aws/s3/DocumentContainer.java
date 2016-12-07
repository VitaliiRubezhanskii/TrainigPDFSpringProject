package com.slidepiper.aws.s3;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.S3ClientOptions;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.DeleteObjectsRequest.KeyVersion;
import com.amazonaws.services.s3.model.ListVersionsRequest;
/*import com.amazonaws.services.s3.model.ObjectTagging;*/
import com.amazonaws.services.s3.model.PutObjectRequest;
/*import com.amazonaws.services.s3.model.S3ObjectSummary;*/
import com.amazonaws.services.s3.model.S3VersionSummary;
/*import com.amazonaws.services.s3.model.SetObjectTaggingRequest;
import com.amazonaws.services.s3.model.Tag;*/
import com.amazonaws.services.s3.model.VersionListing;
/*import com.slidepiper.document.DocumentProperties;*/
import com.slidepiper.document.DocumentStatus;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

@AllArgsConstructor
@RequiredArgsConstructor
public class DocumentContainer {
  final private String documentHash;
  private File document;
  private String documentName;
  
  /**
   * Upload a document to Amazon S3 document container and tag it
   * with status CREATED or UPDATED.
   * Tagging is not applicable yet.
   * @param documentStatus
   * 
   * @return s3ObjectVersionId - The S3 object version id of the uploaded document.
   */
  public String upload(DocumentStatus documentStatus) {
    if (DocumentStatus.UPDATED == documentStatus) {
      update(DocumentStatus.DISABLED);
    }
    
    AmazonS3 s3Client = S3Client.getS3Client();
    s3Client.setRegion(Region.getRegion(Regions.US_EAST_1));
    s3Client.setS3ClientOptions(S3ClientOptions.builder().setAccelerateModeEnabled(true).build());
    
    String bucket = ObjectLinkUtils.getBucket();
    String key = ObjectLinkUtils.getKey(documentHash, documentName);
    
    /*List<Tag> tagSet = new ArrayList<Tag>();
    tagSet.add(new Tag(DocumentProperties.STATUS, documentStatus.name()));*/
    
    String s3ObjectVersionId = null;
    try {
      s3Client.putObject(
          new PutObjectRequest(bucket, key, document)
              .withCannedAcl(CannedAccessControlList.PublicRead)
              /*.withTagging(tagSet)*/
      );
      
      System.out.println("SP: A document was uploaded to, " + documentHash + " document container");
      System.out.println("SP: bucket, " + bucket);
      System.out.println("SP: key, " + key);
      
      s3ObjectVersionId = s3Client.getObjectMetadata(bucket, key).getVersionId();
    } catch (AmazonServiceException ase) {
      System.out.println(ase.getErrorMessage());
    } catch (AmazonClientException ace) {
      System.out.println(ace.getMessage());
    }
    
    return s3ObjectVersionId;
  }
  
  /**
   * Fake delete all documents in a document container by setting their
   * ACL to private and tagging them with status DELETE.
   * Tagging is not applicable yet.
   */
  public void delete() {
    update(DocumentStatus.DELETED);
  }
  
  /**
   * Update latest version of documents with ACL and tagging.
   * Tagging is not applicable yet.
   */
  private void update(DocumentStatus documentStatus) {
    AmazonS3 s3Client = S3Client.getS3Client();
    List<KeyVersion> keysLatestVersion = getKeysLatestVersion(documentHash);
    
    /*List<Tag> tagSet = new ArrayList<Tag>();
    tagSet.add(new Tag(DocumentProperties.STATUS, documentStatus.name()));
    ObjectTagging objectTagging = new ObjectTagging(tagSet);*/
    
    for (KeyVersion keyVersion: keysLatestVersion) {
      if (documentStatus == DocumentStatus.DELETED
          || (documentStatus == DocumentStatus.DISABLED
          && ObjectLinkUtils.getKey(documentHash, documentName) != keyVersion.getKey())) {
        
        s3Client.setObjectAcl(
            ObjectLinkUtils.getBucket(),
            keyVersion.getKey(),
            CannedAccessControlList.Private
        );
        
        /*SetObjectTaggingRequest setObjectTaggingRequest = 
            new SetObjectTaggingRequest(
                ObjectLinkUtils.getBucket(),
                keyVersion.getKey(),
                keyVersion.getVersion(),
                objectTagging
            );
        s3Client.setObjectTagging(setObjectTaggingRequest);*/
      }
    }
  }
  
  /**
   * Get latest version of keys inside a document container.
   */
  private List<KeyVersion> getKeysLatestVersion(String documentHash) {
    AmazonS3 s3Client = S3Client.getS3Client();
    String bucketName = ObjectLinkUtils.getBucket();
    
    List<String> keys = new ArrayList<String>();
    List<KeyVersion> keysLatestVersion = new ArrayList<KeyVersion>();
    try {
      ListVersionsRequest request = new ListVersionsRequest()
          .withBucketName(bucketName)
          .withPrefix(ObjectLinkUtils.getPrefix(documentHash));
      
      VersionListing versionListing;
      do {
        versionListing = s3Client.listVersions(request);
        for (S3VersionSummary objectSummary:
            versionListing.getVersionSummaries()) {
          
          String key = objectSummary.getKey();
          String versionId = objectSummary.getVersionId();
          if (!keys.contains(key)) {
            KeyVersion keyVersion = new KeyVersion(key, versionId);
            keysLatestVersion.add(keyVersion);
            keys.add(key);
          }
        }
        request.setKeyMarker(versionListing.getNextKeyMarker());
        request.setVersionIdMarker(versionListing.getNextVersionIdMarker());
      } while (versionListing.isTruncated());
    } catch (AmazonServiceException ase) {
      System.out.println(ase.getErrorMessage());
    } catch (AmazonClientException ace) {
      System.out.println(ace.getMessage());
    }
    
    return keysLatestVersion;
  }
}
