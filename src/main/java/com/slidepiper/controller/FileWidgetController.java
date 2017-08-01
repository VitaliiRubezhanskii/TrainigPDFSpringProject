package com.slidepiper.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.model.component.JwtUtils;
import com.slidepiper.model.entity.Channel;
import com.slidepiper.model.entity.viewer.ViewerEvent;
import com.slidepiper.model.entity.viewer.ViewerEvent.ViewerEventType;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.repository.ViewerEventRepository;
import com.slidepiper.service.viewer.ViewerEventService;
import com.slidepiper.service.widget.FileWidgetService;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Objects;

@RestController
public class FileWidgetController {
    private final ChannelRepository channelRepository;
    private final FileWidgetService fileWidgetService;
    private final ViewerEventService viewerEventService;
    private final ViewerEventRepository viewerEventRepository;
    private final ObjectMapper objectMapper;

    public FileWidgetController(ChannelRepository channelRepository,
                                FileWidgetService fileWidgetService,
                                ViewerEventService viewerEventService,
                                ViewerEventRepository viewerEventRepository,
                                ObjectMapper objectMapper) {
        this.channelRepository = channelRepository;
        this.fileWidgetService = fileWidgetService;
        this.viewerEventService = viewerEventService;
        this.viewerEventRepository = viewerEventRepository;
        this.objectMapper = objectMapper;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/viewer/widget/file")
    public ObjectNode uploadFile(@RequestBody @RequestParam("file") MultipartFile file,
                                 @RequestBody @RequestParam("sessionId") String sessionId,
                                 @RequestBody @RequestParam("channelFriendlyId") String channelFriendlyId,
                                 @CookieValue(value = "sp.viewer", required = false) String viewerCookie) throws IOException, URISyntaxException {

        Channel channel = channelRepository.findByFriendlyId(channelFriendlyId);
        String url = fileWidgetService.uploadFile(file, channel);
        viewerEventService.sendUserEmail(channel, null,"A customer", ViewerEventType.FILE_WIDGET_UPLOADED_FILE.name(), url);

        // Save viewer event.
        String viewerId = null;
        if (Objects.nonNull(viewerCookie)) {
            viewerId = JwtUtils.verify(viewerCookie).getClaim("viewerId").asString();
        } else {
            System.err.println("viewerId is null");
        }
        ViewerEvent viewerEvent = new ViewerEvent(ViewerEventType.FILE_WIDGET_UPLOADED_FILE, channel);
        viewerEvent.setSessionId(sessionId);
        viewerEvent.setViewerId(viewerId);
        viewerEvent.setParam_1_varchar(url);
        viewerEventRepository.save(viewerEvent);

        ObjectNode objectNode = objectMapper.createObjectNode();
        objectNode.put("url", url);
        return objectNode;
    }
}