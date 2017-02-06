package com.slidepiper.model.input;

import org.hibernate.validator.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;

import lombok.Getter;

@Getter
public class SmsWidgetInput {
  @NotBlank private String channelName;
  @NotBlank private String phoneNumber;
  
  // Temporary solution.
  @URL private String url;
}
