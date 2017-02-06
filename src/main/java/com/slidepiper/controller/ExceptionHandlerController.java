package com.slidepiper.controller;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.slidepiper.model.exception.WidgetDisabledException;
import com.slidepiper.model.exception.WidgetNotFoundException;
import com.slidepiper.model.output.ExceptionResponseOutput;

@RestControllerAdvice
public class ExceptionHandlerController {
  
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  @ExceptionHandler(Exception.class)
  public void handleInternalServerError(Exception e) {
    e.printStackTrace();
  }
  
  // TODO: Return response similar to ErrorResponse.
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public List<ObjectError> handleBadRequest(MethodArgumentNotValidException e) {
    return e.getBindingResult().getAllErrors();
  }
  
  @ResponseStatus(HttpStatus.NOT_FOUND)
  @ExceptionHandler({WidgetDisabledException.class, WidgetNotFoundException.class})
  public ExceptionResponseOutput handleNotFound(RuntimeException e, HttpServletRequest request) {
    return new ExceptionResponseOutput(e, request);
  }
}
