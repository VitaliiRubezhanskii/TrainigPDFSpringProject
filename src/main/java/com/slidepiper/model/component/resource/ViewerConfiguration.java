package com.slidepiper.model.component.resource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.Getter;

@Component
@Getter
public class ViewerConfiguration {
  @Value("${viewer.apiUrl}") private String apiUrl;
}
