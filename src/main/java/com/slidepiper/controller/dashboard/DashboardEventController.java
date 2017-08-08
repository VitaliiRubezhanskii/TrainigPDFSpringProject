package com.slidepiper.controller.dashboard;

import com.slidepiper.model.entity.Event;
import com.slidepiper.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardEventController {
    private EventRepository eventRepository;

    @Autowired
    public DashboardEventController(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @PostMapping("/api/v1/events")
    @ResponseStatus(HttpStatus.CREATED)
    public void saveEvent(Principal principal, @RequestBody Event event) {
        event.setEmail(principal.getName());
        eventRepository.save(event);
    }
}