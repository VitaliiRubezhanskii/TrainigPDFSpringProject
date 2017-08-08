package com.slidepiper.service.viewer.widget;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.sns.AmazonSNSClient;
import com.amazonaws.services.sns.model.MessageAttributeValue;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;
import com.slidepiper.exception.WidgetDisabledException;
import com.slidepiper.exception.WidgetNotFoundException;
import com.slidepiper.model.component.ConfigurationPropertiesUtils;
import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.widget.SmsWidget;
import com.slidepiper.model.entity.widget.SmsWidget.SmsWidgetData;
import com.slidepiper.model.input.SmsWidgetInput;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.repository.widget.SmsWidgetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class SmsWidgetService {
    private static final Logger log = LoggerFactory.getLogger(SmsWidgetService.class);

    private final ChannelRepository channelRepository;
    private final SmsWidgetRepository smsWidgetRepository;

    @Autowired
    public SmsWidgetService(ChannelRepository channelRepository, SmsWidgetRepository smsWidgetRepository) {
        this.channelRepository = channelRepository;
        this.smsWidgetRepository = smsWidgetRepository;
    }

    public void sendSms(SmsWidgetInput smsWidgetInput) {
        String channelFriendlyId = smsWidgetInput.getChannelName();
        String key = smsWidgetInput.getKey();
        String phoneNumber = "+" + smsWidgetInput.getPhoneNumber();

        SmsWidgetData smsWidgetData = getSmsWidgetDataByChannelName(channelFriendlyId);

        AWSCredentials awsCredentials = new BasicAWSCredentials(
                ConfigurationPropertiesUtils.amazonSNSCustomerMessage.getAccessKeyId(),
                ConfigurationPropertiesUtils.amazonSNSCustomerMessage.getSecretKey()
        );
        AmazonSNSClient snsClient = new AmazonSNSClient(awsCredentials);

        try {
            String message = smsWidgetData.getBodies().get(key).asText();

            Map<String, MessageAttributeValue> smsAttributes = new HashMap<String, MessageAttributeValue>();
            smsAttributes.put("AWS.SNS.SMS.SenderID", new MessageAttributeValue()
                    .withStringValue(smsWidgetData.getSenderId())
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

    private SmsWidgetData getSmsWidgetDataByChannelName(String channelName)
            throws WidgetDisabledException {

        Document document = channelRepository.findByFriendlyId(channelName).getDocument();
        SmsWidget smsWidget =
                Optional.ofNullable(smsWidgetRepository.findByDocument(document))
                        .orElseThrow(() -> new WidgetNotFoundException());

        if (smsWidget.isEnabled()) {
            return smsWidget.getData();
        } else {
            throw new WidgetDisabledException();
        }
    }
}
