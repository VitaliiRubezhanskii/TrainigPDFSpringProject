package com.slidepiper.service.amazon;

import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.CopyObjectRequest;
import com.amazonaws.services.s3.model.CopyObjectResult;
import com.amazonaws.services.s3.model.DeleteObjectsRequest;
import com.amazonaws.services.s3.model.ListVersionsRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.PutObjectResult;
import com.amazonaws.services.s3.model.S3VersionSummary;
import com.amazonaws.services.s3.model.VersionListing;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class AmazonS3Service {
    private static final Logger log = LoggerFactory.getLogger(AmazonS3Service.class);

    private final String accessKey;
    private final String secretKey;

    public AmazonS3Service(@Value("${slidepiper.amazon.accessKey}") String accessKey,
                           @Value("${slidepiper.amazon.secretKey}") String secretKey) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
    }

    public enum ObjectMetaData {
        VERSION_ID,
        E_TAG
    }

    public void upload(File file, String bucket, String key, CannedAccessControlList cannedAccessControlList) {
        AmazonS3 s3Client = getAmazonS3Client();

        PutObjectRequest putObjectRequest =
                new PutObjectRequest(bucket, key, file).withCannedAcl(cannedAccessControlList);
        s3Client.putObject(putObjectRequest);

        log.info("Uploaded object to bucket: {}", bucket);
    }

    public String upload(MultipartFile multipartFile, String contentType, String bucket, String key, ObjectMetaData objectMetaData)
            throws IOException {
        PutObjectResult putObjectResult = upload(multipartFile, contentType, bucket, key);

        if (Objects.nonNull(objectMetaData)) {
            switch (objectMetaData) {
                case E_TAG:
                    return putObjectResult.getETag();
                case VERSION_ID:
                    return putObjectResult.getVersionId();
                default:
                    return putObjectResult.getETag();
            }
        } else {
            return putObjectResult.getETag();
        }
    }

    private PutObjectResult upload(MultipartFile multipartFile, String contentType, String bucket, String key) throws IOException {
        AmazonS3 s3Client = getAmazonS3Client();

        ObjectMetadata objectMetaData = new ObjectMetadata();
        objectMetaData.setContentType(contentType);
        objectMetaData.setContentLength(multipartFile.getSize());

        PutObjectRequest putObjectRequest =
                new PutObjectRequest(bucket, key, multipartFile.getInputStream(), objectMetaData)
                        .withCannedAcl(CannedAccessControlList.PublicRead);
        PutObjectResult putObjectResult = s3Client.putObject(putObjectRequest);
        log.info("Uploaded object to: " + String.join("/", bucket, key));

        return putObjectResult;
    }

    public String clone(String bucket, String sourceKey, String destinationKey) {
        AmazonS3 s3Client = getAmazonS3Client();

        CopyObjectRequest copyObjectRequest =
                new CopyObjectRequest(bucket, sourceKey, bucket, destinationKey)
                        .withCannedAccessControlList(CannedAccessControlList.PublicRead);
        CopyObjectResult copyObjectResult = s3Client.copyObject(copyObjectRequest);

        log.info("Cloned object from: {}/{}, to: {}/{}", bucket, sourceKey, bucket, destinationKey);
        return copyObjectResult.getVersionId();
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