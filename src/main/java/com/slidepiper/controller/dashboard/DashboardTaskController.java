package com.slidepiper.controller.dashboard;

import com.slidepiper.service.dashboard.DashboardTaskService;
import com.slidepiper.task.Task;
import com.slidepiper.task.TaskValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardTaskController {
    private final DashboardTaskService dashboardTaskService;
    private final TaskValidator taskValidator;

    @Autowired
    public DashboardTaskController(DashboardTaskService dashboardTaskService,
                                   TaskValidator taskValidator) {
        this.dashboardTaskService = dashboardTaskService;
        this.taskValidator = taskValidator;
    }

    @GetMapping("/api/v1/tasks")
    public List<Task> getAllTasks() {
        return dashboardTaskService.getAllTasks();
    }

    @GetMapping("/api/v1/tasks/{taskId}")
    public Task getTask(@PathVariable("taskId") long taskId) {
        return dashboardTaskService.getTask(taskId);
    }

    @PostMapping("/api/v1/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public void createTask(@RequestBody Task task, BindingResult bindingResult) throws BindException {
        taskValidator.validate(task, bindingResult);
        if (bindingResult.hasErrors()) {
            throw new BindException(bindingResult);
        } else {
            dashboardTaskService.createTask(task);
        }

    }

    @PutMapping("/api/v1/tasks/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateTask(@PathVariable("taskId") long taskId,
                           @RequestBody Task task,
                           BindingResult bindingResult) throws BindException {
        taskValidator.validate(task, bindingResult);
        if (bindingResult.hasErrors()) {
            throw new BindException(bindingResult);
        } else {
            dashboardTaskService.updateTask(taskId, task);
        }
    }

    @DeleteMapping("/api/v1/tasks/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable("taskId") long taskId) {
        dashboardTaskService.deleteTask(taskId);
    }
}