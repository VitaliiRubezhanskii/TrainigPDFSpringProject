package com.slidepiper.model.entity.widget;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.slidepiper.model.entity.Document;
import com.slidepiper.widget.WidgetSerializer;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
@DiscriminatorColumn(name = "type")
@Getter
@Setter
@JsonSerialize(using = WidgetSerializer.class)
public abstract class Widget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    boolean enabled;

    @Column(insertable = false, updatable = false)
    private String type;

    @ManyToOne
    @JoinColumn(name = "FK_file_id_ai", referencedColumnName = "id_ai")
    Document document;
}