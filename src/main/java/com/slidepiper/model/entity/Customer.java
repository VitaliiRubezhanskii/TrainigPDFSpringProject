package com.slidepiper.model.entity;

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
}