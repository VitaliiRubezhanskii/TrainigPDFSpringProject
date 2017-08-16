package com.slidepiper.service.viewer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.samskivert.mustache.Mustache;
import com.slidepiper.model.component.JwtUtils;
import com.slidepiper.model.entity.Channel;
import com.slidepiper.model.entity.Viewer;
import com.slidepiper.model.entity.ViewerEvent;
import com.slidepiper.model.entity.ViewerEvent.ViewerEventType;
import com.slidepiper.repository.ViewerEventRepository;
import com.slidepiper.service.amazon.AmazonSesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Arrays;
import java.util.Objects;

@Service
public class ViewerEventService {
    private final String accessKey;
    private final String secretKey;
    private final String from;
    private final String templatesPrefix;
    private final AmazonSesService amazonSesService;
    private final ViewerEventRepository viewerEventRepository;

    @Autowired
    public ViewerEventService(@Value("${amazon.ses.credentials.user.accessKey}") String accessKey,
                              @Value("${amazon.ses.credentials.user.secretKey}") String secretKey,
                              @Value("${amazon.ses.doNotReplyEmailAddress}") String from,
                              @Value("${slidepiper.templates.prefix}") String templatesPrefix,
                              AmazonSesService amazonSesService,
                              ViewerEventRepository viewerEventRepository) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.from = from;
        this.templatesPrefix = templatesPrefix;
        this.amazonSesService = amazonSesService;
        this.viewerEventRepository = viewerEventRepository;
    }

    public void saveEvent(ViewerEvent viewerEvent) {
        viewerEventRepository.save(viewerEvent);
    }

    public void sendUserEmail(Channel channel, String viewerNameInput, String viewerEmailInput, String viewerEventTypeInput, String viewerMessageInput) throws IOException, URISyntaxException {
        Viewer viewer = channel.getDocument().getViewer();
        String to = viewer.getEmail();
        if (Objects.nonNull(viewer.getData()) && Objects.nonNull(viewer.getData().getNotificationEmail())) {
            to = viewer.getData().getNotificationEmail();
        }

        String subject = createTitle(viewerEventTypeInput);

        URL fileUrl = getClass()
                .getClassLoader()
                .getResource(String.join("/", "templates", templatesPrefix, "viewer-event-email.html"));
        Reader viewerEventEmail = new FileReader(new File(fileUrl.toURI()));
        String body = Mustache.compiler().compile(viewerEventEmail).execute(new Object() {
            String title = subject;
            Object viewerNameSection = Objects.nonNull(viewerNameInput) ? new Object() {String viewerName = viewerNameInput;} : false;
            String viewerEmail = viewerEmailInput;
            String viewerEventType = createEventName(viewerEventTypeInput);
            String documentName = channel.getDocument().getName();
            Object viewerMessageSection = Objects.nonNull(viewerMessageInput) ? new Object() {String viewerMessage = viewerMessageInput;} : false;
        });

        amazonSesService.sendEmail(accessKey, secretKey, from, to, subject, body, viewer.getEmail(), null);
    }

    private String createEventName(String viewerEventTypeString) {
        ViewerEventType viewerEventType = ViewerEventType.valueOf(viewerEventTypeString);
        switch (viewerEventType) {
            case OPEN_SLIDES:
                return "has just opened";

            case VIEWER_WIDGET_ASK_QUESTION:
                return "has sent a message on";

            case DOWNLOAD:
                return "has downloaded";

            case PRINT:
                return "has printed";

            case FILE_WIDGET_UPLOADED_FILE:
                return "has upload a file via";

            default:
                return "has made an action on";
        }
    }

    private String createTitle(String viewerEventTypeString) {
        ViewerEventType viewerEventType = ViewerEventType.valueOf(viewerEventTypeString);
        switch (viewerEventType) {
            case OPEN_SLIDES:
                return "Open Notification";

            case VIEWER_WIDGET_ASK_QUESTION:
                return "Message Notification";

            case DOWNLOAD:
                return "Download Notification";

            case PRINT:
                return "Print Notification";

            case FILE_WIDGET_UPLOADED_FILE:
                return "Upload File Notification";

            default:
                return "Event Notification";
        }
    }

    public String getViewerId(String viewerCookieValue) {
        return JwtUtils.verify(viewerCookieValue).getClaim("viewerId").asString();
    }

    public Cookie getViewerCookie(HttpServletRequest request) {
        return Arrays.stream(request.getCookies())
                .filter(c -> c.getName().equals("sp.viewer"))
                .findFirst()
                .get();
    }

    public Cookie createViewerCookie(String viewerId, HttpServletResponse response) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode privateClaims = mapper.createObjectNode();
        privateClaims.put("viewerId", viewerId);
        String jwt = JwtUtils.create(privateClaims);

        Cookie viewerCookie = new Cookie("sp.viewer", jwt);
        updateViewerCookie(viewerCookie, response);

        return viewerCookie;
    }

    public void updateViewerCookie(Cookie viewerCookie, HttpServletResponse response) {
        viewerCookie.setMaxAge(63072000); // 2 years.
        viewerCookie.setHttpOnly(true);
        response.addCookie(viewerCookie);
    }
}