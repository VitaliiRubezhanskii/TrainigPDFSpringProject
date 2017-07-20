package com.slidepiper.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slidepiper.model.entity.viewer.ViewerEventData;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;
import java.util.Objects;

@Converter
public class ViewerEventDataConverter implements AttributeConverter<ViewerEventData, String> {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public String convertToDatabaseColumn(ViewerEventData viewerEventData) {
    try {
      if (Objects.nonNull(viewerEventData)) {
        return objectMapper.writeValueAsString(viewerEventData);
      } else {
        return null;
      }
    } catch (JsonProcessingException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public ViewerEventData convertToEntityAttribute(String string) {
    try {
      if (Objects.nonNull(string)) {
        return (objectMapper.readValue(string, ViewerEventData.class));
      } else {
        return null;
      }
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }
}