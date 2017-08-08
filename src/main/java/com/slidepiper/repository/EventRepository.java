package com.slidepiper.repository;

import com.slidepiper.model.entity.Event;
import org.springframework.data.repository.Repository;

public interface EventRepository extends Repository<Event, Long> {
    Event save(Event entity);
}