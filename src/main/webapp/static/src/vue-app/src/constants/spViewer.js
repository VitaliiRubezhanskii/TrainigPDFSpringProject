export default {
  const sp =
    viewer: {
        eventName: {
            clickedCta: 'CLICKED_CTA',
            viewerWidgetCalendlyClicked: 'VIEWER_WIDGET_CALENDLY_CLICKED',
            viewerWidgetVideoTabClicked: 'VIEWER_WIDGET_VIDEO_TAB_CLICKED',
            viewerWidgetVideoYouTubePlayed: 'VIEWER_WIDGET_VIDEO_YOUTUBE_PLAYED',
            viewerWidgetVideoYouTubePaused: 'VIEWER_WIDGET_VIDEO_YOUTUBE_PAUSED',
            viewerWidgetAskQuestion: 'VIEWER_WIDGET_ASK_QUESTION',
            viewerWidgetLikeClicked: 'VIEWER_WIDGET_LIKE_CLICKED',
            viewerWidgetHopperClicked: 'VIEWER_WIDGET_HOPPER_CLICKED',
            viewerWidgetTestimonialsClicked: 'VIEWER_WIDGET_TESTIMONIALS_CLICKED',
            viewerWidgetFormButtonClicked: 'VIEWER_WIDGET_FORM_BUTTON_CLICKED',
            viewerWidgetFormConfirmClicked: 'VIEWER_WIDGET_FORM_CONFIRM_CLICKED',
            viewerWidgetFormCancelClicked: 'VIEWER_WIDGET_FORM_CANCEL_CLICKED',
            viewerWidgetLinkClicked: 'VIEWER_WIDGET_LINK_CLICKED',
            viewerWidgetRequestEmailEntered: 'VIEWER_WIDGET_EMAIL_REQUEST_EMAIL_ENTERED',
            viewerWidgetRequestFormShown: 'VIEWER_WIDGET_EMAIL_REQUEST_FORM_SHOWN',
            viewerWidgetShareButtonClicked: 'VIEWER_WIDGET_SHARE_BUTTON_CLICKED',
            viewerWidgetShareServiceClicked: 'VIEWER_WIDGET_SHARE_SERVICE_CLICKED',
        },
        paramValue: {
            videoTabOpened: 'VIEWER_WIDGET_VIDEO_TAB_OPENED',
            videoTabClosed: 'VIEWER_WIDGET_VIDEO_TAB_CLOSED'
        },
        linkHash: getParameterByName('f'),
        widgets: {
            widget1: {
                currentVideoPlayerCssSelector: '',
                isValidated: false,
                isVideoPlayersReady: false,
                isVideoCollapseOverride: false,
                videoPlayersIsReady: {},
                lastVideoSource: ''
            },
            widget4: {
                likeCount: 0
            },
            widget6: {
                isReady: false,
                isValidated: false,
                lastViewedPage: 0
            },
            widget10: {
                isEnabled: false,
                emailAddress: null,
            },
            widget11: {
                spWidget11Share: null,
            }
        },
        sendEvent: function(event) {
          var eventQueue = null;
          if (typeof event === 'string') {
            event = {type: event};
          }

          if (typeof event.sessionId === 'undefined') {
            event.sessionId = SP.SESSION_ID;
          }

          if (typeof event.channelFriendlyId === 'undefined') {
            event.channelFriendlyId = sp.viewer.linkHash;
          }

          if (typeof event.param1int === 'undefined' && PDFViewerApplication) {
            event.param1int = PDFViewerApplication.page;
          }
          eventQueue.push(event);
        }

    };
}
