package com.slidepiper.model.entity.widget;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Component
@Getter
@Setter
public class ShareData {
  private String url;
  @Value("${viewer.share.data.defaultTitle}") private String title;
  @Value("${viewer.share.data.defaultDescription}") private String description;
  @Value("${viewer.share.data.defaultImageUrl}") private String imageUrl;
}
