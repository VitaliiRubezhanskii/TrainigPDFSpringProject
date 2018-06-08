package com.slidepiper.model.input.widget;

import javax.validation.constraints.Size;

import org.hibernate.validator.constraints.NotBlank;

import lombok.Getter;

@Getter
public class FtpWidgetDataInput {
  @NotBlank private String channelName;
  @Size(max = 75) private String fileNamePrefix;
}
