package com.slidepiper.service.dashboard.widget;

import com.slidepiper.service.amazon.AmazonS3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Service
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardLinkWidgetService {
    private final String activeProfile;
    private final String bucket;
    private final String url;
    private final AmazonS3Service amazonS3Service;

    @Autowired
    public DashboardLinkWidgetService(@Value("${spring.profiles.active}") String activeProfile,
                                      @Value("${slidepiper.widget.amazon.s3.bucket}") String bucket,
                                      @Value("${amazon.s3.url}") String url,
                                      AmazonS3Service amazonS3Service) {
        this.activeProfile = activeProfile;
        this.bucket = bucket;
        this.url = url;
        this.amazonS3Service = amazonS3Service;
    }

    public String uploadFile(MultipartFile file, String documentFriendlyId) throws IOException {
        String uuid = UUID.randomUUID().toString();
        String fileName = file.getOriginalFilename();
        String key = UriComponentsBuilder
                .newInstance()
                .path("{activeProfile}/{documentFriendlyId}/link-widget/{uuid}/{fileName}")
                .buildAndExpand(activeProfile, documentFriendlyId, uuid, fileName)
                .toUriString();

            amazonS3Service.upload(file, file.getContentType(), bucket, key, null);

        return UriComponentsBuilder
                .fromHttpUrl(url)
                .path("{bucket}/{activeProfile}/{documentFriendlyId}/link-widget/{uuid}/{fileName}")
                .buildAndExpand(bucket, activeProfile, documentFriendlyId, uuid, fileName)
                .toUriString();
    }
}