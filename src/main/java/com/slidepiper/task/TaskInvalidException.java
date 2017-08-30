package com.slidepiper.task;

public class TaskInvalidException extends RuntimeException {
    public TaskInvalidException(String message) {
        super(message);
    }
}