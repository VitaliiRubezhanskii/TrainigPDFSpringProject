package com.slidepiper.model.converter;

import java.io.IOException;
import java.util.Objects;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
        return objectMapper.treeToValue(jsonNode.get("data").get("items").get(0), ShareData.class);
      } else {
        return null;
      }
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }
}
