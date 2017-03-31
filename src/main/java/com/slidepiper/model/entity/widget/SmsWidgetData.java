package com.slidepiper.model.entity.widget;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Getter;
import org.hibernate.validator.constraints.NotBlank;

import javax.validation.constraints.Size;

@Getter
public class SmsWidgetData {
  @NotBlank @Size(min = 1, max = 11) private String senderId;
  @NotBlank private JsonNode bodies;
}
