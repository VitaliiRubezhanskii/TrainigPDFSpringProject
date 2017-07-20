package com.slidepiper.model.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "msg_info")
@Getter
@Setter
public class Channel {
    @Column(name = "id_ai")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "id")
    private String friendlyId;

    @ManyToOne
    @JoinColumn(name = "slides_id", referencedColumnName = "id")
    private Document document;
}