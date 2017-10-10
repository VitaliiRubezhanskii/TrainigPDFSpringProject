package com.slidepiper.widget;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.jsontype.TypeSerializer;
import com.slidepiper.model.entity.widget.HopperWidget;
import com.slidepiper.model.entity.widget.LinkWidget;
import com.slidepiper.model.entity.widget.Widget;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

public class WidgetSerializer extends JsonSerializer<Widget> {
    private static final String url = System.getProperty("slidepiper.url");

    @Override
    public void serializeWithType(Widget widget, JsonGenerator gen, SerializerProvider provider, TypeSerializer typeSer)
            throws IOException {
        serialize(widget, gen, provider);
    }

    @Override
    public void serialize(Widget widget, JsonGenerator gen, SerializerProvider provider) throws IOException {
        gen.writeStartObject();
        gen.writeStringField("link",
                UriComponentsBuilder
                        .fromHttpUrl(url)
                        .path("/api/v1/widgets/{widgetId}")
                        .buildAndExpand(widget.getId())
                        .toUriString());

        switch (widget.getType()) {
            case "5":
                gen.writeObjectField("items", ((HopperWidget) widget).getData().get("data").get("items"));
                break;

            case "9":
                gen.writeObjectField("items", ((LinkWidget) widget).getData().get("data").get("items"));
                break;
        }

        gen.writeEndObject();
    }
}