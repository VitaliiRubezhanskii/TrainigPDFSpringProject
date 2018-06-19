package com.slidepiper.model.entity.widget;

import com.slidepiper.enums.DocumentStatus;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "upload_document_widget_docs_for_customer")
@Getter
@Setter
public class UploadDocumentWidgetDocsForCustomer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;

    @OneToOne
    @JoinColumn(name = "widget_id", referencedColumnName = "id")
    UploadDocumentWidget widget;

    private int templateId;

    private String documentName;

    private boolean canUpdate;

    private String comment;

    @Enumerated(EnumType.STRING)
    private DocumentStatus status;

    public UploadDocumentWidgetDocsForCustomer() {
    }

    public UploadDocumentWidgetDocsForCustomer(UploadDocumentWidget widget, int templateId, String documentName, boolean canUpdate, String comment, DocumentStatus status) {
        this.widget = widget;
        this.templateId = templateId;
        this.documentName = documentName;
        this.canUpdate = canUpdate;
        this.comment = comment;
        this.status = status;
    }
}