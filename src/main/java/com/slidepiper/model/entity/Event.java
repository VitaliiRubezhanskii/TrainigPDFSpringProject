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
        SIGNUP_USER,
        LOGIN_USER,
        ADDED_CUSTOMER,
        CLICKED_HELP_BUTTON,
        CLICKED_TOOLBAR_SETTINGS,
        GENERATED_DOCUMENT_LINK,
        UPLOADED_CUSTOMERS,
        CLONED_DOCUMENT,
        CREATED_DOCUMENT,
        UPDATED_DOCUMENT,
        DELETED_DOCUMENT,
        CREATED_TASK,
        UPDATED_TASK,
        DELETED_TASK,
        INITIALIZED_TASK,
        ABORTED_TASK,
        FAILED_TASK,
        COMPLETED_TASK,
        SENT_EMAIL
    }
    @Column(name = "event_name")
    @Enumerated(EnumType.STRING)
    private EventType type;

    private String email;

    @Column(name = "extra_data")
    @Convert(converter = JsonNodeStringConverter.class)
    private JsonNode data;

    public Event() {}

    public Event(String email, EventType type) {
        this.email = email;
        this.type = type;
    }

    public Event(String email, EventType type, JsonNode data) {
        this.email = email;
        this.type = type;
        this.data = data;
    }
}