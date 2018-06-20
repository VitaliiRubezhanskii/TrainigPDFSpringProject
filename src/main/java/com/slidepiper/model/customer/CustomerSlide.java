package com.slidepiper.model.customer;


import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "customer_slide")
@Data
public class CustomerSlide implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "key")
    private int key;
    @Column(name = "email")
    private String email;
    @Column(name = "id")
    private String id;

    public CustomerSlide() {
    }

    public CustomerSlide(int key, String email, String id) {
       this(email,id);
        this.key=key;
    }
    public CustomerSlide(String email, String id) {
        this.email = email;
        this.id = id;

    }


}
