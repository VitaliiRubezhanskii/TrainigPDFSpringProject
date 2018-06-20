package com.slidepiper.model.customer;

import com.slidepiper.converter.CustomerDataConverter;
import com.slidepiper.model.entity.Document;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Set;

@Entity
@Table(name = "customers")
@Data
public class Customer implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String email;

    private String firstName;

    private String lastName;

    private String company;

    @Convert(converter = CustomerDataConverter.class)
    private CustomerData data;

    // TODO: Replace with user.
    @Column(name = "sales_man")
    private String username;

    @Column(name = "customer_id")
    private String customerId;

    @Column(name = "phone")
    private String phoneNumber;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "customer_slide",
            joinColumns = { @JoinColumn(name = "customer_id") },
            inverseJoinColumns = { @JoinColumn(name = "slide_id") })
    private Set<Document> documents;
}