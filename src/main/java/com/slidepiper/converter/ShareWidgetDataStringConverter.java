package com.slidepiper.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.model.entity.widget.ShareWidget.ShareWidgetData;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;
import java.util.Objects;

@Converter
public class ShareWidgetDataStringConverter implements AttributeConverter<ShareWidgetData, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(ShareWidgetData shareWidgetData) {
        ArrayNode items = objectMapper.createArrayNode();
        items.add(objectMapper.convertValue(shareWidgetData, JsonNode.class));

        ObjectNode data = objectMapper.createObjectNode();
        data.set("items", items);

        ObjectNode objectNode = objectMapper.createObjectNode();
        objectNode.set("data", data);

        try {
            return objectMapper.writeValueAsString(objectNode);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public ShareWidgetData convertToEntityAttribute(String string) {
        try {
            if (Objects.nonNull(string)) {
                objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

                JsonNode jsonNode = objectMapper.readTree(string);
                ObjectNode objectNode = (ObjectNode) jsonNode.get("data").get("items").get(0);

                if (jsonNode.get("data").has("isEnabled")) {
                    objectNode.set("enabled", jsonNode.get("data").get("isEnabled"));
                }
                if (jsonNode.get("data").has("widgetId")) {
                    objectNode.set("widgetId", jsonNode.get("data").get("widgetId"));
                }

                return objectMapper.treeToValue(objectNode, ShareWidgetData.class);
            } else {
                return null;
            }
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
