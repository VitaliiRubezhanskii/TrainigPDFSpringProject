package com.slidepiper.model.input.user;

import lombok.Data;

@Data
public class UserEmailConfigurationInput {
    private String notificationEmail;
    private boolean viewerOpenDocumentEmailEnabled;
    private boolean viewerEventEmailEnabled;
    private boolean isReceiveCustomerEmailEnabled;
    private boolean shownNotificationMail;
}