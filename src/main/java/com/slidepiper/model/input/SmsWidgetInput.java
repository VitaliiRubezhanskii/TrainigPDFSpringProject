package com.slidepiper.model.input;

import lombok.Getter;
import org.hibernate.validator.constraints.NotBlank;

@Getter
public class SmsWidgetInput {
  @NotBlank private String channelName;
  @NotBlank private String phoneNumber;
  @NotBlank private String key;
}
