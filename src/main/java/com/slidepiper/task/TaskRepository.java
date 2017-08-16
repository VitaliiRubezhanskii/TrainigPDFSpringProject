package com.slidepiper.task;

import org.springframework.data.repository.Repository;
import org.springframework.security.access.prepost.PreAuthorize;

import java.sql.Timestamp;
import java.util.List;

public interface TaskRepository extends Repository<Task, Long> {
    List<Task> findFirst1000ByCustomerIdIsNotNullAndUserIdIsNotNullAndEnabledIsTrueAndInitializedAtIsNullAndDueAtIsBetweenOrderByDueAtAsc(Timestamp beginTimestamp, Timestamp endTimestamp);

    Task saveAndFlush(Task task);

    @PreAuthorize("hasRole('ROLE_USER')")
    List<Task> findByUserId(long userId);

    @PreAuthorize("hasRole('ROLE_USER')")
    Task findById(long id);

    @PreAuthorize("hasRole('ROLE_USER')")
    Task save(Task task);

    @PreAuthorize("hasRole('ROLE_USER')")
    void delete(Task task);
}