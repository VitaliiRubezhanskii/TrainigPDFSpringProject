package com.slidepiper.model.entity;

import lombok.Data;

import javax.persistence.*;

@Data
@Entity(name="ip_whitelist")
public class IpWhiteList {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    @Column(name = "FK_file_id_ai")
    private int fileId;

    @Column(name = "whitelist_ip")
    private String whiteListIP;




}
