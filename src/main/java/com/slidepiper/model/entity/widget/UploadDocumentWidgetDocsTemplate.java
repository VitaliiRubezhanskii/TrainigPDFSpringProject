package com.slidepiper.model.entity.widget;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "upload_document_widget_docs_template")
@Getter
@Setter
public class UploadDocumentWidgetDocsTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;

    @OneToOne
    @JoinColumn(name = "widget_id", referencedColumnName = "id")
    UploadDocumentWidget widget;

    private String documentName;

    private boolean canUpdate;

    private boolean deleted;

    public UploadDocumentWidgetDocsTemplate() {
    }

    public UploadDocumentWidgetDocsTemplate(UploadDocumentWidget widget, String documentName, boolean canUpdate, boolean deleted) {
        this.widget = widget;
        this.documentName = documentName;
        this.canUpdate = canUpdate;
        this.deleted = deleted;
    }
}