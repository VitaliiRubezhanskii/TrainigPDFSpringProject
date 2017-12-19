package com.slidepiper.service.email;

import com.slidepiper.service.amazon.AmazonSesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class EmailService {
    private final String accessKey;
    private final String secretKey;
    private final String from;
    private final String adminEmailAddresses;
    private final AmazonSesService amazonSesService;

    @Autowired
    EmailService(@Value("${slidepiper.amazon.accessKey}") String accessKey,
                 @Value("${slidepiper.amazon.secretKey}") String secretKey,
                 @Value("${amazon.ses.doNotReplyEmailAddress}") String from,
                 @Value("${slidepiper.adminEmailAddresses}") String adminEmailAddresses,
                 AmazonSesService amazonSesService) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.from = from;
        this.adminEmailAddresses = adminEmailAddresses;
        this.amazonSesService = amazonSesService;
    }

    public void sendAdminEmail(String subject, String body) {
        if (Objects.nonNull(adminEmailAddresses)) {
            for (String to: adminEmailAddresses.split(",")) {
                amazonSesService.sendEmail(accessKey, secretKey, from, to, subject, body, null, null);
            }
        }
    }
}