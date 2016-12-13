package com.slidepiper.data.model.userevent;

import org.springframework.data.repository.Repository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import com.slidepiper.Routes;

@RepositoryRestResource(collectionResourceRel = Routes.USER_EVENTS, path = Routes.USER_EVENTS)
public interface UserEventRepository extends Repository<UserEvent, Long> {
  UserEvent save(UserEvent entity);
}
