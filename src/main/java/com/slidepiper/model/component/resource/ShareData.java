package com.slidepiper.model.component.resource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.annotation.Transient;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Component
@Getter
@Setter
public class ShareData {
  @Transient private String url;
  @Transient private String channelName;
  @Value("${viewer.share.data.defaultTitle}") private String title;
  @Value("${viewer.share.data.defaultDescription}") private String description;
  @Value("${viewer.share.data.defaultImageUrl}") private String imageUrl;
}
