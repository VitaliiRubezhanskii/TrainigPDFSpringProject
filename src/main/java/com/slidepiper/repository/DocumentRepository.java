package com.slidepiper.repository;

import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.Viewer;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

public interface DocumentRepository extends Repository<Document, Long> {
    Document findById(long id);
    Document findByFriendlyId(String friendlyId);

    @PreAuthorize("hasRole('ROLE_USER')")
    Document save(Document entity);

    List<Document> findDocumentByViewer(Viewer salesMan);
}