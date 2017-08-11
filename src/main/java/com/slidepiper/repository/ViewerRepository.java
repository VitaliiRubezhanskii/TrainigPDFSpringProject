package com.slidepiper.repository;

import com.slidepiper.model.entity.Viewer;
import org.springframework.data.repository.Repository;
import org.springframework.security.access.prepost.PreAuthorize;

public interface ViewerRepository extends Repository<Viewer, Long> {
    @PreAuthorize("hasRole('ROLE_USER')")
    Viewer findByEmail(String email);

    Viewer save(Viewer entity);
}