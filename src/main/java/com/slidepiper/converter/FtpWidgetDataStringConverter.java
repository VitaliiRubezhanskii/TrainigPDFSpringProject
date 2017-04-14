package com.slidepiper.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slidepiper.model.entity.widget.FtpWidget.FtpWidgetData;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;
import java.util.Objects;

@Converter
public class FtpWidgetDataStringConverter implements AttributeConverter<FtpWidgetData, String> {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public String convertToDatabaseColumn(FtpWidgetData ftpWidgetData) {
    try {
      return objectMapper.writeValueAsString(objectMapper.convertValue(ftpWidgetData, JsonNode.class));
    } catch (JsonProcessingException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public FtpWidgetData convertToEntityAttribute(String string) {
    try {
      if (Objects.nonNull(string)) {
        return objectMapper.readValue(string, FtpWidgetData.class);
      } else {
        return null;
      }
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }
}
