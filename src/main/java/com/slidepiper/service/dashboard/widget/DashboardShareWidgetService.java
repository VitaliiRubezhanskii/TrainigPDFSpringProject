package com.slidepiper.service.dashboard.widget;

import com.slidepiper.service.amazon.AmazonS3Service;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardShareWidgetService {
    private final String activeProfile;
    private final String amazonS3Url;
    private final String bucket;
    private final String defaultImageUrl;
    private final String shareWidgetImageUrlPrefix;
    private final AmazonS3Service amazonS3Service;

    @Autowired
    public DashboardShareWidgetService(@Value("${spring.profiles.active}") String activeProfile,
                                       @Value("${amazon.s3.url}") String amazonS3Url,
                                       @Value("${slidepiper.widget.amazon.s3.bucket}") String bucket,
                                       @Value("${slidepiper.widget.shareWidget.data.defaultImageUrl}") String defaultImageUrl,
                                       @Value("${slidepiper.widget.amazon.s3.shareWidgetImageUrlPrefix}") String shareWidgetImageUrlPrefix,
                                       AmazonS3Service amazonS3Service) {
        this.activeProfile = activeProfile;
        this.amazonS3Url = amazonS3Url;
        this.bucket = bucket;
        this.defaultImageUrl = defaultImageUrl;
        this.shareWidgetImageUrlPrefix = shareWidgetImageUrlPrefix;
        this.amazonS3Service = amazonS3Service;
    }

    public String cloneData(String sourceImageUrl, String sourceDocumentFriendlyId, String destinationDocumentFriendlyId) {
        if (sourceImageUrl.equals(defaultImageUrl)) {
            return defaultImageUrl;
        } else {
            String fileName = FilenameUtils.getName(sourceImageUrl);

            UriComponentsBuilder baseKey = UriComponentsBuilder
                    .newInstance()
                    .path("{activeProfile}/{documentFriendlyId}/{shareWidgetImageUrlPrefix}/{fileName}");

            String sourceKey = baseKey
                    .buildAndExpand(activeProfile, sourceDocumentFriendlyId, shareWidgetImageUrlPrefix, fileName)
                    .toString();

            String destinationKey = baseKey
                    .buildAndExpand(activeProfile, destinationDocumentFriendlyId, shareWidgetImageUrlPrefix, fileName)
                    .toString();

            amazonS3Service.clone(bucket, sourceKey, destinationKey);

            String destinationImageUrl = UriComponentsBuilder
                    .fromHttpUrl(amazonS3Url)
                    .pathSegment(bucket)
                    .path(destinationKey)
                    .build()
                    .toString();

            return destinationImageUrl;
        }
    }
}