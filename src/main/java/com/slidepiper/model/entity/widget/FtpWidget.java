package com.slidepiper.model.entity.widget;

import com.slidepiper.converter.FtpWidgetDataStringConverter;
import lombok.Getter;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

@Entity
@DiscriminatorValue("FTP")
@Getter
public class FtpWidget extends Widget {

    @Column(name = "data")
    @Convert(converter = FtpWidgetDataStringConverter.class)
    private FtpWidgetData data;

    @Getter
    public static class FtpWidgetData {
        public enum Scheme {SFTP}
        private Scheme scheme;

        @NotNull private String username;
        @NotNull private String password;
        @NotNull private String host;
        private int port;
        @Pattern(regexp = "^[/].*[^/]$") private String path;
    }
}
