package com.slidepiper.data.model.userevent;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum UserEventType {
  ADDED_CUSTOMER ("ADDED_CUSTOMER"),
  CLICKED_HELP_BUTTON ("CLICKED_HELP_BUTTON"),
  CLICKED_TOOLBAR_SETTINGS ("CLICKED_TOOLBAR_SETTINGS"),
  GENERATED_DOCUMENT_LINK ("GENERATED_DOCUMENT_LINK"),
  UPLOADED_CUSTOMERS ("UPLOADED_CUSTOMERS");
  
  private final String eventTypePhrase;
}
