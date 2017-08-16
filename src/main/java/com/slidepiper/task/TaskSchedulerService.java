package com.slidepiper.task;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Objects;

@Service
class TaskSchedulerService {
    private static final Logger log = LoggerFactory.getLogger(TaskSchedulerService.class);

    private final DocumentScheduledTaskService documentScheduledTaskService;
    private final TaskRepository taskRepository;

    TaskSchedulerService(DocumentScheduledTaskService documentScheduledTaskService,
                         TaskRepository taskRepository) {
        this.documentScheduledTaskService = documentScheduledTaskService;
        this.taskRepository = taskRepository;
    }

    @Scheduled(fixedRate = 3600000)
    private void scheduler() {
        Timestamp endTimestamp = new Timestamp(System.currentTimeMillis());
        Timestamp beginTimestamp = new Timestamp(endTimestamp.getTime() - 24 * 60 * 60 * 1000);
        List<Task> tasks = taskRepository.findFirst1000ByCustomerIdIsNotNullAndUserIdIsNotNullAndEnabledIsTrueAndInitializedAtIsNullAndDueAtIsBetweenOrderByDueAtAsc(beginTimestamp, endTimestamp);

        try {
            for (Task task : tasks) {
                task = documentScheduledTaskService.initialize(task);

                switch (task.getType()) {
                    case DOCUMENT:
                        if (Objects.isNull(((DocumentTask) task).getDocumentId())) {
                            documentScheduledTaskService.abort(task);
                        } else {
                            documentScheduledTaskService.start(task);
                        }
                        break;
                }
            }
        } catch (ObjectOptimisticLockingFailureException e) {
            log.info("{}: Scheduler already in progress", e.getClass().getCanonicalName());
        }
    }
}