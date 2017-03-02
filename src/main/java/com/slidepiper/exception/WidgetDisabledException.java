package com.slidepiper.exception;

@SuppressWarnings("serial")
public class WidgetDisabledException extends RuntimeException {
  public WidgetDisabledException() {
    super("Widget is disabled");
  }
}
