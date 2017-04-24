package com.slidepiper.service.amazon;

import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.S3ClientOptions;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.CopyObjectRequest;
import com.amazonaws.services.s3.model.DeleteObjectsRequest;
import com.amazonaws.services.s3.model.ListVersionsRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3VersionSummary;
import com.amazonaws.services.s3.model.VersionListing;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class AmazonS3Service {
    private static final Logger log = LoggerFactory.getLogger(AmazonS3Service.class);

    @Value("${amazon.s3.credentials.accessKey}") private String accessKey;
    @Value("${amazon.s3.credentials.secretKey}") private String secretKey;

    public String upload(MultipartFile multipartFile, String bucket, String key) throws IOException {
        AmazonS3 s3Client = getAmazonS3Client();

        s3Client.setRegion(Region.getRegion(Regions.US_EAST_1));
        s3Client.setS3ClientOptions(S3ClientOptions.builder().setAccelerateModeEnabled(true).build());

        try {
            ObjectMetadata objectMetaData = new ObjectMetadata();
            objectMetaData.setContentType(multipartFile.getContentType());
            objectMetaData.setContentLength(multipartFile.getSize());

            s3Client.putObject(
                    new PutObjectRequest(bucket, key, multipartFile.getInputStream(), objectMetaData)
                            .withCannedAcl(CannedAccessControlList.PublicRead)
            );

            log.info("Uploaded object to: " + String.join("/", bucket, key));
        } catch (AmazonServiceException ase) {
            System.out.println(ase.getErrorMessage());
        } catch (AmazonClientException ace) {
            System.out.println(ace.getMessage());
        }

        return s3Client.getObjectMetadata(bucket, key).getVersionId();
    }

    public String clone(String bucket, String sourceKey, String destinationKey) {
        AmazonS3 s3Client = getAmazonS3Client();

        CopyObjectRequest copyObjectRequest =
                new CopyObjectRequest(bucket, sourceKey, bucket, destinationKey)
                        .withCannedAccessControlList(CannedAccessControlList.PublicRead);
        s3Client.copyObject(copyObjectRequest);

        log.info("Cloned object from: {}/{}, to: {}/{}", bucket, sourceKey, bucket, destinationKey);

        return s3Client.getObjectMetadata(bucket, destinationKey).getVersionId();
    }

    private AmazonS3 getAmazonS3Client() {
        AWSCredentials awsCredentials = new BasicAWSCredentials(accessKey, secretKey);
        AmazonS3 amazonS3Client = new AmazonS3Client(awsCredentials);

        return amazonS3Client;
    }

    public List<DeleteObjectsRequest.KeyVersion> getKeysLatestVersion(String bucket, String prefix) {
        AmazonS3 amazonS3Client = getAmazonS3Client();

        List<String> keys = new ArrayList<String>();
        List<DeleteObjectsRequest.KeyVersion> keysLatestVersion = new ArrayList<>();
        try {
            ListVersionsRequest request = new ListVersionsRequest()
                    .withBucketName(bucket)
                    .withPrefix(prefix);

            VersionListing versionListing;
            do {
                versionListing = amazonS3Client.listVersions(request);
                for (S3VersionSummary objectSummary:
                        versionListing.getVersionSummaries()) {

                    String key = objectSummary.getKey();
                    String versionId = objectSummary.getVersionId();
                    if (!keys.contains(key)) {
                        DeleteObjectsRequest.KeyVersion keyVersion = new DeleteObjectsRequest.KeyVersion(key, versionId);
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

    public void disableKeysLatestVersion(String bucket, List<DeleteObjectsRequest.KeyVersion> keysLatestVersion) {
        AmazonS3 amazonS3Client = getAmazonS3Client();

        for (DeleteObjectsRequest.KeyVersion keyVersion: keysLatestVersion) {
            amazonS3Client.setObjectAcl(
                    bucket,
                    keyVersion.getKey(),
                    CannedAccessControlList.Private
            );
        }
    }
}