package com.slidepiper.health;

import org.springframework.data.repository.Repository;

public interface HealthRepository extends Repository<Health, Integer> {
    Health findById(int id);
}