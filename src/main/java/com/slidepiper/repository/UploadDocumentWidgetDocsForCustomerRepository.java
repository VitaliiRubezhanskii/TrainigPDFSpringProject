package com.slidepiper.repository;

import com.slidepiper.model.entity.widget.UploadDocumentWidget;
import com.slidepiper.model.entity.widget.UploadDocumentWidgetDocsForCustomer;
import org.springframework.data.repository.Repository;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

public interface UploadDocumentWidgetDocsForCustomerRepository extends Repository<UploadDocumentWidgetDocsForCustomer, Integer> {
    UploadDocumentWidgetDocsForCustomer findById(int id);

    UploadDocumentWidgetDocsForCustomer findByDocumentNameAndWidget(String docName, UploadDocumentWidget widget);

    List<UploadDocumentWidgetDocsForCustomer> getAllByWidget(UploadDocumentWidget widget);

    @PreAuthorize("hasRole('ROLE_USER')")
    UploadDocumentWidgetDocsForCustomer save(UploadDocumentWidgetDocsForCustomer entity);
}