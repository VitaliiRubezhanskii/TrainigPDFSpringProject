package com.slidepiper.model.entity.widget;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

import com.slidepiper.model.converter.ShareDataStringConverter;

import lombok.Getter;

@Entity
@DiscriminatorValue("11")
public class ShareWidget extends Widget {
  
  @Column(name = "data")
  @Getter
  @Convert(converter = ShareDataStringConverter.class)
  private ShareData data;
}
