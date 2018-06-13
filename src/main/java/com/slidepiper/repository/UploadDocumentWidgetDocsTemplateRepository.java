package com.slidepiper.repository;

import com.slidepiper.model.entity.widget.UploadDocumentWidget;
import com.slidepiper.model.entity.widget.UploadDocumentWidgetDocsTemplate;
import org.springframework.data.repository.Repository;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

public interface UploadDocumentWidgetDocsTemplateRepository extends Repository<UploadDocumentWidgetDocsTemplate, Integer> {
    UploadDocumentWidgetDocsTemplate findById(int id);

    UploadDocumentWidgetDocsTemplate findByDocumentNameAndWidget(String docName, UploadDocumentWidget widget);

    List<UploadDocumentWidgetDocsTemplate> getAllByWidget(UploadDocumentWidget widget);

    List<UploadDocumentWidgetDocsTemplate> getAllByWidgetAAndDeleted(UploadDocumentWidget widget, boolean deleted);

    @PreAuthorize("hasRole('ROLE_USER')")
    UploadDocumentWidgetDocsTemplate save(UploadDocumentWidgetDocsTemplate entity);
}