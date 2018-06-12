package com.slidepiper.repository;

import com.slidepiper.model.entity.widget.UploadDocumentWidget;
import com.slidepiper.model.entity.widget.UploadDocumentWidgetDocsTemplate;
import org.springframework.data.repository.Repository;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

public interface UploadDocumentWidgetDocsTemplateRepository extends Repository<UploadDocumentWidgetDocsTemplate, Integer> {
    UploadDocumentWidgetDocsTemplate findById(int id);

    List<UploadDocumentWidgetDocsTemplate> getAllByWidget(UploadDocumentWidget widget);

    @PreAuthorize("hasRole('ROLE_USER')")
    UploadDocumentWidgetDocsTemplate save(UploadDocumentWidgetDocsTemplate entity);
}