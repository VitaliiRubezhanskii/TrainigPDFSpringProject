package com.slidepiper.service.viewer.widget;

import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.widget.ShareWidget;
import com.slidepiper.model.entity.widget.ShareWidget.ShareWidgetData;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.repository.widget.ShareWidgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.Objects;
import java.util.Optional;

@Service
public class ViewerShareWidgetService {
    private final ChannelRepository channelRepository;
    private final ShareWidgetData defaultShareWidgetData;
    private final ShareWidgetRepository shareWidgetRepository;

    @Autowired
    public ViewerShareWidgetService(ChannelRepository channelRepository,
                                    ShareWidgetData defaultShareWidgetData,
                                    ShareWidgetRepository shareWidgetRepository) {
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
}