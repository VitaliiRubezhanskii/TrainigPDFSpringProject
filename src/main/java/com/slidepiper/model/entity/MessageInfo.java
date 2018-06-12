package com.slidepiper.model.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "msg_info")
@Getter
@Setter
public class MessageInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ai")
    private int idAi;

    @Column(name = "id")
    private String id;

    @Column(name = "sales_man_email")
    private String salesManEmail;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(name = "slides_id")
    private String slidesId;

    @Column(name = "msg_text")
    private String messageText;

    @Column(name = "timestamp")
    private Timestamp timestamp;


    public MessageInfo() {
    }

    public MessageInfo(String id, String salesManEmail, String customerEmail,
                       String slidesId, String messageText, Timestamp timestamp) {
        this.id = id;
        this.salesManEmail = salesManEmail;
        this.customerEmail = customerEmail;
        this.slidesId = slidesId;
        this.messageText = messageText;
        this.timestamp = timestamp;
    }
}
