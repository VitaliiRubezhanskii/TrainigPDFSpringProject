package com.slidepiper.controller;

import com.slidepiper.exception.WidgetDisabledException;
import com.slidepiper.exception.WidgetNotFoundException;
import com.slidepiper.task.TaskNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class ExceptionHandlerController {
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public void handleInternalServerError(Exception e) {
        e.printStackTrace();
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler({BindException.class, MethodArgumentNotValidException.class})
    public void handleBadRequest() {}

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler({WidgetDisabledException.class, WidgetNotFoundException.class, TaskNotFoundException.class})
    public void handleNotFound() {}
}