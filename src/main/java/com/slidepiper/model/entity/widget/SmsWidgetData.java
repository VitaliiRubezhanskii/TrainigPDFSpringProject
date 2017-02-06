package com.slidepiper.model.entity.widget;

import javax.validation.constraints.Size;

import org.hibernate.validator.constraints.NotBlank;

import lombok.Getter;

@Getter
public class SmsWidgetData {
  @NotBlank @Size(min = 1, max = 11) private String senderId;
  @NotBlank private String body;
}
