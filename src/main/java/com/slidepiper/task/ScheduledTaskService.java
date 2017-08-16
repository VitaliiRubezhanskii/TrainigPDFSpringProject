package com.slidepiper.task;

interface ScheduledTaskService {
    Task initialize(Task task);

    void abort(Task task);

    void start(Task task);

    Task execute(Task task);

    void complete(Task task);
}