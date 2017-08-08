package com.slidepiper.repository;

import com.slidepiper.model.entity.Viewer;
import org.springframework.data.repository.Repository;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

public interface ViewerRepository extends Repository<Viewer, Long> {
    @PreAuthorize("hasRole('ROLE_USER')")
    Viewer findByEmail(String email);

    @PreAuthorize("hasRole('ROLE_USER')")
    Viewer findByUserId(long id);

    // TODO: Add @PreAuthorize("hasRole('ROLE_USER')") after migration.
    Viewer save(Viewer entity);

    /** @deprecated  */
    List<Viewer> findAll();
}