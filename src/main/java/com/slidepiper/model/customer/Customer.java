package com.slidepiper.model.customer;

import com.slidepiper.converter.CustomerDataConverter;
import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

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

    @Column(name = "company")
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