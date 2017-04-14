package com.slidepiper.service.widget;

import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.widget.ShareWidget;
import com.slidepiper.model.entity.widget.ShareWidget.ShareWidgetData;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.repository.widget.ShareWidgetRepository;
import com.slidepiper.service.amazon.AmazonS3Service;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import java.util.Objects;
import java.util.Optional;

@Service
public class ShareWidgetService {
    @Value("${spring.profiles.active}") private String activeProfile;
    @Value("${amazon.s3.url}") private String amazonS3Url;
    @Value("${slidepiper.widget.amazon.s3.bucket}") private String bucket;
    @Value("${slidepiper.widget.amazon.s3.shareWidgetImageUrlPrefix}") private String shareWidgetImageUrlPrefix;
    @Value("${slidepiper.widget.shareWidget.data.defaultImageUrl}") private String defaultImageUrl;

    private final AmazonS3Service amazonS3Service;
    private final ChannelRepository channelRepository;
    private final ShareWidgetData defaultShareWidgetData;
    private final ShareWidgetRepository shareWidgetRepository;

    @Autowired
    public ShareWidgetService(AmazonS3Service amazonS3Service,
                              ChannelRepository channelRepository,
                              ShareWidgetData defaultShareWidgetData,
                              ShareWidgetRepository shareWidgetRepository) {
        this.amazonS3Service = amazonS3Service;
        this.channelRepository = channelRepository;
        this.defaultShareWidgetData = defaultShareWidgetData;
        this.shareWidgetRepository = shareWidgetRepository;
    }

    public ShareWidgetData getShareWidgetData(HttpServletRequest request, String channelName) {

        Document document = channelRepository.findByFriendlyId(channelName).getDocument();
        ShareWidget shareWidget = shareWidgetRepository.findByDocument(document);

        ShareWidgetData shareWidgetData = defaultShareWidgetData;
        if (Objects.nonNull(shareWidget) && shareWidget.getData().isEnabled()) {
            shareWidgetData = shareWidget.getData();
        }

        String url = Optional
                .ofNullable(shareWidgetData.getUrl())
                .orElse(String.join("", request.getRequestURL().toString(), "?f=", channelName));

        shareWidgetData.setUrl(url);

        return shareWidgetData;
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
