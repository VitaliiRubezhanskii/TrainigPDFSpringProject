package com.slidepiper.model.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.slidepiper.widget.WidgetSerializer;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "customer_documents")
@Getter
@Setter
public class CustomerDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    Customer customer;

    @ManyToOne
    @JoinColumn(name = "salesman_id", referencedColumnName = "id")
    Viewer salesMan;

    @ManyToOne
    @JoinColumn(name = "channel_id", referencedColumnName = "id_ai")
    Channel channel;

    public enum Status {
        CREATED,
        DELETED,
        DISABLED,
        UPDATED
    }
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private CustomerDocument.Status status;

    @Column(name = "version_id")
    private String versionId;

    @Column(name = "friendly_id")
    private String friendlyId;

    private String name;

    public CustomerDocument() {
    }

    public CustomerDocument(Customer customer, Viewer viewer, Channel channel, CustomerDocument.Status status, String name) {
        this.customer = customer;
        this.salesMan = viewer;
        this.channel = channel;
        this.status = status;
        this.name = name;
    }
}