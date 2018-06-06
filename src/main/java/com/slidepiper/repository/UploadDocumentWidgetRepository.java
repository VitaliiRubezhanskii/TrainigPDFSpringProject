package com.slidepiper.repository;

import com.slidepiper.model.entity.CustomerDocument;
import com.slidepiper.model.entity.widget.UploadDocumentWidget;
import org.springframework.data.repository.Repository;
import org.springframework.security.access.prepost.PreAuthorize;

public interface UploadDocumentWidgetRepository extends Repository<UploadDocumentWidget, Integer> {
    UploadDocumentWidget findById(int id);

    @PreAuthorize("hasRole('ROLE_USER')")
    UploadDocumentWidget save(UploadDocumentWidget entity);
}