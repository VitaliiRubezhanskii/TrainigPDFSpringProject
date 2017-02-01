package com.slidepiper.model.entity.widget;

import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;

@Entity
@Inheritance
@DiscriminatorColumn(name = "type")
public abstract class Widget {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  protected long id;
  
  @Column(name = "FK_file_id_ai")
  protected long documentId;
}
