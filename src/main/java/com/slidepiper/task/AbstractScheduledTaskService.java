package com.slidepiper.task;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.model.entity.Event;
import com.slidepiper.repository.EventRepository;
import com.slidepiper.repository.ViewerRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Service
abstract class AbstractScheduledTaskService implements ScheduledTaskService {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final EventRepository eventRepository;
    private final TaskRepository taskRepository;
    final ViewerRepository viewerRepository;

    AbstractScheduledTaskService(EventRepository eventRepository,
                                 TaskRepository taskRepository,
                                 ViewerRepository viewerRepository) {
        this.eventRepository = eventRepository;
        this.taskRepository = taskRepository;
        this.viewerRepository = viewerRepository;
    }

    @Override
    public Task initialize(Task task) {
        task.setInitializedAt(new Timestamp(System.currentTimeMillis()));
        task = taskRepository.saveAndFlush(task);

        // Save event.
        String username = viewerRepository.findByUserId(task.getUserId()).getEmail();
        ObjectNode data = objectMapper.createObjectNode();
        data.put("taskId", task.getId());
        data.put("initializedAt", task.getInitializedAt().getTime());
        eventRepository.save(new Event(username, Event.EventType.INITIALIZED_TASK, data));

        return task;
    }

    @Override
    public void abort(Task task, TaskInvalidException e) {
        e.printStackTrace();

        task.setAbortedAt(new Timestamp(System.currentTimeMillis()));
        taskRepository.saveAndFlush(task);

        // Save event.
        String username = viewerRepository.findByUserId(task.getUserId()).getEmail();
        ObjectNode data = objectMapper.createObjectNode();
        data.put("taskId", task.getId());
        data.put("abortedAt", task.getAbortedAt().getTime());
        eventRepository.save(new Event(username, Event.EventType.ABORTED_TASK, data));
    }

    @Override
    public void fail(Task task, RuntimeException e) {
        e.printStackTrace();

        task.setFailedAt(new Timestamp(System.currentTimeMillis()));
        taskRepository.saveAndFlush(task);

        // Save event.
        String username = viewerRepository.findByUserId(task.getUserId()).getEmail();
        ObjectNode data = objectMapper.createObjectNode();
        data.put("taskId", task.getId());
        data.put("failedAt", task.getFailedAt().getTime());
        eventRepository.save(new Event(username, Event.EventType.FAILED_TASK, data));
    }

    @Override
    public void complete(Task task) {
        task.setCompletedAt(new Timestamp(System.currentTimeMillis()));
        taskRepository.saveAndFlush(task);

        // Save event.
        String username = viewerRepository.findByUserId(task.getUserId()).getEmail();
        ObjectNode data = objectMapper.createObjectNode();
        data.put("taskId", task.getId());
        data.put("completedAt", task.getCompletedAt().getTime());
        eventRepository.save(new Event(username, Event.EventType.COMPLETED_TASK, data));
    }
}