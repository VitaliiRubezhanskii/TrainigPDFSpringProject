package com.slidepiper.model.exception;

@SuppressWarnings("serial")
public class WidgetNotFoundException extends RuntimeException {
  public WidgetNotFoundException() {
    super("Widget not found");
  }
}
