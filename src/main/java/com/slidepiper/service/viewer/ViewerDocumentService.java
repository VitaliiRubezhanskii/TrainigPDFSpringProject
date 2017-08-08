package com.slidepiper.service.viewer;

import com.slidepiper.model.entity.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import java.util.Objects;

@Service
public class ViewerDocumentService {
    private final String amazonS3Url;
    private final String bucket;
    private final String keyPrefix;

    @Autowired
    public ViewerDocumentService(@Value("${amazon.s3.url}") String amazonS3Url,
                                 @Value("${documents.amazon.s3.bucket}") String bucket,
                                 @Value("${documents.amazon.s3.keyPrefix}") String keyPrefix) {
        this.amazonS3Url = amazonS3Url;
        this.bucket = bucket;
        this.keyPrefix = keyPrefix;
    }

    public String getUrl(Document document, HttpServletRequest request) {
        UriComponentsBuilder baseUrl;
        if (Objects.nonNull(request.getHeader("X-Amz-Cf-Id"))) {
            baseUrl = UriComponentsBuilder.newInstance().scheme(request.getScheme()).host(request.getServerName());
        } else {
            baseUrl = UriComponentsBuilder.fromHttpUrl(amazonS3Url).pathSegment(bucket);
        }

        return baseUrl
                .path("/{keyPrefix}/{documentFriendlyId}/{documentName}")
                .queryParam("versionId", document.getVersionId())
                .buildAndExpand(keyPrefix, document.getFriendlyId(), document.getName())
                .encode()
                .toString();
    }
}