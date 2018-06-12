package com.slidepiper.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slidepiper.model.customer.CustomerData;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;
import java.util.Objects;

@Converter
public class CustomerDataConverter implements AttributeConverter<CustomerData, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(CustomerData customerData) {
        try {
            if (Objects.nonNull(customerData)) {
                return objectMapper.writeValueAsString(customerData);
            } else {
                return null;
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public CustomerData convertToEntityAttribute(String string) {
        try {
            if (Objects.nonNull(string)) {
                return (objectMapper.readValue(string, CustomerData.class));
            } else {
                return null;
            }
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}