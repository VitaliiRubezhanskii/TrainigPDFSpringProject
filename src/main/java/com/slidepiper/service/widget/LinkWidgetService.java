package com.slidepiper.service.widget;

import com.slidepiper.service.amazon.AmazonS3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;
import slidepiper.db.DbLayer;

import java.io.IOException;
import java.util.UUID;

@Service
public class LinkWidgetService {
    @Value("${spring.profiles.active}") private String activeProfile;
    @Value("${slidepiper.widget.amazon.s3.bucket}") private String bucket;
    @Value("${amazon.s3.url}") private String url;

    private AmazonS3Service amazonS3Service;

    @Autowired
    public LinkWidgetService(AmazonS3Service amazonS3Service) {
        this.amazonS3Service = amazonS3Service;
    }

    public String uploadFile(MultipartFile file, String salesmanEmail, String documentFriendlyId) throws IOException {
        if (DbLayer.getSalesmanEmailFromFileHash(documentFriendlyId).equals(salesmanEmail)) {
            String uuid = UUID.randomUUID().toString();
            String fileName = file.getOriginalFilename();
            String key = UriComponentsBuilder
                    .newInstance()
                    .path("{activeProfile}/{documentFriendlyId}/link-widget/{uuid}/{fileName}")
                    .buildAndExpand(activeProfile, documentFriendlyId, uuid, fileName)
                    .toUriString();

            amazonS3Service.upload(file, bucket, key, null);

            return UriComponentsBuilder
                    .fromHttpUrl(url)
                    .path("{bucket}/{activeProfile}/{documentFriendlyId}/link-widget/{uuid}/{fileName}")
                    .buildAndExpand(bucket, activeProfile, documentFriendlyId, uuid, fileName)
                    .toUriString();
        } else {
            return null;
        }
    }
}
