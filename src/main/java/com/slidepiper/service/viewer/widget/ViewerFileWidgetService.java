package com.slidepiper.service.viewer.widget;

import com.slidepiper.model.entity.Channel;
import com.slidepiper.service.amazon.AmazonS3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Service
public class ViewerFileWidgetService {
    private final String activeProfile;
    private final String url;
    private final String bucket;
    private final AmazonS3Service amazonS3Service;

    @Autowired
    public ViewerFileWidgetService(@Value("${spring.profiles.active}") String activeProfile,
                                   @Value("${amazon.s3.url}") String url,
                                   @Value("${slidepiper.widget.amazon.s3.bucket}") String bucket,
                                   AmazonS3Service amazonS3Service) {
        this.activeProfile = activeProfile;
        this.url = url;
        this.bucket = bucket;
        this.amazonS3Service = amazonS3Service;
    }

    public String uploadFile(MultipartFile file, Channel channel) throws IOException {
        String documentFriendlyId = channel.getDocument().getFriendlyId();
        String uuid = UUID.randomUUID().toString();
        String fileName = file.getOriginalFilename();

        String path = "{activeProfile}/{documentFriendlyId}/file-widget/{uuid}/{fileName}";
        String key = UriComponentsBuilder
            .newInstance()
            .path(path)
            .buildAndExpand(activeProfile, documentFriendlyId, uuid, fileName)
            .toUriString();

        amazonS3Service.upload(file, null, bucket, key, null);

        return UriComponentsBuilder
            .fromHttpUrl(url)
            .pathSegment("{bucket}")
            .path(path)
            .buildAndExpand(bucket, activeProfile, documentFriendlyId, uuid, fileName)
            .toUriString();
    }
}