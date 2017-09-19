package com.slidepiper.service.viewer;

import com.slidepiper.model.entity.Channel;
import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.Viewer;
import com.slidepiper.model.entity.ViewerEvent;
import com.slidepiper.model.entity.ViewerEvent.ViewerEventType;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.repository.ViewerEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import slidepiper.db.DbLayer;

import javax.servlet.http.HttpServletRequest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
public class ViewerService {
    private final ChannelRepository channelRepository;
    private final ViewerEventRepository viewerEventRepository;
    private final ViewerDocumentService viewerDocumentService;

    @Autowired
    public ViewerService(ChannelRepository channelRepository,
                         ViewerEventRepository viewerEventRepository,
                         ViewerDocumentService viewerDocumentService) {
        this.channelRepository = channelRepository;
        this.viewerEventRepository = viewerEventRepository;
        this.viewerDocumentService = viewerDocumentService;
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
        ViewerEvent viewerEvent = new ViewerEvent(viewerEventType, channel.getFriendlyId());

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
        return Optional.ofNullable(document.getAlternativeUrl()).orElse(viewerDocumentService.getUrl(document, request));
    }

    public Map<String, Object> getViewerConfiguration(Viewer viewer) {
        Map<String, Object> navigationBarConfiguration = new HashMap<>();

        navigationBarConfiguration.put("documentTitle", viewer.getViewer_document_title());
        navigationBarConfiguration.put("toolbarBackground", viewer.getViewer_toolbar_background());
        navigationBarConfiguration.put("toolbarButtonBackground", viewer.getViewer_toolbar_button_background());
        navigationBarConfiguration.put("toolbarButtonHoverBackground", viewer.getViewer_toolbar_button_background());
        navigationBarConfiguration.put("toolbarButtonBorder", viewer.getViewer_toolbar_button_border());
        navigationBarConfiguration.put("toolbarButtonHoverBorder", viewer.getViewer_toolbar_button_hover_border());
        navigationBarConfiguration.put("toolbarButtonBoxShadow", viewer.getViewer_toolbar_button_box_shadow());
        navigationBarConfiguration.put("toolbarButtonHoverBoxShadow", viewer.getViewer_toolbar_button_hover_box_shadow());
        navigationBarConfiguration.put("toolbarColor", viewer.getViewer_toolbar_color());
        navigationBarConfiguration.put("toolbarFindColor", viewer.getViewer_toolbar_find_color());
        navigationBarConfiguration.put("toolbarFindBackground", viewer.getViewer_toolbar_find_background());
        if (Objects.nonNull(viewer.getViewer_toolbar_logo_image())) {
            navigationBarConfiguration.put("toolbarLogoImage", Base64.getEncoder().encodeToString(viewer.getViewer_toolbar_logo_image()));
        }
        navigationBarConfiguration.put("logoImage", viewer.getLogo_image());
        navigationBarConfiguration.put("toolbarLogoLink", viewer.getViewer_toolbar_logo_link());
        navigationBarConfiguration.put("toolbarLogoCollapseMaxWidth", viewer.getViewer_toolbar_logo_collapse_max_width());
        navigationBarConfiguration.put("toolbarCtaBorderRadius", viewer.getViewer_toolbar_cta_border_radius());
        navigationBarConfiguration.put("toolbarCtaFont", viewer.getViewer_toolbar_cta_font());
        navigationBarConfiguration.put("toolbarCtaMargin", viewer.getViewer_toolbar_cta_margin());
        navigationBarConfiguration.put("toolbarCtaPadding",viewer.getViewer_toolbar_cta_padding());

        if (viewer.getViewer_toolbar_cta1_is_enabled().equals("true")) {
            navigationBarConfiguration.put("isCta1Enabled", viewer.getViewer_toolbar_cta1_is_enabled());
            navigationBarConfiguration.put("cta1CollapseMaxWidth", viewer.getViewer_toolbar_cta1_collapse_max_width());
            navigationBarConfiguration.put("toolbarCta1Background", viewer.getViewer_toolbar_cta1_background());
            navigationBarConfiguration.put("toolbarCta1HoverBackground", viewer.getViewer_toolbar_cta1_hover_background());
            navigationBarConfiguration.put("toolbarCta1Border", viewer.getViewer_toolbar_cta1_border());
            navigationBarConfiguration.put("toolbarCta1HoverBorder", viewer.getViewer_toolbar_cat1_hover_border());
            navigationBarConfiguration.put("toolbarCta1Color", viewer.getViewer_toolbar_cta1_color());
            navigationBarConfiguration.put("toolbarCta1HoverColor", viewer.getViewer_toolbar_cta1_hover_color());
            navigationBarConfiguration.put("toolbarCta1Text", viewer.getViewer_toolbar_cta1_text());
            navigationBarConfiguration.put("toolbarCta1Link", viewer.getViewer_toolbar_cta1_link());
        }

        if (viewer.getViewer_toolbar_cta2_is_enabled().equals("true")) {
            navigationBarConfiguration.put("isCta2Enabled", viewer.getViewer_toolbar_cta2_is_enabled());
            navigationBarConfiguration.put("cta2CollapseMaxWidth", viewer.getViewer_toolbar_cta2_collapse_max_width());
            navigationBarConfiguration.put("toolbarCta2Background", viewer.getViewer_toolbar_cta2_background());
            navigationBarConfiguration.put("toolbarCta2HoverBackground", viewer.getViewer_toolbar_cta2_hover_background());
            navigationBarConfiguration.put("toolbarCta2Border", viewer.getViewer_toolbar_cta2_border());
            navigationBarConfiguration.put("toolbarCta2HoverBorder", viewer.getViewer_toolbar_cta2_hover_border());
            navigationBarConfiguration.put("toolbarCta2Color", viewer.getViewer_toolbar_cta2_color());
            navigationBarConfiguration.put("toolbarCta2HoverColor", viewer.getViewer_toolbar_cta2_hover_color());
            navigationBarConfiguration.put("toolbarCta2Text", viewer.getViewer_toolbar_cta2_text());
            navigationBarConfiguration.put("toolbarCta2Link", viewer.getViewer_toolbar_cta2_link());
        }

        if (viewer.getViewer_toolbar_cta3_is_enabled().equals("true")) {
            navigationBarConfiguration.put("isCta3Enabled", viewer.getViewer_toolbar_cta3_is_enabled());
            navigationBarConfiguration.put("cta3CollapseMaxWidth", viewer.getViewer_toolbar_cta3_collapse_max_width());
            navigationBarConfiguration.put("toolbarCta3Background", viewer.getViewer_toolbar_cta3_background());
            navigationBarConfiguration.put("toolbarCta3HoverBackground", viewer.getViewer_toolbar_cta3_hover_background());
            navigationBarConfiguration.put("toolbarCta3Border", viewer.getViewer_toolbar_cta3_border());
            navigationBarConfiguration.put("toolbarCta3HoverBorder", viewer.getViewer_toolbar_cta3_hover_border());
            navigationBarConfiguration.put("toolbarCta3Color", viewer.getViewer_toolbar_cta3_color());
            navigationBarConfiguration.put("toolbarCta3HoverColor", viewer.getViewer_toolbar_cta3_hover_color());
            navigationBarConfiguration.put("toolbarCta3Text", viewer.getViewer_toolbar_cta3_text());
            navigationBarConfiguration.put("toolbarCta3Link", viewer.getViewer_toolbar_cta3_link());
        }

        navigationBarConfiguration.put("isViewerToolbarIsDownloadEnabled", viewer.isViewer_toolbar_secondary_is_download_enabled());
        navigationBarConfiguration.put("isMobileToolbarSecondaryPresentationEnabled", viewer.isViewer_toolbar_secondary_is_mobile_presentation_enabled());
        navigationBarConfiguration.put("isMobileToolbarSecondaryDownloadEnabled", viewer.isViewer_toolbar_secondary_is_mobile_download_enabled());

        navigationBarConfiguration.values().removeIf(Objects::isNull);
        return navigationBarConfiguration;
    }
}