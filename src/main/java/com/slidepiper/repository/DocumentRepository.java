package com.slidepiper.repository;

import com.slidepiper.model.entity.Document;
import org.springframework.data.repository.Repository;

public interface DocumentRepository extends Repository<Document, Long> {
    Document findByFriendlyId(String friendlyId);
    Document save(Document entity);
}