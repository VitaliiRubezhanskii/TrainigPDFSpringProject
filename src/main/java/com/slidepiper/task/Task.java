package com.slidepiper.task;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeInfo.As;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;

import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;
import java.sql.Timestamp;

@Entity
@DiscriminatorColumn(name = "type")
@Data
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = As.PROPERTY, property = "type", visible = true)
@JsonSubTypes({@Type(value = DocumentTask.class, name = "DOCUMENT")})
@JsonSerialize(using = TaskSerializer.class)
public abstract class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private Timestamp dueAt;

    private Timestamp initializedAt;

    private Timestamp abortedAt;

    private Timestamp executedAt;

    private Timestamp completedAt;

    private boolean enabled;

    private Long userId;

    private Long customerId;

    @Column(insertable = false, updatable = false)
    @Enumerated(EnumType.STRING)
    @NotNull
    private TaskType type;

    @Enumerated(EnumType.STRING)
    @NotNull
    private TaskAction action;

    @Version
    private int version;
}