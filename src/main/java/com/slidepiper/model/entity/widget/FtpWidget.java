package com.slidepiper.model.entity.widget;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

import com.slidepiper.model.converter.FtpWidgetDataStringConverter;

import lombok.Getter;

@Entity
@DiscriminatorValue("FTP")
public class FtpWidget extends Widget {
  
  @Column(name = "data")
  @Getter
  @Convert(converter = FtpWidgetDataStringConverter.class)
  private FtpWidgetData data;
}
