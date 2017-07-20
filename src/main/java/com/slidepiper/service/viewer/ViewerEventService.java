package com.slidepiper.service.viewer;

import com.samskivert.mustache.Mustache;
import com.slidepiper.model.entity.Channel;
import com.slidepiper.model.entity.viewer.ViewerEvent;
import com.slidepiper.model.entity.viewer.ViewerEvent.ViewerEventType;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.repository.UserRepository;
import com.slidepiper.repository.ViewerEventRepository;
import com.slidepiper.service.amazon.AmazonSesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Objects;

@Service
public class ViewerEventService {
    @Value("${amazon.ses.credentials.user.accessKey}") private String accessKey;
    @Value("${amazon.ses.credentials.user.secretKey}") private String secretKey;
    @Value("${amazon.ses.doNotReplyEmailAddress}") private String from;
    @Value("${slidepiper.templates.prefix}") private String templatesPrefix;

    private final AmazonSesService amazonSesService;
    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final ViewerEventRepository viewerEventRepository;

    @Autowired
    public ViewerEventService(AmazonSesService amazonSesService,
                              ChannelRepository channelRepository,
                              UserRepository userRepository,
                              ViewerEventRepository viewerEventRepository) {
        this.amazonSesService = amazonSesService;
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
        this.viewerEventRepository = viewerEventRepository;
    }

    public void saveEvent(ViewerEvent viewerEvent) {
        viewerEventRepository.save(viewerEvent);
    }

    public void sendUserEmail(Channel channel, String viewerNameInput, String viewerEmailInput, String viewerEventTypeInput, String viewerMessageInput) throws IOException, URISyntaxException {
        String to = channel.getDocument().getUser().getEmail();
        if (Objects.nonNull(userRepository.findByEmail(to))
                && Objects.nonNull(userRepository.findByEmail(to).getExtraData())
                && Objects.nonNull(userRepository.findByEmail(to).getExtraData().getNotificationEmail())) {
            to = userRepository.findByEmail(to).getExtraData().getNotificationEmail();
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

        amazonSesService.sendEmail(accessKey, secretKey, from, to, subject, body);
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

            default:
                return "Event Notification";
        }
    }
}