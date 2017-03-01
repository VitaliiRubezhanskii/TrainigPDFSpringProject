package com.slidepiper.service;

import com.samskivert.mustache.Mustache;
import com.slidepiper.model.entity.viewer.ViewerEventType;
import com.slidepiper.model.input.ViewerEventInput;
import com.slidepiper.model.repository.UserRepository;
import com.slidepiper.service.amazon.AmazonSesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import slidepiper.db.DbLayer;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Objects;

@Service
public class ViewerEventService {
    private final AmazonSesService amazonSesService;
    private final UserRepository userRepository;

    @Value("${amazon.ses.credentials.user.accessKey}") private String accessKey;
    @Value("${amazon.ses.credentials.user.secretKey}") private String secretKey;
    @Value("${amazon.ses.doNotReplyEmailAddress}") private String from;

    @Autowired
    public ViewerEventService(AmazonSesService amazonSesService, UserRepository userRepository) {
        this.amazonSesService = amazonSesService;
        this.userRepository = userRepository;
    }

    public void sendUserEmail(ViewerEventInput viewerEventInput) throws IOException, URISyntaxException {
        String to = DbLayer.getSalesmanEmailFromMsgId(viewerEventInput.getChannelName());
        if (Objects.nonNull(userRepository.findByEmail(to))
                && Objects.nonNull(userRepository.findByEmail(to).getExtraData())
                && Objects.nonNull(userRepository.findByEmail(to).getExtraData().getNotificationEmail())) {
            to = userRepository.findByEmail(to).getExtraData().getNotificationEmail();
        }

        String subject = createTitle(viewerEventInput.getViewerEventType());

        URL fileUrl = getClass().getClassLoader().getResource("templates/viewer-event-email.html");
        Reader viewerEventEmail = new FileReader(new File(fileUrl.toURI()));
        String body = Mustache.compiler().compile(viewerEventEmail).execute(new Object() {
            String title = subject;
            String viewerEmail = viewerEventInput.getViewerEmail();
            String viewerName = viewerEventInput.getViewerName();
            String eventName = createEventName(viewerEventInput.getViewerEventType());
            String documentName = DbLayer.getFileMetaData(viewerEventInput.getChannelName()).get("fileName");
        });

        amazonSesService.sendEmail(accessKey, secretKey, from, to, subject, body);
    }

    private String createEventName(String viewerEventTypeString) {
        ViewerEventType viewerEventType = ViewerEventType.valueOf(viewerEventTypeString);
        switch (viewerEventType) {
            case DOWNLOAD:
                return "downloaded";

            case PRINT:
                return "printed";

            default:
                return viewerEventType.name();
        }
    }

    private String createTitle(String viewerEventTypeString) {
        ViewerEventType viewerEventType = ViewerEventType.valueOf(viewerEventTypeString);
        switch (viewerEventType) {
            case DOWNLOAD:
                return "Download Notification";

            case PRINT:
                return "Print Notification";

            default:
                return "Notification";
        }
    }
}
