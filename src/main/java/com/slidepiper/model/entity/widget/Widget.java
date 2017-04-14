package com.slidepiper.model.entity.widget;

import com.slidepiper.model.entity.Document;
import lombok.Getter;
import lombok.Setter;

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
public abstract class Widget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    boolean enabled;

    @ManyToOne
    @JoinColumn(name = "FK_file_id_ai", referencedColumnName = "id_ai")
    Document document;
}
