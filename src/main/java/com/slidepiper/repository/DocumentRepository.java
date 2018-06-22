package com.slidepiper.repository;

import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.Viewer;
import org.springframework.data.jpa.repository.Query;
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

    @Query(value = "SELECT * FROM slides WHERE sales_man_email = :email AND status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION') AND slides.id_ai NOT IN (SELECT slide_id FROM customer_slide);"
            , nativeQuery = true)
    List<Document> findDocumentBySalesManEmail(@Param("email") String email);

    @Query("select document from Document  document" +
            " where document.viewer.email=:email")
    List<Document> findDocumentBySalesManEmail(@Param("email") String email);

    @Query("select document from Document document" +
            " where document.friendlyId=:friendlyId" +
            " and document.status in ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')")
    Document getDocumentFromFileHash(@Param("friendlyId") String friendlyId);
}