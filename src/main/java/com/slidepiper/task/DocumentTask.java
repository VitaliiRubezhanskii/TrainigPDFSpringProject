package com.slidepiper.task;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("DOCUMENT")
@Getter(AccessLevel.PACKAGE)
@Setter(AccessLevel.PRIVATE)
class DocumentTask extends Task {
    private Long documentId;

    @Convert(converter = DocumentTaskDataConverter.class)
    private DocumentTaskData data = null;
}