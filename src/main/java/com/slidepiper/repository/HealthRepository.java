package com.slidepiper.repository;

import com.slidepiper.model.entity.Health;
import org.springframework.data.repository.Repository;

public interface HealthRepository extends Repository<Health, Integer> {
    Health findById(Integer id);
}