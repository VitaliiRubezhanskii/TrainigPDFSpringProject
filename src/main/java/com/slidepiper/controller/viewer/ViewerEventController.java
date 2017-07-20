package com.slidepiper.controller.viewer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.slidepiper.model.component.JwtUtils;
import com.slidepiper.model.entity.Channel;
import com.slidepiper.model.entity.viewer.ViewerEvent;
import com.slidepiper.model.entity.viewer.ViewerEvent.ViewerEventType;
import com.slidepiper.model.input.ViewerEventInput;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.service.viewer.ViewerEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import slidepiper.db.Analytics;
import slidepiper.db.DbLayer;
import slidepiper.salesman_servlets.Geolocation;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class ViewerEventController {
    private final ChannelRepository channelRepository;
    private final ObjectMapper objectMapper;
    private final ViewerEventService viewerEventService;

    @Autowired
    public ViewerEventController(ChannelRepository channelRepository,
                                 ObjectMapper objectMapper,
                                 ViewerEventService viewerEventService) {
        this.channelRepository = channelRepository;
        this.objectMapper = objectMapper;
        this.viewerEventService = viewerEventService;
    }

    @PostMapping(value = "/utils/viewer-event-email")
    public void viewerEventEmail(@Valid @RequestBody ViewerEventInput viewerEventInput)
            throws IOException, URISyntaxException {

        Channel channel = channelRepository.findByFriendlyId(viewerEventInput.getChannelName());

        viewerEventService.sendUserEmail(channel,
                viewerEventInput.getViewerName(),
                viewerEventInput.getViewerEmail(),
                viewerEventInput.getViewerEventType(),
                null);
    }

    @PostMapping(value = "/viewer/event")
    public void viewerEvent(@RequestBody String event,
                            @CookieValue(value = "sp.viewer", required = false) String viewerCookie,
                            HttpServletRequest request) throws IOException, URISyntaxException {

        ViewerEvent viewerEvent  = objectMapper.readValue(URLDecoder.decode(event, StandardCharsets.UTF_8.name()), ViewerEvent.class);

        // Set Channel.
        Channel channel = channelRepository.findByFriendlyId(viewerEvent.getChannelFriendlyId());
        viewerEvent.setChannel(channel);

        // Set viewer ID.
        if (Objects.nonNull(viewerCookie)) {
            String viewerId = JwtUtils.verify(viewerCookie).getClaim("viewerId").asString();
            viewerEvent.setViewerId(viewerId);
        } else {
            System.err.println("viewerId is null");
        }

        // Set IP.
        if (viewerEvent.getType().equals(ViewerEventType.OPEN_SLIDES)) {
            String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
                    .map(x -> x.split(",")[0])
                    .orElse(request.getRemoteAddr());
            viewerEvent.setParam_1_varchar(ip);

            try {
                List<String> ipData = Geolocation.ipData(ip);
                viewerEvent.setParam_2_varchar(ipData.get(0));
                viewerEvent.setParam_3_varchar(ipData.get(1));
                viewerEvent.setParam_4_varchar(ipData.get(2));
                viewerEvent.setParam_5_varchar(ipData.get(3));
                viewerEvent.setParam_6_varchar(ipData.get(4));
                viewerEvent.setParam_7_varchar(ipData.get(5));
                viewerEvent.setParam_8_varchar(ipData.get(6));
                viewerEvent.setParam_9_varchar(ipData.get(7));
                viewerEvent.setParam_10_varchar(ipData.get(8));
            } catch (IOException e) {
                // TODO: Add Sentry error method.
                e.printStackTrace();
            }
        }

        // Save event.
        viewerEventService.saveEvent(viewerEvent);

        // Send user email.
        if ((viewerEvent.getType().equals(ViewerEventType.OPEN_SLIDES)
                && viewerEvent.getChannel().getDocument().getUser().isViewerOpenDocumentEmailEnabled())
                || (viewerEvent.getType().equals(ViewerEventType.VIEWER_WIDGET_ASK_QUESTION)
                && viewerEvent.getChannel().getDocument().getUser().isViewerEventEmailEnabled())) {

            // TODO: Replace obsolete code and create a service method.
            ArrayList<String> emailParamList = new ArrayList<>();
            emailParamList.add(Long.toString(viewerEvent.getId()));
            String[] notificationData = DbLayer.getEventData(emailParamList, Analytics.sqlEmailNotifications).get(0);

            String channelRecipientName = DbLayer.getCustomerName(notificationData[0], notificationData[2]);
            String viewerName = channelRecipientName;
            String viewerEmail = notificationData[0];
            String viewerMessage = null;

            if (Objects.nonNull(notificationData[3])) {
                viewerName = notificationData[3];
                viewerEmail = "(via " + channelRecipientName + ")";
            }

            if (viewerEvent.getType().equals(ViewerEventType.VIEWER_WIDGET_ASK_QUESTION)) {
                viewerName = null;
                viewerEmail = viewerEvent.getParam_3_varchar();
                viewerMessage = viewerEvent.getParam_2_varchar();
            }

            viewerEventService.sendUserEmail(channel,
                    viewerName,
                    viewerEmail,
                    viewerEvent.getType().name(),
                    viewerMessage);
        }
    }
}