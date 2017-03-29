package com.slidepiper.service;

import com.slidepiper.model.entity.Document;
import com.slidepiper.repository.ChannelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
public class ViewerService {
    private final ChannelRepository channelRepository;
    private final DocumentService documentService;

    @Autowired
    public ViewerService(ChannelRepository channelRepository, DocumentService documentService) {
        this.channelRepository = channelRepository;
        this.documentService = documentService;
    }

    public Document getDocument(HttpServletRequest request, String channelFriendlyId) {
        Map<String, String> requestData = getRequestData(request, channelFriendlyId);

        String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
                .map(x -> x.split(",")[0])
                .orElse(request.getRemoteAddr());

        Document document = Optional.ofNullable(channelRepository.findByFriendlyId(channelFriendlyId))
                .map(x -> x.getDocument())
                .orElse(null);

        if (Objects.isNull(document)) {
            requestData.put("param_4_varchar", ConfigProperties.getProperty("file_viewer_broken_link"));
            DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_document_not_exists"), requestData);
            return channelRepository.findByFriendlyId("2zdxd9").getDocument();

        } else if (document.isIpRestricted()
                && !DbLayer.isIPMatchClientIP(channelFriendlyId, ip)) {

            requestData.put("param_4_varchar", ConfigProperties.getProperty("file_viewer_ip_restricted"));
            DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_ip_not_whitelisted"), requestData);
            return channelRepository.findByFriendlyId("27nm85").getDocument();
        }

        return document;
    }

    public String getView(HttpServletRequest request, Document document, String channelFriendlyId) {
        Map<String, String> requestData = getRequestData(request, channelFriendlyId);

        if (document.getFriendlyId().equals("e5mmjr54")
                && !channelFriendlyId.equals("2zdxd9")) {
            return "redirect:" + ConfigProperties.getProperty("file_viewer_broken_link");
        } else if (document.getFriendlyId().equals("v9xmgm21")
                && !channelFriendlyId.equals("27nm85")) {
            return "redirect:" + ConfigProperties.getProperty("file_viewer_ip_restricted");
        }

        if (isBrowserUnsupported(request.getHeader("User-Agent"))) {
            String unsupportedBrowserDocumentUrl = getUnsupportedBrowserDocumentUrl(document, channelFriendlyId, request);

            requestData.put("param_4_varchar", unsupportedBrowserDocumentUrl);
            DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_unsupported_browser"), requestData);
            return "redirect:" + unsupportedBrowserDocumentUrl;
        } else {
            DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_document_exists"), requestData);
            return "viewer";
        }
    }

    private Map<String, String> getRequestData(HttpServletRequest request, String channelFriendlyId) {
        Map<String, String> requestData = new HashMap<>();

        String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
                .map(x -> x.split(",")[0])
                .orElse(request.getRemoteAddr());

        requestData.put("msg_id", channelFriendlyId);
        requestData.put("session_id", "-1");
        requestData.put("param_1_varchar", ip);
        requestData.put("param_2_varchar", request.getHeader("User-Agent"));
        requestData.put("param_3_varchar", request.getHeader("referer"));

        return requestData;
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

    private String getUnsupportedBrowserDocumentUrl(Document document, String channelFriendlyId, HttpServletRequest request) {
        String redirectLink;
        String fileLink = DbLayer.getFileLinkFromFileLinkHash(channelFriendlyId);

        if (null != fileLink && !fileLink.equals("")) {
            redirectLink = fileLink;
        } else {
            redirectLink = documentService.getUrlWithVersionId(document, request);
        }

        return redirectLink;
    }
}
