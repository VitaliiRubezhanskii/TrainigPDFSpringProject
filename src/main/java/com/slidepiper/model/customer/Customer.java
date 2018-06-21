package com.slidepiper.model.customer;

import com.slidepiper.converter.CustomerDataConverter;
import com.slidepiper.model.entity.Document;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
public class Customer implements Serializable {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;

    @Column(name = "email")
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name="name")
    private String name;

    @Column(name = "company")
    private String company;

    @Convert(converter = CustomerDataConverter.class)
    private CustomerData data;


    @Column(name = "group_name")
    private String customerGroup;

    // TODO: Replace with user.
    @Column(name = "sales_man")
    private String username;

    @Column(name = "customer_id")
    private String customerId;

    @Column(name = "phone")
    private String phoneNumber;
//
//    @ManyToMany(fetch = FetchType.LAZY,
//            cascade = {
//                    CascadeType.PERSIST,
//                    CascadeType.MERGE
//            }, mappedBy = "customerList")
//    private List<Document> documentList;


    public Customer() {
    }

    public Customer(String email, String firstName, String lastName,
                    String company, CustomerData data, String username,
                    String customerId, String phoneNumber) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.company = company;
        this.data = data;
        this.username = username;
        this.customerId = customerId;
        this.phoneNumber = phoneNumber;
    }
}