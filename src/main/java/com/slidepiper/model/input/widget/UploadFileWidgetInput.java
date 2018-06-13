package com.slidepiper.model.input.widget;

import lombok.Data;

import java.util.ArrayList;

@Data
public class UploadFileWidgetInput {
    private int widgetId;
    private String icon;
    private int pageFrom;
    private int pageTo;
    private String buttonText1;
    private String buttonText2;
    private Boolean isEnabled;
    private Object[] documents;
}