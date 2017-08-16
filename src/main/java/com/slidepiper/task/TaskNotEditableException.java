package com.slidepiper.task;

public class TaskNotEditableException extends RuntimeException {
    public TaskNotEditableException() {
        super("Task not editable");
    }
}