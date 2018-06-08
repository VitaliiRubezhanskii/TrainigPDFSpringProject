package com.slidepiper.model.input.widget;

import lombok.Data;

@Data
public class UploadFileWidgetInput {
    private String icon;
    private int pageFrom;
    private int pageTo;
    private String buttonText1;
    private String buttonText2;
    private boolean isEnabled;
}