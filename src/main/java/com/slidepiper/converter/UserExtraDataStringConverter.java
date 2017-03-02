package com.slidepiper.converter;

import java.io.IOException;
import java.util.Objects;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slidepiper.model.entity.User.ExtraData;

@Converter
public class UserExtraDataStringConverter implements AttributeConverter<ExtraData, String> {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public String convertToDatabaseColumn(ExtraData extraData) {
    try {
      if (Objects.nonNull(extraData)) {
        return objectMapper.writeValueAsString(extraData);
      } else {
        return null;
      }
    } catch (JsonProcessingException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public ExtraData convertToEntityAttribute(String string) {
    try {
      if (Objects.nonNull(string)) {
        return (objectMapper.readValue(string, ExtraData.class));
      } else {
        return null;
      }
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }
}
