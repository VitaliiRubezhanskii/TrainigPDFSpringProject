package com.slidepiper.service.viewer.widget;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.sns.AmazonSNSClient;
import com.amazonaws.services.sns.model.MessageAttributeValue;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slidepiper.exception.WidgetNotFoundException;
import com.slidepiper.model.component.ConfigurationPropertiesUtils;
import com.slidepiper.model.entity.Document;
import com.slidepiper.model.input.SmsWidgetInput;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.repository.StorageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class SmsWidgetService {
    private static final Logger log = LoggerFactory.getLogger(SmsWidgetService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final ChannelRepository channelRepository;
    private final StorageRepository storageRepository;

    @Autowired
    public SmsWidgetService(ChannelRepository channelRepository,
                            StorageRepository storageRepository) {
        this.channelRepository = channelRepository;
        this.storageRepository = storageRepository;
    }

    public void sendSms(SmsWidgetInput smsWidgetInput) throws IOException {
        String channelFriendlyId = smsWidgetInput.getChannelName();
        String key = smsWidgetInput.getKey();
        String phoneNumber = "+" + smsWidgetInput.getPhoneNumber();

        getSmsWidgetDataByChannelName(channelFriendlyId);

        AWSCredentials awsCredentials = new BasicAWSCredentials(
                ConfigurationPropertiesUtils.amazonSNSCustomerMessage.getAccessKey(),
                ConfigurationPropertiesUtils.amazonSNSCustomerMessage.getSecretKey()
        );
        AmazonSNSClient snsClient = new AmazonSNSClient(awsCredentials);

        try {
            JsonNode smsConfiguration = objectMapper.readTree(storageRepository.findByType("SMS_CONFIGURATION").getData());

            String message = smsConfiguration.get("bodies").get(key).asText();

            Map<String, MessageAttributeValue> smsAttributes = new HashMap<String, MessageAttributeValue>();
            smsAttributes.put("AWS.SNS.SMS.SenderID", new MessageAttributeValue()
                    .withStringValue(smsConfiguration.get("senderId").asText())
                    .withDataType("String"));
            smsAttributes.put("AWS.SNS.SMS.SMSType", new MessageAttributeValue()
                    .withStringValue("Transactional")
                    .withDataType("String"));

            PublishResult result =
                    snsClient.publish(new PublishRequest()
                            .withMessage(message)
                            .withPhoneNumber(phoneNumber)
                            .withMessageAttributes(smsAttributes));
            log.info("SMS sent to " + phoneNumber + " " + result);
        } catch (NullPointerException e) {
            log.warn(String.join(
                    "", "Unknown SMS body key: ", key, ", for channel: ", channelFriendlyId));
        }

    }

    private void getSmsWidgetDataByChannelName(String channelName) {
        Document document = channelRepository.findByFriendlyId(channelName).getDocument();

        String documentFriendlyId = storageRepository.findByType("DOCUMENT_FRIENDLY_ID").getData();
        if (!document.getFriendlyId().equals(documentFriendlyId)) {
            throw new WidgetNotFoundException();
        }
    }
}
