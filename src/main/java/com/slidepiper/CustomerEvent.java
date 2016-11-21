package com.slidepiper;

import java.util.Map;

public class CustomerEvent {
  
  private final String apiVersion;
  private String documentLinkHash;
  private String eventName;
  private Map<String, Object> eventData;
  
  public CustomerEvent() {
    this.apiVersion = "1.0.0";
  }
  
  public String getApiVersion() {
    return apiVersion;
  }

  public String getDocumentLinkHash() {
    return documentLinkHash;
  }

  public void setDocumentLinkHash(String documentLinkHash) {
    this.documentLinkHash = documentLinkHash;
  }

  public String getEventName() {
    return eventName;
  }

  public void setEventName(String eventName) {
    this.eventName = eventName;
  }

  public Map<String, Object> getEventData() {
    return eventData;
  }

  public void setEventData(Map<String, Object> eventData) {
    this.eventData = eventData;
  }
}