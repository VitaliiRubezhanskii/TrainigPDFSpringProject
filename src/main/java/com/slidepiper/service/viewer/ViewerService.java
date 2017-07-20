package com.slidepiper.service.viewer;

import com.slidepiper.model.entity.Channel;
import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.viewer.ViewerEvent;
import com.slidepiper.model.entity.viewer.ViewerEvent.ViewerEventType;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.repository.ViewerEventRepository;
import com.slidepiper.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import slidepiper.db.DbLayer;

import javax.servlet.http.HttpServletRequest;
import java.util.Objects;
import java.util.Optional;

@Service
public class ViewerService {
    private final ChannelRepository channelRepository;
    private final DocumentService documentService;
    private final ViewerEventRepository viewerEventRepository;

    @Autowired
    public ViewerService(ChannelRepository channelRepository,
                         DocumentService documentService,
                         ViewerEventRepository viewerEventRepository) {
        this.channelRepository = channelRepository;
        this.documentService = documentService;
        this.viewerEventRepository = viewerEventRepository;
    }

    public Channel findChannel(String initialChannelFriendlyId, HttpServletRequest request) {
        String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
                .map(x -> x.split(",")[0])
                .orElse(request.getRemoteAddr());

        // TODO: Refactor if block.
        Channel channel = channelRepository.findByFriendlyId(initialChannelFriendlyId);
        Document document = Optional.ofNullable(channel).map(x -> x.getDocument()).orElse(null);

        if (Objects.isNull(document)) {
            return channelRepository.findByFriendlyId("2zdxd9");
        } else if (document.isIpRestricted()
                && !DbLayer.isIPMatchClientIP(channel.getFriendlyId(), ip)) {

            ViewerEvent viewerEvent = createViewerEvent(ViewerEventType.INIT_IP_NOT_WHITELISTED, channel, request);
            viewerEvent.setParam_4_varchar("https://www.slidepiper.com/view?f=27nm85");
            viewerEventRepository.save(viewerEvent);

            return channelRepository.findByFriendlyId("27nm85");
        }

        return channel;
    }

    public String getView(Channel channel, String initialChannelFriendlyId, HttpServletRequest request, String sessionId) {
        // TODO: Refactor if block.
        if (!channel.getFriendlyId().equals(initialChannelFriendlyId)) {
            return "redirect:https://www.slidepiper.com/view?f=" + channel.getFriendlyId();
        }

        if (isBrowserUnsupported(request.getHeader("User-Agent"))) {
            String unsupportedBrowserDocumentUrl = getUnsupportedBrowserDocumentUrl(channel.getDocument(), request);

            ViewerEvent viewerEvent = createViewerEvent(ViewerEventType.INIT_UNSUPPORTED_BROWSER, channel, request);
            viewerEvent.setParam_4_varchar(unsupportedBrowserDocumentUrl);
            viewerEventRepository.save(viewerEvent);

            return "redirect:" + unsupportedBrowserDocumentUrl;
        } else {
            ViewerEvent viewerEvent = createViewerEvent(ViewerEventType.INIT_DOCUMENT_EXISTS, channel, request);
            viewerEvent.setSessionId(sessionId);
            viewerEventRepository.save(viewerEvent);

            return "viewer";
        }
    }

    private ViewerEvent createViewerEvent(ViewerEventType viewerEventType, Channel channel, HttpServletRequest request) {
        ViewerEvent viewerEvent = new ViewerEvent(viewerEventType, channel);

        String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
                .map(x -> x.split(",")[0])
                .orElse(request.getRemoteAddr());

        viewerEvent.setParam_1_varchar(ip);
        viewerEvent.setParam_2_varchar(request.getHeader("User-Agent"));
        viewerEvent.setParam_3_varchar(request.getHeader("referer"));

        return viewerEvent;
    }

    /**
     * Check if browser is unsupported by the application.
     */
    private boolean isBrowserUnsupported(String userAgent) {
        String[] unsupportedBrowserTokens = {
                "MSIE 5.0", "MSIE 6.0", "MSIE 7.0", "MSIE 8.0", "MSIE 9.0"
        };

        for (String unsupportedBrowserToken: unsupportedBrowserTokens) {
            if (userAgent.contains(unsupportedBrowserToken)) {
                return true;
            }
        }

        return false;
    }

    private String getUnsupportedBrowserDocumentUrl(Document document, HttpServletRequest request) {
        return Optional.ofNullable(document.getAlternativeUrl()).orElse(documentService.getUrl(document, request));
    }
}