package com.slidepiper.model.entity;

import com.slidepiper.model.customer.Customer;
import com.slidepiper.model.entity.widget.Widget;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
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
        UPDATED
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

    @Column(name = "is_process_mode")
    private boolean processMode = false;

    @Column(name = "is_mfa_enabled")
    private boolean mfaEnabled = false;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "customer_slide",
            joinColumns = { @JoinColumn(name = "slide_id") },
            inverseJoinColumns = { @JoinColumn(name = "customer_id") })
    private Set<Customer> customers;

    public Document() {}

    public Document(Viewer viewer, Status status, String name, Boolean processMode, Boolean mfaEnabled) {
        this.viewer = viewer;
        this.status = status;
        this.name = name;
        this.processMode = processMode;
        this.mfaEnabled = mfaEnabled;
    }
}