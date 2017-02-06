package com.slidepiper.model.exception;

@SuppressWarnings("serial")
public class WidgetDisabledException extends RuntimeException {
  public WidgetDisabledException() {
    super("Widget is disabled");
  }
}
