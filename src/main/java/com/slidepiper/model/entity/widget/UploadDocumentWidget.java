package com.slidepiper.model.entity.widget;

import com.slidepiper.model.entity.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;

import javax.persistence.*;

@Entity
@Table(name = "upload_document_widget")
@Getter
@Setter
public class UploadDocumentWidget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "salesman_id", referencedColumnName = "id")
    Viewer salesMan;

    @ManyToOne
    @JoinColumn(name = "document_id", referencedColumnName = "id_ai")
    Document document;

    @ManyToOne
    @JoinColumn(name = "customer_document_id", referencedColumnName = "id")
    CustomerDocument customerDocument;

    private String icon;

    private int pageFrom;

    private int pageTo;

    private boolean status;

    private String buttonText1;

    private String buttonText2;

    @Column(name = "enabled")
    private boolean isEnabled;

    public UploadDocumentWidget() {
    }

    public UploadDocumentWidget(Viewer salesMan, Document document, String icon, int pageFrom, int pageTo, boolean status, String buttonText1, String buttonText2, boolean isEnabled) {
        this.salesMan = salesMan;
        this.document = document;
        this.icon = icon;
        this.pageFrom = pageFrom;
        this.pageTo = pageTo;
        this.status = status;
        this.buttonText1 = buttonText1;
        this.buttonText2 = buttonText2;
        this.isEnabled = isEnabled;
    }
}