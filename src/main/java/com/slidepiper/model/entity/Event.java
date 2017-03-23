package com.slidepiper.model.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.slidepiper.converter.JsonNodeStringConverter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "salesman_events")
@Getter
@Setter
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    public enum EventType {
        ADDED_CUSTOMER,
        CLICKED_HELP_BUTTON,
        CLICKED_TOOLBAR_SETTINGS,
        GENERATED_DOCUMENT_LINK,
        UPLOADED_CUSTOMERS,
        CREATED_DOCUMENT,
        UPDATED_DOCUMENT,
        DELETED_DOCUMENT
    }
    @Column(name = "event_name")
    @Enumerated(EnumType.STRING)
    private EventType eventType;

    private String email;

    @Column(name = "extra_data")
    @Convert(converter = JsonNodeStringConverter.class)
    private JsonNode data;

    public Event() {}

    public Event(String email, EventType eventType, JsonNode data) {
        this.email = email;
        this.eventType = eventType;
        this.data = data;
    }
}
