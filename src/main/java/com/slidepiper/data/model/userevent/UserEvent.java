package com.slidepiper.data.model.userevent;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.databind.JsonNode;
import com.slidepiper.data.JsonNodeStringConverter;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "salesman_events")
@Getter
@Setter
public class UserEvent {
  
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;
  
  @Column(name = "event_name")
  @Enumerated(EnumType.STRING)
  private UserEventType eventType;
  
  private String email;
  
  @Column(name = "extra_data")
  @Convert(converter = JsonNodeStringConverter.class)
  private JsonNode extraData;
}
