package com.slidepiper.model.converter;

import java.io.IOException;
import java.util.Objects;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.slidepiper.model.entity.widget.SmsWidgetData;

@Converter
public class SmsWidgetDataStringConverter implements AttributeConverter<SmsWidgetData, String> {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public String convertToDatabaseColumn(SmsWidgetData data) {
    // TODO: Add converter.
    return null;
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
