package com.slidepiper.model.entity.widget;

import com.fasterxml.jackson.databind.JsonNode;
import com.slidepiper.converter.SmsWidgetDataStringConverter;
import lombok.Getter;
import org.hibernate.validator.constraints.NotBlank;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.validation.constraints.Size;

@Entity
@DiscriminatorValue("SMS")
@Getter
public class SmsWidget extends Widget {

    @Column(name = "data")
    @Convert(converter = SmsWidgetDataStringConverter.class)
    private SmsWidgetData data;

    @Getter
    public static class SmsWidgetData {
        @NotBlank @Size(min = 1, max = 11) private String senderId;
        @NotBlank private JsonNode bodies;
    }
}
