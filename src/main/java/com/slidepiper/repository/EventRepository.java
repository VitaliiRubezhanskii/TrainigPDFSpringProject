package com.slidepiper.repository;

import org.springframework.data.repository.Repository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import com.slidepiper.Routes;
import com.slidepiper.model.entity.Event;

@RepositoryRestResource(collectionResourceRel = Routes.EVENTS, path = Routes.EVENTS)
public interface EventRepository extends Repository<Event, Long> {
  Event save(Event entity);
}
