package com.slidepiper.service.amazon;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClient;
import com.amazonaws.services.simpleemail.model.Body;
import com.amazonaws.services.simpleemail.model.Content;
import com.amazonaws.services.simpleemail.model.Destination;
import com.amazonaws.services.simpleemail.model.Message;
import com.amazonaws.services.simpleemail.model.SendEmailRequest;
import com.amazonaws.services.simpleemail.model.SendEmailResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.model.entity.Event;
import com.slidepiper.repository.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class AmazonSesService {
    private static final Logger log = LoggerFactory.getLogger(AmazonSesService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final EventRepository eventRepository;

    @Autowired
    AmazonSesService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public void sendEmail(String accessKey, String secretKey, String from, String to, String subject, String body, String username, String bcc) {

        // Construct an object to contain the recipient address.
        Destination destination = new Destination().withToAddresses(to);
        if (Objects.nonNull(bcc)) {
            destination.withBccAddresses(bcc);
        }

        // Create the subject and body of the message.
        Content subjectContent = new Content().withData(subject);
        Content textBody = new Content().withData(body);
        Body htmlBody = new Body().withHtml(textBody);

        // Create a message with the specified subject and body.
        Message message = new Message().withSubject(subjectContent).withBody(htmlBody);

        // Assemble the email.
        SendEmailRequest request =
                new SendEmailRequest().withSource(from).withDestination(destination).withMessage(message);

        AWSCredentials awsCredentials = new BasicAWSCredentials(accessKey, secretKey);
        AmazonSimpleEmailServiceClient client = new AmazonSimpleEmailServiceClient(awsCredentials);

        Region REGION = Region.getRegion(Regions.US_EAST_1);
        client.setRegion(REGION);

        // Send the email.
        SendEmailResult result = client.sendEmail(request);

        ObjectNode data = objectMapper.createObjectNode();
        data.put("messageId", result.getMessageId());
        data.put("to", to);
        if (Objects.nonNull(bcc)) {
            data.put("bcc", bcc);
            log.info("Email sent to: {} (bcc: {})", to, bcc);
        } else {
            log.info("Email sent to: {}", to);
        }
        eventRepository.save(new Event(username, Event.EventType.SENT_EMAIL, data));
    }
}