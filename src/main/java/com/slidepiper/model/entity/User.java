package com.slidepiper.model.entity;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.slidepiper.converter.UserExtraDataStringConverter;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "sales_men")
@Getter
@Setter
public class User {
  
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;
  
  private String email;
  
  @AllArgsConstructor
  @Getter
  @Setter
  public static class ExtraData {
    private String notificationEmail;
  }
  @Column(name = "extra_data")
  @Convert(converter = UserExtraDataStringConverter.class)
  private ExtraData extraData;
}
