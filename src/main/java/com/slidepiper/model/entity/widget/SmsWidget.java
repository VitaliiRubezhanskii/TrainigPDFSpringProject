package com.slidepiper.model.entity.widget;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

import com.slidepiper.model.converter.SmsWidgetDataStringConverter;

import lombok.Getter;

@Entity
@DiscriminatorValue("SMS")
public class SmsWidget extends Widget {
  
  @Column(name = "data")
  @Getter
  @Convert(converter = SmsWidgetDataStringConverter.class)
  private SmsWidgetData data;
}
