package com.slidepiper.service.mfa;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.sns.AmazonSNSClient;
import com.amazonaws.services.sns.model.MessageAttributeValue;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;
import com.slidepiper.model.component.ConfigurationPropertiesUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpServiceImpl implements OtpService {
    private static final Logger log = LoggerFactory.getLogger(OtpServiceImpl.class);
    Random generator = new Random();

    @Override
    public void sendOTP(String phoneNumber, int otp) throws IOException {
        AWSCredentials awsCredentials = new BasicAWSCredentials(
                ConfigurationPropertiesUtils.amazonSNSCustomerMessage.getAccessKey(),
                ConfigurationPropertiesUtils.amazonSNSCustomerMessage.getSecretKey()
        );
        AmazonSNSClient snsClient = new AmazonSNSClient(awsCredentials);

        try {
            Map<String, MessageAttributeValue> smsAttributes = new HashMap<String, MessageAttributeValue>();
            smsAttributes.put("AWS.SNS.SMS.SenderID", new MessageAttributeValue()
                    .withStringValue("SlidePiper")
                    .withDataType("String"));
            smsAttributes.put("AWS.SNS.SMS.SMSType", new MessageAttributeValue()
                    .withStringValue("Transactional")
                    .withDataType("String"));

            PublishResult result =
                    snsClient.publish(new PublishRequest()
                            .withMessage("Your code to login to SlidePiper document is: " + otp)
                            .withPhoneNumber(phoneNumber)
                            .withMessageAttributes(smsAttributes));
            log.info("SMS sent to " + phoneNumber + " " + result);
        } catch (NullPointerException e) {
            log.warn("Cannot send SMS");
        }
    }

    @Override
    public int generateCode() {

        /*int i = (int) (Math.random() * 10000);*/
        int i = generator.nextInt(899999)+100000;
        if (i < 100000 || i > 999999) {
            return generateCode();
        }
        return i;
    }
}
