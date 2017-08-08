package com.slidepiper.service.dashboard;

import com.slidepiper.model.entity.Viewer;
import com.slidepiper.service.amazon.AmazonS3Service;
import com.slidepiper.service.amazon.AmazonS3Service.ObjectMetaData;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Service
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardViewerService {
    private final String activeProfile;
    private final String bucket;
    private final String staticUrl;
    private final AmazonS3Service amazonS3Service;

    @Autowired
    public DashboardViewerService(@Value("${spring.profiles.active}") String activeProfile,
                                  @Value("${slidepiper.viewer.amazon.s3.bucket}") String bucket,
                                  @Value("${slidepiper.staticUrl}") String staticUrl,
                                  AmazonS3Service amazonS3Service) {
        this.amazonS3Service = amazonS3Service;
        this.bucket = bucket;
        this.staticUrl = staticUrl;
        this.activeProfile = activeProfile;
    }

    public String createLogoUrl(Viewer viewer, MultipartFile viewerToolbarLogoImage) throws IOException {
        String friendlyId = viewer.getFriendlyId();
        String extension = FilenameUtils.getExtension(viewerToolbarLogoImage.getOriginalFilename());
        String path = "{activeProfile}/viewers/{friendlyId}/logo/logo.{extension}";
        String key = UriComponentsBuilder
                .newInstance()
                .path(path)
                .buildAndExpand(activeProfile, friendlyId, extension)
                .toUriString();

        String etag = amazonS3Service.upload(viewerToolbarLogoImage, viewerToolbarLogoImage.getContentType(), bucket, key, ObjectMetaData.E_TAG);

        return UriComponentsBuilder
                .fromHttpUrl(staticUrl)
                .path(path)
                .queryParam("etag", etag)
                .buildAndExpand(activeProfile, friendlyId, extension)
                .toUriString();
    }
}