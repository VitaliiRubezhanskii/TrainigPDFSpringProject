package com.slidepiper.model.entity;

import com.slidepiper.converter.UserExtraDataStringConverter;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

@Entity
@Table(name = "sales_men")
@Getter
@Setter
public class User implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String email;

    @Column(name = "email_alert_enabled")
    private boolean viewerOpenDocumentEmailEnabled;

    @Column(name = "email_notifications_enabled")
    private boolean viewerEventEmailEnabled;

    @AllArgsConstructor
    @Getter
    @Setter
    public static class ExtraData {
        private String notificationEmail;
    }
    @Column(name = "extra_data")
    @Convert(converter = UserExtraDataStringConverter.class)
    private ExtraData extraData;
}