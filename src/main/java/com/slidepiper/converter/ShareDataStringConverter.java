package com.slidepiper.converter;

import java.io.IOException;
import java.util.Objects;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.model.entity.widget.ShareData;

@Converter
public class ShareDataStringConverter implements AttributeConverter<ShareData, String> {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public String convertToDatabaseColumn(ShareData data) {
    // TODO: Add converter.
    return null;
  }

  @Override
  public ShareData convertToEntityAttribute(String string) {
    try {
      if (Objects.nonNull(string)) {
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        JsonNode jsonNode = objectMapper.readTree(string);
        ObjectNode objectNode = (ObjectNode) jsonNode.get("data").get("items").get(0);
        objectNode.set("enabled", jsonNode.get("data").get("isEnabled"));
        
        return objectMapper.treeToValue(objectNode, ShareData.class);
      } else {
        return null;
      }
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }
}
