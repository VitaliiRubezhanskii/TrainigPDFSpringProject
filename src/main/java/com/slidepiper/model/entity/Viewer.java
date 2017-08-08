package com.slidepiper.model.entity;

import com.slidepiper.converter.UserDataConverter;
import lombok.Data;

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
@Data
public class Viewer implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "user_id")
    private long userId;

    private String friendlyId;

    // TODO: Remove after migration.
    private String password;
    // TODO: End Remove after migration.

    // TODO: Remove user data.
    private String email;
    private String name;
    @Column(name = "email_alert_enabled") private boolean viewerOpenDocumentEmailEnabled = true;
    @Column(name = "email_notifications_enabled") private boolean viewerEventEmailEnabled = true;

    @Data
    public static class UserData implements Serializable {
        private String notificationEmail;

        public UserData() {}
        public UserData(String notificationEmail) {
            this.notificationEmail = notificationEmail;
        }
    }
    @Convert(converter = UserDataConverter.class)
    @Column(name = "extra_data")
    private UserData data;
    // TODO: End remove user data.

    private String viewer_document_title = "SlidePiper";
    private String viewer_toolbar_background = "#FFF";
    private String viewer_toolbar_button_background = "#1B1862";
    private String viewer_toolbar_button_hover_background;
    private String viewer_toolbar_button_border;
    private String viewer_toolbar_button_hover_border;
    private String viewer_toolbar_button_box_shadow;
    private String viewer_toolbar_button_hover_box_shadow;
    private String viewer_toolbar_color = "#293846";
    private String viewer_toolbar_find_background = "#FFF";
    private String viewer_toolbar_find_color = "#293846";
    private byte[] viewer_toolbar_logo_image;
    private String logo_image = "https://static.slidepiper.com/images/slidepiper/logo-231x50.png";
    private String viewer_toolbar_logo_link = "https://www.slidepiper.com";
    private String viewer_toolbar_logo_collapse_max_width = "650px";
    private String viewer_toolbar_cta_border_radius = "3px";
    private String viewer_toolbar_cta_font = "bold 14px Ariel, sans-serif";
    private String viewer_toolbar_cta_margin = "3px 5px";
    private String viewer_toolbar_cta_padding = "4px 10px 5px";
    private String viewer_toolbar_cta1_is_enabled;
    private String viewer_toolbar_cta1_collapse_max_width = "950px";
    private String viewer_toolbar_cta1_background = "#1B1862";
    private String viewer_toolbar_cta1_color = "#FFF";
    private String viewer_toolbar_cta1_border;
    private String viewer_toolbar_cta1_hover_background;
    private String viewer_toolbar_cat1_hover_border;
    private String viewer_toolbar_cta1_hover_color;
    private String viewer_toolbar_cta1_text;
    private String viewer_toolbar_cta1_link;
    private String viewer_toolbar_cta2_is_enabled;
    private String viewer_toolbar_cta2_collapse_max_width = "1260px";
    private String viewer_toolbar_cta2_background = "#1B1862";
    private String viewer_toolbar_cta2_color = "#FFF";
    private String viewer_toolbar_cta2_border;
    private String viewer_toolbar_cta2_hover_background;
    private String viewer_toolbar_cta2_hover_border;
    private String viewer_toolbar_cta2_hover_color;
    private String viewer_toolbar_cta2_text;
    private String viewer_toolbar_cta2_link;
    private String viewer_toolbar_cta3_is_enabled;
    private String viewer_toolbar_cta3_collapse_max_width;
    private String viewer_toolbar_cta3_background = "#1B1862";
    private String viewer_toolbar_cta3_color = "#FFF";
    private String viewer_toolbar_cta3_border;
    private String viewer_toolbar_cta3_hover_background;
    private String viewer_toolbar_cta3_hover_border;
    private String viewer_toolbar_cta3_hover_color;
    private String viewer_toolbar_cta3_text;
    private String viewer_toolbar_cta3_link;
    private boolean viewer_toolbar_secondary_is_download_enabled = true;
    private boolean viewer_toolbar_secondary_is_mobile_presentation_enabled = true;
    private boolean viewer_toolbar_secondary_is_mobile_download_enabled = true;
}