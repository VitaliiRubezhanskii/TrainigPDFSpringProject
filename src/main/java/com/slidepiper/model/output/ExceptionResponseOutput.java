package com.slidepiper.model.output;

import javax.servlet.http.HttpServletRequest;

public class ExceptionResponseOutput {
  public final String message;
  public final String requestUrl;
  
  public ExceptionResponseOutput(Exception e, HttpServletRequest request) {
    this.message = e.getLocalizedMessage();
    this.requestUrl = request.getRequestURL().toString();
  }
}
