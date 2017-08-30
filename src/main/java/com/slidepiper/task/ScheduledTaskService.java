package com.slidepiper.task;

interface ScheduledTaskService {
    void execute(Task task);

    Task initialize(Task task);

    void validate(Task task);

    void abort(Task task, TaskInvalidException e);

    void fail(Task task, RuntimeException e);

    void complete(Task task);
}