package com.slidepiper.model.entity;

import com.slidepiper.converter.ViewerEventDataConverter;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

@Entity
@Table(name = "customer_events")
@Getter
@Setter
public class ViewerEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "msg_id")
    private String channelFriendlyId;

    public enum ViewerEventType {
        INIT_DOCUMENT_EXISTS,
        INIT_UNSUPPORTED_BROWSER,
        INIT_IP_NOT_WHITELISTED,
        OPEN_SLIDES,
        VIEW_SLIDE,
        VIEWER_HIDDEN,
        CLICKED_CTA,
        VIEWER_WIDGET_CALENDLY_CLICKED,
        VIEWER_WIDGET_VIDEO_TAB_CLICKED,
        VIEWER_WIDGET_VIDEO_YOUTUBE_PLAYED,
        VIEWER_WIDGET_VIDEO_YOUTUBE_PAUSED,
        VIEWER_WIDGET_ASK_QUESTION,
        VIEWER_WIDGET_LIKE_CLICKED,
        VIEWER_WIDGET_HOPPER_CLICKED,
        VIEWER_WIDGET_TESTIMONIALS_CLICKED,
        VIEWER_WIDGET_FORM_BUTTON_CLICKED,
        VIEWER_WIDGET_FORM_CONFIRM_CLICKED,
        VIEWER_WIDGET_FORM_CANCEL_CLICKED,
        VIEWER_WIDGET_LINK_CLICKED,
        VIEWER_WIDGET_EMAIL_REQUEST_EMAIL_ENTERED,
        VIEWER_WIDGET_EMAIL_REQUEST_FORM_SHOWN,
        VIEWER_WIDGET_SHARE_BUTTON_CLICKED,
        VIEWER_WIDGET_SHARE_SERVICE_CLICKED,
        DOWNLOAD,
        PRINT,
        REQUEST_FULLSCREEN,
        CLICK_DOWNLOAD,
        SUBSCRIBE,
        HALMAN_ALDUBI_CURRENT_SECTION,
        HALMAN_ALDUBI_COMPLETED_INITIAL_SECTION,
        HALMAN_ALDUBI_SENT_FORM,
        HALMAN_ALDUBI_SENT_FILES,
        HALMAN_ALDUBI_FAILED_SENDING_FILES,
        PWC_SUBSCRIBED_NEWSLETTER,
        FILE_WIDGET_UPLOADED_FILE,
        LOGIN_CUSTOMER,
        UPLOAD_DOCUMENT,
        UPDATE_DOCUMENT,
        DELETE_DOCUMENT
    }
    @Column(name = "event_name")
    @Enumerated(EnumType.STRING)
    private ViewerEventType type;

    private String sessionId;
    private String viewerId;

    private Integer param1int;
    private Float param2float;
    private String param3str;
    private String param_1_varchar;
    private String param_2_varchar;
    private String param_3_varchar;
    private String param_4_varchar;
    private String param_5_varchar;
    private String param_6_varchar;
    private String param_7_varchar;
    private String param_8_varchar;
    private String param_9_varchar;
    private String param_10_varchar;
    private String param_11_varchar;

    @Data
    public static class ViewerEventData implements Serializable {
        private String dispatchedEventType;
    }
    @Convert(converter = ViewerEventDataConverter.class)
    private ViewerEventData data;

    public ViewerEvent() {}

    public ViewerEvent(ViewerEventType type, String channelFriendlyId) {
        this.type = type;
        this.channelFriendlyId = channelFriendlyId;
    }
}