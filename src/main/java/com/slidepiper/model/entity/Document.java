package com.slidepiper.model.entity;

import com.slidepiper.model.entity.widget.Widget;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import java.io.Serializable;
import java.util.Set;

@Entity
@Table(name = "slides")
@Getter
@Setter
public class Document implements Serializable {
    @Column(name = "id_ai")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "id")
    private String friendlyId;

    public enum Status {
        CREATED,
        DELETED,
        DISABLED,
        UPDATED,
        BEFORE_AWS_S3_TRANSITION
    }
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private Status status;

    private String name;

    @Column(name = "version_id")
    private String versionId;

    @Column(name = "file_link")
    private String alternativeUrl;

    @Column(name = "is_ip_whitelist")
    private boolean ipRestricted;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL)
    private Set<Widget> widgets;

    @ManyToOne
    @JoinColumn(name = "sales_man_email", referencedColumnName = "email")
    private Viewer viewer;

    public Document() {}

    public Document(Viewer viewer, Status status, String name) {
        this.viewer = viewer;
        this.status = status;
        this.name = name;
    }
}