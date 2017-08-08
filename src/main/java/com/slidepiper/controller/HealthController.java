package com.slidepiper.controller;

import com.slidepiper.repository.HealthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    private final HealthRepository healthRepository;

    @Autowired
    public HealthController(HealthRepository healthRepository) {
        this.healthRepository = healthRepository;
    }

    @GetMapping("/health")
    public String health() {
        String status = healthRepository.findById(1).getStatus().name();
        return status;
    }
}