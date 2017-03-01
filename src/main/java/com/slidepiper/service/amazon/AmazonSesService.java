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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AmazonSesService {
    private static final Logger log = LoggerFactory.getLogger(AmazonSesService.class);

    public void sendEmail(String accessKey, String secretKey, String from, String to, String subject, String body) {

        // Construct an object to contain the recipient address.
        Destination destination = new Destination().withToAddresses(to);

        // Create the subject and body of the message.
        Content subjectContent = new Content().withData(subject);
        Content textBody = new Content().withData(body);
        Body htmlBody = new Body().withHtml(textBody);

        // Create a message with the specified subject and body.
        Message message = new Message().withSubject(subjectContent).withBody(htmlBody);

        // Assemble the email.
        SendEmailRequest request =
                new SendEmailRequest().withSource(from).withDestination(destination).withMessage(message);

        try {
            AWSCredentials awsCredentials = new BasicAWSCredentials(accessKey, secretKey);
            AmazonSimpleEmailServiceClient client = new AmazonSimpleEmailServiceClient(awsCredentials);

            Region REGION = Region.getRegion(Regions.US_EAST_1);
            client.setRegion(REGION);

            // Send the email.
            client.sendEmail(request);
            log.info("Email sent to: " + to);
        } catch (Exception ex) {
            System.out.println("The email was not sent.");
            System.out.println("Error message: " + ex.getMessage());
        }
    }
}
