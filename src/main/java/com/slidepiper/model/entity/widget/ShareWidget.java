package com.slidepiper.model.entity.widget;

import com.slidepiper.converter.ShareWidgetDataStringConverter;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("11")
@Getter
public class ShareWidget extends Widget {

    @Column(name = "data")
    @Convert(converter = ShareWidgetDataStringConverter.class)
    public ShareWidgetData data;

    @Component
    @Getter
    @Setter
    public static class ShareWidgetData {
        private boolean enabled;
        private int widgetId;

        private String url;
        @Value("${slidepiper.widget.shareWidget.data.defaultTitle}") private String title;
        @Value("${slidepiper.widget.shareWidget.data.defaultDescription}") private String description;
        @Value("${slidepiper.widget.shareWidget.data.defaultImageUrl}") private String imageUrl;
        @Value("${slidepiper.widget.shareWidget.data.defaultButtonColor}") private String buttonColor;
        @Value("${slidepiper.widget.shareWidget.data.defaultButtonText}") private String buttonText;
        @Value("${slidepiper.widget.shareWidget.data.defaultIsButtonColorCustom}") private boolean buttonColorCustom;
    }
}
