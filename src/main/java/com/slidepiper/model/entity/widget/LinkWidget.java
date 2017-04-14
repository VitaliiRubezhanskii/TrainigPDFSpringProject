package com.slidepiper.model.entity.widget;

import com.fasterxml.jackson.databind.JsonNode;
import com.slidepiper.converter.JsonNodeStringConverter;
import lombok.Getter;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("9")
@Getter
public class LinkWidget extends Widget {

    @Column(name = "data")
    @Convert(converter = JsonNodeStringConverter.class)
    private JsonNode data;
}
