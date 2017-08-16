package com.slidepiper.service.dashboard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.model.entity.Event;
import com.slidepiper.repository.EventRepository;
import com.slidepiper.repository.ViewerRepository;
import com.slidepiper.service.user.UserService;
import com.slidepiper.task.Task;
import com.slidepiper.task.TaskNotEditableException;
import com.slidepiper.task.TaskNotFoundException;
import com.slidepiper.task.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardTaskService {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final EventRepository eventRepository;
    private final TaskRepository taskRepository;
    private final UserService userService;
    private final ViewerRepository viewerRepository;

    @Autowired
    public DashboardTaskService(EventRepository eventRepository,
                                TaskRepository taskRepository,
                                UserService userService,
                                ViewerRepository viewerRepository) {
        this.eventRepository = eventRepository;
        this.taskRepository = taskRepository;
        this.userService = userService;
        this.viewerRepository = viewerRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findByUserId(userService.getUserId());
    }

    public Task getTask(long taskId) {
        if (!isTaskIdValid(taskId)) {
            throw new TaskNotFoundException();
        } else {
            return taskRepository.findById(taskId);
        }
    }

    public void createTask(Task task) {
        task.setUserId(userService.getUserId());
        taskRepository.save(task);

        // Save event.
        ObjectNode data = objectMapper.createObjectNode();
        data.put("taskId", task.getId());
        eventRepository.save(new Event(viewerRepository.findByUserId(userService.getUserId()).getEmail(), Event.EventType.CREATED_TASK, data));
    }

    public void updateTask(long taskId, Task task) {
        if (!isTaskIdValid(taskId)) {
            throw new TaskNotFoundException();
        } else if (!isTaskEditable(taskId)) {
            throw new TaskNotEditableException();
        } else {
            task.setId(taskId);
            task.setUserId(userService.getUserId());

            // TODO: Resolve version bypass mechanism.
            task.setVersion(taskRepository.findById(taskId).getVersion());

            taskRepository.save(task);

            // Save event.
            ObjectNode data = objectMapper.createObjectNode();
            data.put("taskId", task.getId());
            eventRepository.save(new Event(viewerRepository.findByUserId(userService.getUserId()).getEmail(), Event.EventType.UPDATED_TASK, data));
        }
    }

    public void deleteTask(long taskId) {
        if (!isTaskIdValid(taskId)) {
            throw new TaskNotFoundException();
        } else if (!isTaskEditable(taskId)) {
            throw new TaskNotEditableException();
        } else {
            Task task = taskRepository.findById(taskId);
            taskRepository.delete(task);

            // Save event.
            ObjectNode data = objectMapper.createObjectNode();
            data.put("taskId", task.getId());
            eventRepository.save(new Event(viewerRepository.findByUserId(userService.getUserId()).getEmail(), Event.EventType.DELETED_TASK, data));
        }
    }

    private boolean isTaskIdValid(long taskId) {
        Task task = taskRepository.findById(taskId);
        if (Objects.nonNull(task) && task.getUserId() == userService.getUserId()) {
            return true;
        } else {
            return false;
        }
    }

    private boolean isTaskEditable(long taskId) {
        Task task = taskRepository.findById(taskId);
        if (Objects.isNull(task.getInitializedAt())) {
            return true;
        } else {
            return false;
        }
    }
}