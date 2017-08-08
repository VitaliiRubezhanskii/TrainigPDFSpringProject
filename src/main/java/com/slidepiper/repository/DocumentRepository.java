package com.slidepiper.repository;

import com.slidepiper.model.entity.Document;
import org.springframework.data.repository.Repository;
import org.springframework.security.access.prepost.PreAuthorize;

public interface DocumentRepository extends Repository<Document, Long> {
    Document findByFriendlyId(String friendlyId);

    @PreAuthorize("hasRole('ROLE_USER')")
    Document save(Document entity);
}