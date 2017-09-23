package com.slidepiper.amazon;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.cloudfront.AmazonCloudFront;
import com.amazonaws.services.cloudfront.AmazonCloudFrontClient;
import com.amazonaws.services.cloudfront.model.CreateInvalidationRequest;
import com.amazonaws.services.cloudfront.model.CreateInvalidationResult;
import com.amazonaws.services.cloudfront.model.InvalidationBatch;
import com.amazonaws.services.cloudfront.model.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AmazonCloudFrontService {
    private static final Logger log = LoggerFactory.getLogger(AmazonCloudFrontService.class);

    private final String accessKey;
    private final String secretKey;
    private final String distributionId;

    @Autowired
    public AmazonCloudFrontService(@Value("${slidepiper.amazon.accessKey}") String accessKey,
                                   @Value("${slidepiper.amazon.secretKey}") String secretKey,
                                   @Value("${slidepiper.amazon.cloudfront.distributionId}") String distributionId) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.distributionId = distributionId;
    }

    private AmazonCloudFront amazonCloudFrontClient() {
        AWSCredentials awsCredentials = new BasicAWSCredentials(accessKey, secretKey);
        return new AmazonCloudFrontClient(awsCredentials);
    }

    public void invalidate(String path) {
        AmazonCloudFront amazonCloudFront = amazonCloudFrontClient();
        Paths paths = new Paths().withItems(path).withQuantity(1);
        InvalidationBatch invalidationBatch = new InvalidationBatch(paths, String.valueOf(System.currentTimeMillis()));
        CreateInvalidationRequest request = new CreateInvalidationRequest(distributionId, invalidationBatch);

        CreateInvalidationResult result = amazonCloudFront.createInvalidation(request);
        log.info("Invalidating: {} (InvalidationId: {})", path, result.getInvalidation().getId());
    }
}