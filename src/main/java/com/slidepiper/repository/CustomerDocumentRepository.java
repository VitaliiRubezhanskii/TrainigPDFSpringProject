package com.slidepiper.repository;

import com.slidepiper.model.entity.CustomerDocument;
import org.springframework.data.repository.Repository;
import org.springframework.security.access.prepost.PreAuthorize;

public interface CustomerDocumentRepository extends Repository<CustomerDocument, Long> {
    CustomerDocument findById(long id);
    CustomerDocument findByFriendlyId(String friendlyId);

    @PreAuthorize("hasRole('ROLE_USER')")
    CustomerDocument save(CustomerDocument entity);
}