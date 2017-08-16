package com.slidepiper.task;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;

@Converter
public class DocumentTaskDataConverter implements AttributeConverter<DocumentTaskData, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(DocumentTaskData documentTaskData) {
        objectMapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);
        try {
            return objectMapper.writeValueAsString(documentTaskData);
        } catch (JsonProcessingException e) {
            // TODO: Send error to Sentry.
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public DocumentTaskData convertToEntityAttribute(String string) {
        try {
            return (objectMapper.readValue(string, DocumentTaskData.class));
        } catch (IOException e) {
            // TODO: Send error to Sentry.
            e.printStackTrace();
            return null;
        }
    }
}