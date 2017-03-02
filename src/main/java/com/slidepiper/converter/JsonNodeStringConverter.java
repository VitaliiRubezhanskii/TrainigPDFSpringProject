package com.slidepiper.converter;

import java.io.IOException;
import java.util.Objects;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Converter
public class JsonNodeStringConverter implements AttributeConverter<JsonNode, String> {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public String convertToDatabaseColumn(JsonNode jsonNode) {
    try {
      if (Objects.nonNull(jsonNode)) {
        return objectMapper.writeValueAsString(jsonNode);
      } else {
        return null;
      }
    } catch (JsonProcessingException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public JsonNode convertToEntityAttribute(String string) {
    try {
      if (Objects.nonNull(string)) {
        return (objectMapper.readValue(string, JsonNode.class));
      } else {
        return null;
      }
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }
}
