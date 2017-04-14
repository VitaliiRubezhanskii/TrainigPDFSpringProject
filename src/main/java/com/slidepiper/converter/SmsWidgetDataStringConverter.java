package com.slidepiper.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slidepiper.model.entity.widget.SmsWidget.SmsWidgetData;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;
import java.util.Objects;

@Converter
public class SmsWidgetDataStringConverter implements AttributeConverter<SmsWidgetData, String> {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public String convertToDatabaseColumn(SmsWidgetData smsWidgetData) {
    try {
      return objectMapper.writeValueAsString(objectMapper.convertValue(smsWidgetData, JsonNode.class));
    } catch (JsonProcessingException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public SmsWidgetData convertToEntityAttribute(String string) {
    try {
      if (Objects.nonNull(string)) {
        return objectMapper.readValue(string, SmsWidgetData.class);
      } else {
        return null;
      }
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }
}
