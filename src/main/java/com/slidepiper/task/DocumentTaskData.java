package com.slidepiper.task;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter(AccessLevel.PACKAGE)
@Setter(AccessLevel.PRIVATE)
class DocumentTaskData extends TaskData implements Serializable {
    private int pageNumber = 1;
    private String taskMessage;
}