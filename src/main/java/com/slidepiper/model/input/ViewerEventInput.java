package com.slidepiper.model.input;

import com.slidepiper.annotation.Enumeration;
import com.slidepiper.model.entity.ViewerEvent.ViewerEventType;
import lombok.Getter;
import org.hibernate.validator.constraints.Email;

import javax.validation.constraints.NotNull;

@Getter
public class ViewerEventInput {
    // TODO: Get value from cookie.
    @NotNull private String channelName;

    @NotNull @Email private String viewerEmail;
    @NotNull private String viewerName;

    @NotNull @Enumeration(ViewerEventType.class) private String viewerEventType;
}
