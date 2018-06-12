package com.slidepiper.repository;

import com.slidepiper.model.entity.Channel;
import com.slidepiper.model.entity.Viewer;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;

public interface ViewerRepository extends Repository<Viewer, Long> {
    @PreAuthorize("hasRole('ROLE_USER')")
    Viewer findByEmail(String email);

    Viewer findByUserId(long userId);

    Viewer save(Viewer entity);

    @Query("select viewer from Viewer viewer where viewer.email=:email")
    Viewer findChannelByEmail(@Param("email") String email);
}