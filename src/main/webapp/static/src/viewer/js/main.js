/**
 * Disable cache on AJAX requests.
 */
$.ajaxSetup({
    cache: false
});


/**
 * Set document links to open in a new tab.
 */
$(document).on('textlayerrendered', function() {
    var aArray = document.getElementsByTagName('a');
    for (var i = 0; i < aArray.length; i++) {
        var a = aArray[i];
        if (!a.getAttribute('target')) {
            a.setAttribute('target', '_blank');
        }
    }
});


/**
 * Hide Widgets for print.
 */
window.addEventListener('beforeprint', function() {
    Array.prototype.forEach.call(document.querySelectorAll('.widget, #sp-terms-privacy'), function(el) {
        el.style.display = 'none';
    });
});

window.addEventListener('afterprint', function() {
    Array.prototype.forEach.call(document.querySelectorAll('.widget, #sp-terms-privacy'), function(el) {
        el.style.display = 'block';
    });
});


/**
 * Create HTML elements.
 */
(function() {
    $('#secondaryToolbarButtonContainer').prepend(
        '<a id="sp-secondary-cta1" class="sp-secondary-cta secondaryToolbarButton" href="#" target="_blank"></a>' +
        '<a id="sp-secondary-cta2" class="sp-secondary-cta secondaryToolbarButton" href="#" target="_blank"></a>' +
        '<a id="sp-secondary-cta3" class="sp-secondary-cta secondaryToolbarButton" href="#" target="_blank"></a>' +
        '<div id="sp-cta-secondary-toolbar-separator" class="horizontalToolbarSeparator"></div>');

    $('#toolbarViewerRight').prepend(
        '<a id="sp-cta3" class="sp-cta" href="#" target="_blank"></a>' +
        '<a id="sp-cta2" class="sp-cta" href="#" target="_blank"></a>' +
        '<a id="sp-cta1" class="sp-cta" href="#" target="_blank"></a>');

    $('#toolbarViewerMiddle')
        .append('<div class="sp-toolbar-logo"><a target="_blank" href="#"></a></div>');

    var poweredBySlidePiper = 'Powered by <span class="sp-powered-by"><a target="_blank" href="https://www.slidepiper.com">SlidePiper</a></span>';
    var termsAndPrivacy = '<a href="https://www.slidepiper.com/tou.html" target="_blank">Terms</a> · <a href="https://www.slidepiper.com/privacy.html" target="_blank">Privacy</a>';

    $('body').append('<div class="sp--direction-ltr" id="sp-terms-privacy">' + poweredBySlidePiper + ' · ' + termsAndPrivacy + '</div>');
    $('#secondaryToolbarButtonContainer').append(
        '<div class="horizontalToolbarSeparator"></div>' +
        '<div id="sp-terms-privacy-secondary-toolbar">' + poweredBySlidePiper + '<br>' + termsAndPrivacy + '</div>');
})();


/**
 * Viewer functions.
 */
var sp = sp || {};
sp.viewer = {
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
    }
};


/**
 * Tracking and sending event mechanism.
 */
(function() {
    var startTime;
    document.addEventListener('spsessionstart', function(dispatchedEvent) {
        startTime = new Date().getTime();

        var event = {
            type: 'OPEN_SLIDES',
            channelFriendlyId: getParameterByName('f'),
            sessionId: SP.SESSION_ID,
            param1int: PDFViewerApplication.page,
            param3str: navigator.userAgent,
            data: {
                dispatchedEventType: dispatchedEvent.type
            }
        };
        if (typeof sp.viewer.widgets.widget10.emailAddress !== 'undefined') {
            event['param_11_varchar'] = sp.viewer.widgets.widget10.emailAddress;
        }
        sp.sendEvent(event);

        // Set event listeners.
        document.addEventListener('pagechange', handlePageChangeEvent);
        document.addEventListener('visibilitychange', function(dispatchedEvent) {
            if ('unloaded' !== document.visibilityState) {
                handlePageChangeEvent(dispatchedEvent);
            }
        });
        window.addEventListener('beforeunload', handlePageChangeEvent);
        window.addEventListener('pagehide', handlePageChangeEvent);
        window.addEventListener('unload', handlePageChangeEvent);
    });

    var isPageChangeEventEnabled = true;
    function handlePageChangeEvent(dispatchedEvent) {
        if (isPageChangeEventEnabled) {
            if (['beforeunload', 'pagehide', 'unload'].indexOf(dispatchedEvent.type) !== -1) {
                isPageChangeEventEnabled = false;
                $.ajaxSetup({async: false});
            }

            sendPageChangeEvent(dispatchedEvent.type);
        }
    }

    var viewPage = PDFViewerApplication.page;
    var MAX_VIEW_DURATION = 1000 * 60 * 60 * 24 * 365; // A year.
    function sendPageChangeEvent(dispatchedEventType) {
        var eventType;
        if ('visibilitychange' === dispatchedEventType) {
            eventType = document.hidden ? 'VIEW_SLIDE' : 'VIEWER_HIDDEN';
        } else {
            eventType = document.hidden ? 'VIEWER_HIDDEN' : 'VIEW_SLIDE';
        }

        var endTime = new Date().getTime();
        var viewDuration = endTime - startTime < MAX_VIEW_DURATION ? endTime - startTime : MAX_VIEW_DURATION;
        sp.sendEvent({
            type: eventType,
            channelFriendlyId: sp.viewer.linkHash,
            sessionId: SP.SESSION_ID,
            param1int: viewPage,
            param2float: (viewDuration / 1000),
            data: {
                dispatchedEventType: dispatchedEventType
            }
        });

        viewPage = document.hidden ? undefined : PDFViewerApplication.page;
        //Selecting active button with different color
        $('#sp-widget5__horizontal-hopper-container>div.selected').removeClass('selected');

        $('#sp-widget5__horizontal-hopper-container').children().each(function () {
            if($(this).attr("data-page-horizontal-hop") == PDFViewerApplication.page) {
                $(this).addClass('selected')
            }; // "this" is the current element in the loop
        });

        $('#sp-widget5__hopper-container>div.selected').removeClass('selected');

        $('#sp-widget5__hopper-container').children().each(function () {
            if($(this).attr("data-page-hop") == PDFViewerApplication.page) {
                $(this).addClass('selected');
            } // "this" is the current element in the loop
        });

        //Animate to selected element automatically
        $('#sp-widget5__horizontal-hopper-container').scrollTo($('#sp-widget5__horizontal-hopper-container>div.selected'));
        startTime = endTime;
    }

    var eventQueue = [];
    sp.sendEvent = function(event) {
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
        processEventQueue();
    };

    var isEventQueueProcessing = false;
    function processEventQueue() {
        if (!isEventQueueProcessing) {
            isEventQueueProcessing = true;

            if (eventQueue.length > 0) {
                var event = eventQueue[0];

                $.ajax({
                    url: SP.API_URL + '/viewer/event',
                    method: 'POST',
                    data: JSON.stringify(event),
                    xhrFields: {
                        withCredentials: true
                    }
                }).always(function() {
                    eventQueue.shift();
                    isEventQueueProcessing = false;
                    processEventQueue();
                });
            } else {
                isEventQueueProcessing = false;
            }
        }
    }

    /**
     * @deprecated use sp.sendEvent() instead.
     */
    window.sessionid = SP.SESSION_ID;
    sp.viewer.setCustomerEvent = function(event) {
        event.type = event.eventName;
        delete event.eventName;
        event.channelFriendlyId = event.linkHash;
        delete event.linkHash;
        event.sessionId = SP.SESSION_ID;
        sp.sendEvent(event);
    }
})();


/**
 * Set actions on events.
 */
$('#secondaryPresentationMode').on('click', function() {
    sp.sendEvent('REQUEST_FULLSCREEN');
});

$('#secondaryPrint').on('click', function() {
    sp.sendEvent('PRINT');
});

$('#secondaryDownload').on('click', function() {
    sp.sendEvent('DOWNLOAD');
});

$('.sp-cta, .sp-secondary-cta').click(function() {
    var eventData = {
        type: sp.viewer.eventName.clickedCta,
        param_1_varchar: $(this).attr('id'),
        param_2_varchar: $(this).text(),
        param_3_varchar: $(this).attr('href'),
        channelFriendlyId: sp.viewer.linkHash,
        sessionId: SP.SESSION_ID
    };

    sp.sendEvent(eventData);
});

$.ajax({
    url: SP.API_URL + '/viewer/configuration',
    data: {channelFriendlyId: sp.viewer.linkHash},
    dataType: 'json',
    xhrFields: {
        withCredentials: true
    }
}).done(function(data) {
    var config = {
        viewer: data
    }

    // Set document title.
    if (typeof config.viewer.documentTitle !== 'undefined'
        && null !== config.viewer.documentTitle
        && '' !== config.viewer.documentTitle) {
        document.title = config.viewer.documentTitle;
    } else {
        document.title = 'SlidePiper';
    }

    // Customization settings.
    if (typeof config.viewer.toolbarBackground !== 'undefined') {
        $('#toolbarViewer, #toolbarSidebar, #secondaryToolbar, #scaleSelect option')
            .css('background', config.viewer.toolbarBackground);
    }

    if (typeof config.viewer.toolbarButtonBackground !== 'undefined') {
        $('.toolbarButton, .secondaryToolbarButton')
            .css('background', config.viewer.toolbarButtonBackground);

        if (typeof config.viewer.toolbarButtonHoverBackground !== 'undefined') {
            $('.toolbarButton, .secondaryToolbarButton').hover(
                function () {
                    $(this).css('background', config.viewer.toolbarButtonHoverBackground);
                }, function () {
                    $(this).css('background', config.viewer.toolbarButtonBackground);
                }
            );
        }
    }

    if (typeof config.viewer.toolbarButtonBorder !== 'undefined') {
        $('.toolbarButton, .secondaryToolbarButton')
            .css('border', config.viewer.toolbarButtonBorder);

        if (typeof config.viewer.toolbarButtonHoverBorder !== 'undefined') {
            $('.toolbarButton, .secondaryToolbarButton').hover(
                function () {
                    $(this).css('border', config.viewer.toolbarButtonHoverBorder);
                }, function () {
                    $(this).css('border', config.viewer.toolbarButtonBorder);
                }
            );
        }
    }

    if (typeof config.viewer.toolbarButtonBoxShadow !== 'undefined') {
        $('.toolbarButton, .secondaryToolbarButton')
            .css('box-shadow', config.viewer.toolbarButtonBoxShadow);

        if (typeof config.viewer.toolbarButtonHoverBoxShadow !== 'undefined') {
            $('.toolbarButton, .secondaryToolbarButton').hover(
                function () {
                    $(this).css('box-shadow', config.viewer.toolbarButtonHoverBoxShadow);
                }, function () {
                    $(this).css('box-shadow', config.viewer.toolbarButtonBoxShadow);
                }
            );
        }
    }

    if (typeof config.viewer.toolbarColor !== 'undefined') {
        $('.toolbarLabel, .toolbarField, #scaleSelect option, #sp-terms-privacy-secondary-toolbar, #sp-terms-privacy-secondary-toolbar a')
            .css('color', config.viewer.toolbarColor);

        $('#scaleSelect').css('color', config.viewer.toolbarColor);
        $('.toolbarLabel, .toolbarField, #scaleSelectContainer, #scaleSelect').css('visibility', 'visible');
    }

    // Find toolbar.
    if (typeof config.viewer.toolbarFindColor !== 'undefined') {
        $('#findbar .toolbarLabel, #findInput').css('color', config.viewer.toolbarFindColor);
    }

    if (typeof config.viewer.toolbarFindBackground !== 'undefined') {
        $('#findbar').css('background', config.viewer.toolbarFindBackground);
    }

    // Logo.
    if (config.viewer.logoImage || typeof config.viewer.toolbarLogoImage !== 'undefined') {
        var logoImage = config.viewer.logoImage || 'data:image/png;base64,' + config.viewer.toolbarLogoImage;
        $('.sp-toolbar-logo a')
            .append('<img src="' + sp.escapeHtml(logoImage) + '">');

        if (typeof config.viewer.toolbarLogoLink !== 'undefined') {
            if (config.viewer.toolbarLogoLink === 'no-logo-link') {
                $('.sp-toolbar-logo a').attr('href', location.href);
            } else {
                $('.sp-toolbar-logo a').attr('href', config.viewer.toolbarLogoLink);
            }
        }
    }

    // CTA buttons.
    if (typeof config.viewer.toolbarCtaBorderRadius !== 'undefined') {
        $('.sp-cta').css('border-radius', config.viewer.toolbarCtaBorderRadius);
    }

    if (typeof config.viewer.toolbarCtaFont !== 'undefined') {
        $('.sp-cta').css('font', config.viewer.toolbarCtaFont);
    }

    if (typeof config.viewer.toolbarCtaMargin !== 'undefined') {
        $('.sp-cta').css('margin', config.viewer.toolbarCtaMargin);
    }

    if (typeof config.viewer.toolbarCtaPadding !== 'undefined') {
        $('.sp-cta').css('padding', config.viewer.toolbarCtaPadding);
    }

    // CTA1.
    if ('true' === config.viewer.isCta1Enabled) {
        $('#sp-cta-secondary-toolbar-separator').show();

        if (typeof config.viewer.cta1CollapseMaxWidth !== 'undefined') {
            $('body').append(
                '<style>@media all and (max-width: ' + sp.escapeHtml(config.viewer.cta1CollapseMaxWidth)
                + ') {#sp-cta1 {display: none;}}</style>');
        }

        if (typeof config.viewer.toolbarCta1Background !== 'undefined') {
            $('#sp-cta1').css('background', config.viewer.toolbarCta1Background);

            if (typeof config.viewer.toolbarCta1HoverBackground !== 'undefined') {
                $('#sp-cta1').hover(
                    function () {
                        $(this).css('background', config.viewer.toolbarCta1HoverBackground);
                    }, function () {
                        $(this).css('background', config.viewer.toolbarCta1Background);
                    }
                );

                $('#sp-cta1').click(function () {
                    $(this).css('background', config.viewer.toolbarCta1Background);
                });
            }
        }

        if (typeof config.viewer.toolbarCta1Border !== 'undefined') {
            $('#sp-cta1').css('border', config.viewer.toolbarCta1Border);

            if (typeof config.viewer.toolbarCta1HoverBorder !== 'undefined') {
                $('#sp-cta1').hover(
                    function () {
                        $(this).css('border', config.viewer.toolbarCta1HoverBorder);
                    }, function () {
                        $(this).css('border', config.viewer.toolbarCta1Border);
                    }
                );

                $('#sp-cta1').click(function () {
                    $(this).css('border', config.viewer.toolbarCta1Border);
                });
            }
        }

        if (typeof config.viewer.toolbarCta1Color !== 'undefined') {
            $('#sp-cta1').css('color', config.viewer.toolbarCta1Color);

            if (typeof config.viewer.toolbarCta1HoverColor !== 'undefined') {
                $('#sp-cta1').hover(
                    function () {
                        $(this).css('color', config.viewer.toolbarCta1HoverColor);
                    }, function () {
                        $(this).css('color', config.viewer.toolbarCta1Color);
                    }
                );

                $('#sp-cta1').click(function () {
                    $(this).css('color', config.viewer.toolbarCta1Color);
                });
            }
        }

        if (typeof config.viewer.toolbarCta1Text !== 'undefined') {
            $('#sp-cta1, #sp-secondary-cta1').text(config.viewer.toolbarCta1Text);

            if (typeof config.viewer.toolbarCta1Link !== 'undefined') {
                $('#sp-cta1, #sp-secondary-cta1').attr('href', config.viewer.toolbarCta1Link);
            }
        }
    } else {
        $('#sp-cta1, #sp-secondary-cta1').hide();
    }

    // CTA2.
    if ('true' === config.viewer.isCta2Enabled) {
        $('#sp-cta-secondary-toolbar-separator').show();

        if (typeof config.viewer.cta2CollapseMaxWidth !== 'undefined') {
            $('body').append(
                '<style>@media all and (max-width: ' + sp.escapeHtml(config.viewer.cta2CollapseMaxWidth)
                + ') {#sp-cta2 {display: none;}}</style>');
        }

        if (typeof config.viewer.toolbarCta2Background !== 'undefined') {
            $('#sp-cta2').css('background', config.viewer.toolbarCta2Background);

            if (typeof config.viewer.toolbarCta2HoverBackground !== 'undefined') {
                $('#sp-cta2').hover(
                    function () {
                        $(this).css('background', config.viewer.toolbarCta2HoverBackground);
                    }, function () {
                        $(this).css('background', config.viewer.toolbarCta2Background);
                    }
                );

                $('#sp-cta2').click(function () {
                    $(this).css('background', config.viewer.toolbarCta2Background);
                });
            }
        }

        if (typeof config.viewer.toolbarCta2Border !== 'undefined') {
            $('#sp-cta2').css('border', config.viewer.toolbarCta2Border);

            if (typeof config.viewer.toolbarCta2HoverBorder !== 'undefined') {
                $('#sp-cta2').hover(
                    function () {
                        $(this).css('border', config.viewer.toolbarCta2HoverBorder);
                    }, function () {
                        $(this).css('border', config.viewer.toolbarCta2Border);
                    }
                );

                $('#sp-cta2').click(function () {
                    $(this).css('border', config.viewer.toolbarCta2Border);
                });
            }
        }

        if (typeof config.viewer.toolbarCta2Color !== 'undefined') {
            $('#sp-cta2').css('color', config.viewer.toolbarCta2Color);

            if (typeof config.viewer.toolbarCta2HoverColor !== 'undefined') {
                $('#sp-cta2').hover(
                    function () {
                        $(this).css('color', config.viewer.toolbarCta2HoverColor);
                    }, function () {
                        $(this).css('color', config.viewer.toolbarCta2Color);
                    }
                );

                $('#sp-cta2').click(function () {
                    $(this).css('color', config.viewer.toolbarCta2Color);
                });
            }
        }

        if (typeof config.viewer.toolbarCta2Text !== 'undefined') {
            $('#sp-cta2, #sp-secondary-cta2').text(config.viewer.toolbarCta2Text);

            if (typeof config.viewer.toolbarCta2Link !== 'undefined') {
                $('#sp-cta2, #sp-secondary-cta2').attr('href', config.viewer.toolbarCta2Link);
            }
        }
    } else {
        $('#sp-cta2, #sp-secondary-cta2').hide();
    }

    // CTA3.
    if ('true' === config.viewer.isCta3Enabled) {
        $('#sp-cta-secondary-toolbar-separator').show();

        if (typeof config.viewer.cta3CollapseMaxWidth !== 'undefined') {
            $('body').append(
                '<style>@media all and (max-width: ' + sp.escapeHtml(config.viewer.cta3CollapseMaxWidth)
                + ') {#sp-cta3 {display: none;}}</style>');
        }

        if (typeof config.viewer.toolbarCta3Background !== 'undefined') {
            $('#sp-cta3').css('background', config.viewer.toolbarCta3Background);

            if (typeof config.viewer.toolbarCta3HoverBackground !== 'undefined') {
                $('#sp-cta3').hover(
                    function () {
                        $(this).css('background', config.viewer.toolbarCta3HoverBackground);
                    }, function () {
                        $(this).css('background', config.viewer.toolbarCta3Background);
                    }
                );

                $('#sp-cta3').click(function () {
                    $(this).css('background', config.viewer.toolbarCta3Background);
                });
            }
        }

        if (typeof config.viewer.toolbarCta3Border !== 'undefined') {
            $('#sp-cta3').css('border', config.viewer.toolbarCta3Border);

            if (typeof config.viewer.toolbarCta3HoverBorder !== 'undefined') {
                $('#sp-cta3').hover(
                    function () {
                        $(this).css('border', config.viewer.toolbarCta3HoverBorder);
                    }, function () {
                        $(this).css('border', config.viewer.toolbarCta3Border);
                    }
                );

                $('#sp-cta3').click(function () {
                    $(this).css('border', config.viewer.toolbarCta3Border);
                });
            }
        }

        if (typeof config.viewer.toolbarCta3Color !== 'undefined') {
            $('#sp-cta3').css('color', config.viewer.toolbarCta3Color);

            if (typeof config.viewer.toolbarCta3HoverColor !== 'undefined') {
                $('#sp-cta3').hover(
                    function () {
                        $(this).css('color', config.viewer.toolbarCta3HoverColor);
                    }, function () {
                        $(this).css('color', config.viewer.toolbarCta3Color);
                    }
                );

                $('#sp-cta3').click(function () {
                    $(this).css('color', config.viewer.toolbarCta3Color);
                });
            }
        }

        if (typeof config.viewer.toolbarCta3Text !== 'undefined') {
            $('#sp-cta3, #sp-secondary-cta3').text(config.viewer.toolbarCta3Text);

            if (typeof config.viewer.toolbarCta3Link !== 'undefined') {
                $('#sp-cta3, #sp-secondary-cta3').attr('href', config.viewer.toolbarCta3Link);
            }
        }
    } else {
        $('#sp-cta3, #sp-secondary-cta3').hide();
    }

    if (typeof config.viewer.toolbarLogoCollapseMaxWidth !== 'undefined') {
        $('body').append(
            '<style>@media all and (max-width: ' + sp.escapeHtml(config.viewer.toolbarLogoCollapseMaxWidth)
            + ') {.sp-toolbar-logo {display: none;}}</style>');
    }


    // Hide splash page.
    document.getElementById('sp-loading').style.display = 'none';
    document.getElementById('toolbarContainer').classList.remove('sp--visibility-hidden');
    document.getElementById('scaleSelectContainer').classList.remove('sp--visibility-hidden');
    document.getElementById('scaleSelect').classList.remove('sp--visibility-hidden');
    document.getElementById('pageNumber').classList.remove('sp--visibility-hidden');
    document.getElementById('numPages').classList.remove('sp--visibility-hidden');


    /* Presentation & Download Settings */
    if (typeof config.viewer.isViewerToolbarIsDownloadEnabled !== 'undefined'
        && ! config.viewer.isViewerToolbarIsDownloadEnabled) {
        $('#secondaryDownload').addClass('hidden');
    }

    if (typeof config.viewer.isMobileToolbarSecondaryPresentationEnabled !== 'undefined'
        && ! config.viewer.isMobileToolbarSecondaryPresentationEnabled) {
        $('#secondaryPresentationMode').addClass('hiddenMediumView');
    }

    if (typeof config.viewer.isMobileToolbarSecondaryDownloadEnabled !== 'undefined'
        && ! config.viewer.isMobileToolbarSecondaryDownloadEnabled) {
        $('#secondaryDownload').addClass('hiddenMediumView');
    }

    /* Widget Mechanism */
    getWidgetsSettings();
    function getWidgetsSettings() {
        $.getJSON(
            SP.API_URL + '/viewer/widgets',
            {
                fileLinkHash: sp.viewer.linkHash
            },
            function (data) {

                // Prepare the widgets data for implimentation.
                var widgets = {};

                var numWidgets = data.length;
                $.each(data, function (index, data) {
                    var widgetData = JSON.parse(data.widgetData).data;

                    if (typeof widgetData !== 'undefined'
                        && (widgetData.isEnabled || (typeof widgetData.items[0] !== 'undefined' && widgetData.items[0].enabled)
                            //separate logic for widget5; add it even if isEnabled=false
                        || (widgetData.widgetId == 5 && widgetData.isHorizontalHopperEnabled))) {

                        var widgetId;
                        if (typeof widgetData.widgetId !== 'undefined') {
                            widgetId = widgetData.widgetId;
                        } else {
                            widgetId = widgetData.items[0].widgetId;
                        }

                        switch (widgetId) {
                            case 1:
                            case 6:
                                widgetData.items = OrderWidgetDataItemsByPage(widgetId, widgetData.items);
                                break;
                        }

                        widgets['widget' + widgetId.toString()] = widgetData;
                    }
                });

                if (typeof widgets.widget10 !== 'undefined') {
                    sp.viewer.widgets.widget10.isEnabled = true;
                }

                implementWidgets(widgets);


                /**
                 * Sort widget data by page.
                 *
                 * @return Sorted widget data.
                 */
                function OrderWidgetDataItemsByPage(widgetId, items) {
                    var itemsByPage = {};
                    var itemsPage = [];

                    $.each(items, function (index, item) {

                        switch (widgetId) {
                            case 1:
                                var page = item.videoPageStart;
                                break;

                            case 6:
                                var page = item.page;
                                break;

                            case 9:
                                var page = item.pageFrom;
                                break;
                        }

                        itemsByPage['page' + page.toString()] = item;
                        itemsPage.push(page);
                    });

                    // Order the items by page.
                    itemsPage.sort(function (a, b) {
                        return a - b;
                    });

                    var orderedItemsByPage = [];
                    $.each(itemsPage, function (index, page) {
                        orderedItemsByPage.push(itemsByPage['page' + page.toString()]);
                    });

                    return orderedItemsByPage;
                }
            }
        );
    }


    /**
     * Check whether a widget required settings are set.
     *
     * @param {object} widgetSettings - An object containing a widget settings.
     * @param {object} requiredSettings - The widget settings keys required to be
     * defined for the functionality of the widget.
     *
     * @return {boolean} Are the required widget settings defined.
     */
    function isWidgetSettingsDefined(widgetSettings, requiredSettings) {
        var isWidgetSettingsDefined = true;

        $.each(requiredSettings, function (index, requiredSetting) {
            if (typeof widgetSettings[requiredSetting] == 'undefined') {
                isWidgetSettingsDefined = false;
                return false;
            }
        });

        return isWidgetSettingsDefined;
    }


    /**
     * Validate and implement widgets into the viewer.
     *
     * @param {object} widgets - Array containing widget data formed as objects.
     */
    function implementWidgets(widgets) {

        /**
         * The following is a mechanisem for setting a widget item (out of a set of items)
         * everytime the user changes a page.
         */
        $(document).on('pagechange spDefaultPlayerReady spYouTubePlayerReady spWidget6Ready', function (event) {

            /* Widget 1 */
            if (sp.viewer.widgets.widget1.isValidated) {

                // Check if all applicable video players are ready.
                if (!sp.viewer.widgets.widget1.isVideoPlayersReady) {
                    var isVideoPlayersReady = false;

                    $.each(sp.viewer.widgets.widget1.videoPlayersIsReady, function (videoPlayer, isReady) {
                        if (isReady) {
                            isVideoPlayersReady = true;
                        } else {
                            isVideoPlayersReady = false;
                            return false;
                        }
                    });

                    sp.viewer.widgets.widget1.isVideoPlayersReady = isVideoPlayersReady;
                }

                // Verification before setting a video.
                if (PDFViewerApplication.page !== sp.viewer.widgets.widget1.lastViewedPage
                    && sp.viewer.widgets.widget1.isVideoPlayersReady) {

                    loadVideo(widgets.widget1.items);
                    sp.viewer.widgets.widget1.lastViewedPage = PDFViewerApplication.page;
                }
            }


            /* Widget 6 */
            if (sp.viewer.widgets.widget6.isValidated) {

                // Verification before setting a testimonial.
                if (PDFViewerApplication.page !== sp.viewer.widgets.widget6.lastViewedPage
                    && sp.viewer.widgets.widget6.isReady) {

                    loadTestimonial(widgets.widget6.items);
                    sp.viewer.widgets.widget6.lastViewedPage = PDFViewerApplication.page;
                }
            }
        });

        /* Widget 10 */
        if (sp.viewer.widgets.widget10.isEnabled) {
            var spWidgetsStorage = JSON.parse(localStorage.getItem('slidepiper'));
            var isEmailAddressEnteredForThisDocument = false;
            var enteredEmailAddress = '';

            if (null !== spWidgetsStorage
                && null !== spWidgetsStorage.widgets
                && null !== spWidgetsStorage.widgets.widget10) {
                $.each(spWidgetsStorage.widgets.widget10.items, function () {
                    if (this.documentLinkHash === getParameterByName('f')) {
                        isEmailAddressEnteredForThisDocument = true;
                        enteredEmailAddress = this.email;
                        return false;
                    }
                });
            }

            if (!isEmailAddressEnteredForThisDocument) {
                implementWidget10(widgets.widget10.items[0]);
            } else {
                sp.viewer.widgets.widget10.emailAddress = enteredEmailAddress;
                document.dispatchEvent(new CustomEvent('spsessionstart'));
            }
        } else {
            document.dispatchEvent(new CustomEvent('spsessionstart'));
        }

        /* Validate Widget 1 */
        var widget1RequiredSettings = ['videoPageStart', 'videoSource', 'videoTitle', 'isYouTubeVideo'];

        if (typeof widgets.widget1 !== 'undefined'
            && typeof widgets.widget1.items !== 'undefined'
            && widgets.widget1.items.length > 0) {
            var isWidget1Valid = false;

            $.each(widgets.widget1.items, function (index, item) {
                if (isWidgetSettingsDefined(item, widget1RequiredSettings)) {
                    isWidget1Valid = true;
                } else {
                    isWidget1Valid = false;
                    return false;
                }
            });

            if (isWidget1Valid) {

                // Create a unique array of video players to load.
                var videoPlayers = [];
                $.each(widgets.widget1.items, function (index, video) {
                    if (video.isYouTubeVideo && -1 === videoPlayers.indexOf('youTube')) {
                        videoPlayers.push('youTube');
                    } else if (-1 === videoPlayers.indexOf('defaultPlayer')) {
                        videoPlayers.push('defaultPlayer');
                    }
                });

                $.each(videoPlayers, function (index, videoPlayer) {
                    sp.viewer.widgets.widget1.videoPlayersIsReady[videoPlayer] = false;
                });

                sp.viewer.widgets.widget1.isValidated = true;
                implementWidget1(widgets.widget1.items);
            }
        }

        /* Validate Widget 6 */
        var widget6RequiredSettings =
            ['page', 'personImage', 'personName', 'personTitle', 'testimonial'];

        if (typeof widgets.widget6 !== 'undefined'
            && typeof widgets.widget6.items !== 'undefined'
            && widgets.widget6.items.length > 0) {
            var isWidget6Validated = false;

            $.each(widgets.widget6.items, function (index, item) {
                if (isWidgetSettingsDefined(item, widget6RequiredSettings)) {
                    isWidget6Validated = true;
                } else {
                    isWidget6Validated = false;
                    return false;
                }
            });

            if (isWidget6Validated) {
                sp.viewer.widgets.widget6.isValidated = true;
                implementWidget6(widgets.widget6.items);
            }
        }

        /* Validate Widget 2 */
        var widget2RequiredSettings = ['userName'];

        if (typeof widgets.widget2 !== 'undefined') {
            if (isWidgetSettingsDefined(widgets.widget2.items[0], widget2RequiredSettings)) {
                implementWidget2(widgets.widget2.items[0]);
            }
        }


        /* Validate Widget 3 */
        var widget3RequiredSettings = ['buttonText'];

        if (typeof widgets.widget3 !== 'undefined') {
            if (isWidgetSettingsDefined(widgets.widget3.items[0], widget3RequiredSettings)) {
                implementWidget3(widgets.widget3.items[0]);
            }
        }

        /* Validate Widget 4 */
        var widget4RequiredSettings = ['isCounterEnabled'];

        if (typeof widgets.widget4 !== 'undefined' && widgets.widget4.isEnabled) {
            if (isWidgetSettingsDefined(widgets.widget4.items[0], widget4RequiredSettings)) {
                implementWidget4(widgets.widget4.items[0]);
            }
        }

        /* Validate Widget 5 */
        var widget5RequiredSettings = ['hopperText', 'hopperPage'];

        if (typeof widgets.widget5 !== 'undefined'
            && typeof widgets.widget5.items !== 'undefined'
            && widgets.widget5.items.length > 0) {

            var isWidget5Valid = false;
            $.each(widgets.widget5.items, function (index, item) {
                if (isWidgetSettingsDefined(item, widget5RequiredSettings)) {
                    isWidget5Valid = true;
                } else {
                    isWidget5Valid = false;
                    return false;
                }
            });

            if (isWidget5Valid) {
                // add vertical hopper
                if (widgets.widget5.isEnabled) {
                    implementWidget5(widgets.widget5.items);
                }
                // add horizontal hopper
                if (widgets.widget5.isHorizontalHopperEnabled) {
                    implementWidget5HorizontalHopper(widgets.widget5.items);
                }
                // delete margin top when horizontal hoper disabled
                if (!widgets.widget5.isHorizontalHopperEnabled) {
                    $('#viewerContainer').addClass('deleteMarginTop');
                }
            }
        }

        /* Validate Widget 7 */
        var widget7RequiredSettings = ['formButtonTextLine1', 'formButtonIcon'];

        if (typeof widgets.widget7 !== 'undefined'
            && typeof widgets.widget7.items !== 'undefined'
            && widgets.widget7.items.length > 0) {
            var isWidget7Validated = false;

            $.each(widgets.widget7.items, function (index, item) {
                if (isWidgetSettingsDefined(item, widget7RequiredSettings)) {
                    isWidget7Validated = true;
                } else {
                    isWidget7Validated = false;
                    return false;
                }
            });

            if (isWidget7Validated) {
                implementWidget7(widgets.widget7.items[0]);
            }
        }

        /* Validate Widget 8 */
        var widget8RequiredSettings = ['codeLocation', 'codeContent'];

        if (typeof widgets.widget8 !== 'undefined'
            && typeof widgets.widget8.items !== 'undefined'
            && widgets.widget8.items.length > 0) {

            var isWidget8Validated = false;
            $.each(widgets.widget8.items, function (index, item) {
                if (isWidgetSettingsDefined(item, widget8RequiredSettings)) {
                    isWidget8Validated = true;
                } else {
                    isWidget8Validated = false;
                    return false;
                }
            });

            if (isWidget8Validated) {
                implementWidget8(widgets.widget8.items);
            }
        }

        /* Link Widget */
        if (typeof widgets.widget9 !== 'undefined') {

            var links = {};
            widgets.widget9.items.forEach(function (link) {
                for (i = parseInt(link.pageFrom); i <= parseInt(link.pageTo); i++) {
                    (links[i] || (links[i] = [])).push(link);
                }
            });

            updateLinkWidget();

            document.addEventListener('pagechange', function () {
                $('.sp-widget9').remove();

                updateLinkWidget();
            });

            function updateLinkWidget() {
                if (links.hasOwnProperty(PDFViewerApplication.page)) {
                    linkWidget(links[PDFViewerApplication.page]);
                }
            }

            function linkWidget(links) {
                if (0 == $('.sp-right-side-widgets').length) {
                    $('body').append('<div class="sp-right-side-widgets"></div>');
                }

                links.forEach(function (link) {
                    var p = document.createElement('p');
                    p.appendChild(document.createTextNode(link.buttonText1));

                    var div = document.createElement('div');
                    div.classList.add('sp-widget9__text');
                    div.appendChild(p);

                    if ('' !== link.buttonText2) {
                        var p2 = document.createElement('p');
                        p2.appendChild(document.createTextNode(link.buttonText2));
                        div.appendChild(p2);
                    }

                    var i = document.createElement('i');
                    i.classList.add('fa');
                    if (typeof link.icon === 'undefined') {
                        i.classList.add('fa-external-link');
                    } else {
                        i.classList.add(link.icon);
                    }

                    var button = document.createElement('button');
                    button.classList.add('widget');
                    button.classList.add('sp-widget-button');
                    button.classList.add('sp-widget-font-fmaily');
                    button.classList.add('sp--direction-ltr');
                    button.classList.add('sp-widget9');
                    if (link.status && 'completed' === link.status) {
                        button.classList.add('sp--completed');
                    }

                    button.style.backgroundColor = config.viewer.toolbarButtonBackground;
                    button.style.color = config.viewer.toolbarCta1Color;

                    button.onclick = function () {
                        if (typeof link.layout === 'undefined' || 'external-link' === link.layout) {
                            if (!link.link.match(/^#/)) {
                                window.open(link.link);
                            }
                        } else if ('inside-window' === link.layout) {
                            swal({
                                cancelButtonText: 'Close',
                                html: '<iframe style="height: 75vh" frameborder="0" src="' + sp.escapeHtml(link.link) + '" allow="geolocation; microphone; camera"></iframe>',
                                showConfirmButton: false,
                                showCancelButton: true,
                                width: '100'
                            }).done();
                        }

                        sp.sendEvent({
                            type: sp.viewer.eventName.viewerWidgetLinkClicked,
                            channelFriendlyId: sp.viewer.linkHash,
                            sessionId: SP.SESSION_ID,
                            param_1_varchar: link.buttonText1,
                            param_2_varchar: link.buttonText2,
                            param_3_varchar: link.link,
                            param_4_varchar: link.pageFrom,
                            param_5_varchar: link.pageTo,
                        });
                    };

                    button.appendChild(i);
                    button.appendChild(div);
                    $('.sp-right-side-widgets')[0].appendChild(button);

                    if ($('.sp-right-side-widgets button, .sp-right-side-widgets div').length > 1) {
                        $('.sp-widget9').css({
                            'margin-top': '20px'
                        });
                    }
                });
            }
        }


        /* Validate Widget 11 */
        var widget11RequiredSettings = ['buttonText'];

        if (typeof widgets.widget11 !== 'undefined'
            && (widgets.widget11.isEnabled || widgets.widget11.items[0].enabled)) {
            if (isWidgetSettingsDefined(widgets.widget11.items[0], widget11RequiredSettings)) {
                implementWidget11(widgets.widget11.items[0]);
            }
        }

        /* Implement Widget 1 */
        function implementWidget1(videos) {

            // Create widget structure.
            $('body').append(
                '<div class="widget sp--direction-ltr" id="sp-widget1">' +
                '<div id="sp-widget1-tab"><i class="fa fa-video-camera"></i><div class="sp-widget-font-fmaily">Loading...</div></div><i id="sp-widget1-fa-chevron" class="fa fa-chevron-up"></i>' +
                '<div id="sp-widget1-video-container"></div>' +
                '</div>');


            /* Load Video Players */
            $.each(sp.viewer.widgets.widget1.videoPlayersIsReady, function (videoPlayer, isReady) {
                switch (videoPlayer) {
                    case 'defaultPlayer':
                        loadDefaultPlayer();
                        break;

                    case 'youTube':
                        loadYouTubePlayer();
                        break;
                }
            });

            function loadDefaultPlayer() {
                $('#sp-widget1-video-container').append(
                    '<iframe id="sp-widget1-default-player" frameborder="0" scrolling="no" allowfullscreen="true"></iframe>'
                );

                sp.viewer.widgets.widget1.videoPlayersIsReady['defaultPlayer'] = true;
                $(document).trigger('spDefaultPlayerReady');
            }

            function loadYouTubePlayer() {
                $('#sp-widget1-video-container').append('<div id="sp-widget1-youtube-player"></div>');
                $.getScript('https://www.youtube.com/iframe_api');
            }
        }


        /**
         * Load a video to the widget container.
         */
        function loadVideo(videos) {

            // Format videos array to an object for ease of access.
            var videosByPage = {};
            $.each(videos, function (index, video) {
                videosByPage['page' + video.videoPageStart.toString()] = video;
            });

            var isVideoCollapsed = true;
            for (var page = PDFViewerApplication.page; page > -1; page--) {
                if (typeof videosByPage['page' + page] !== 'undefined') {

                    // If the user didn't define the video to load on
                    // PDFViewerApplication.page than collapse the video.
                    if (PDFViewerApplication.page === page) {
                        isVideoCollapsed = false;
                    }

                    setVideo(
                        videosByPage['page' + page].videoSource,
                        videosByPage['page' + page].videoTitle,
                        videosByPage['page' + page].isYouTubeVideo,
                        isVideoCollapsed
                    );

                    // If a page with a video is found, break the loop.
                    break;
                }

                // If no page with a video is found then do the following
                if (0 === page) {

                    // Set video to the first available video.
                    setVideo(
                        videos[0].videoSource,
                        videos[0].videoTitle,
                        videos[0].isYouTubeVideo,
                        true
                    );
                }
            }

            // Video widget tab click mechanism.
            $('#sp-widget1').off('click').on('click', function (event) {
                $('#sp-widget1-video-container').toggle();
                $('#sp-widget1-fa-chevron').toggleClass('fa-chevron-up fa-chevron-down');
                sp.viewer.widgets.widget1.isVideoCollapseOverride = true;

                // Send event.
                if ($('#sp-widget1-video-container').is(':visible')) {
                    sendVideoTabClickedEvent(sp.viewer.paramValue.videoTabOpened);
                } else {
                    sendVideoTabClickedEvent(sp.viewer.paramValue.videoTabClosed);
                }
            });

            /**
             * Set video on the viewer.
             *
             * @param {string} videoSource - The video source.
             * @param {string} videoTitle - The video title.
             * @param {boolean} videoSource - Is the video a YouTube video.
             */
            function setVideo(videoSource, videoTitle, isYouTubeVideo, isVideoCollapsed) {
                if (videoSource !== sp.viewer.widgets.widget1.lastVideoSource) {

                    // Stop / remove running videos.
                    if (sp.viewer.widgets.widget1.videoPlayersIsReady.youTube) {
                        spYouTubePlayer.pauseVideo();
                    }

                    if (sp.viewer.widgets.widget1.videoPlayersIsReady.defaultPlayer) {
                        $('#sp-widget1-default-player').removeAttr('src');
                    }

                    if (isYouTubeVideo) {

                        // Load YouTube video.
                        $('#sp-widget1-youtube-player').css('visibility', 'hidden');
                        spYouTubePlayer.cueVideoById(videoSource.split('/')[4]);

                        // If the previous video was not a YouTube video.
                        if ('#sp-widget1-youtube-player'
                            !== sp.viewer.widgets.widget1.currentVideoPlayerCssSelector) {

                            $('#sp-widget1 iframe').hide();
                            $('#sp-widget1-youtube-player').show();
                            sp.viewer.widgets.widget1.currentVideoPlayerCssSelector =
                                '#sp-widget1-youtube-player';
                        }
                    } else {

                        // Load default video.
                        $('#sp-widget1-default-player').attr('src', videoSource);

                        // If the previous video was not a default video.
                        if ('#sp-widget1-default-player'
                            !== sp.viewer.widgets.widget1.currentVideoPlayerCssSelector) {

                            $('#sp-widget1 iframe').hide();
                            $('#sp-widget1-default-player').show();
                            sp.viewer.widgets.widget1.currentVideoPlayerCssSelector =
                                '#sp-widget1-default-player';
                        }
                    }

                    sp.viewer.widgets.widget1.lastVideoSource = videoSource;
                }

                // Set video title in video tab.
                $('#sp-widget1-tab div').text(videoTitle);

                // Collapse video algorithm.
                if (!sp.viewer.widgets.widget1.isVideoCollapseOverride) {
                    if (isVideoCollapsed) {
                        $('#sp-widget1-video-container').hide();
                    } else {
                        $('#sp-widget1-video-container').show();
                    }
                }

                if ($('#sp-widget1-video-container').is(':visible')) {
                    $('#sp-widget1-fa-chevron').addClass('fa-chevron-down').removeClass('fa-chevron-up');
                } else {
                    $('#sp-widget1-fa-chevron').addClass('fa-chevron-up').removeClass('fa-chevron-down');
                }
            }
        }
        function implementWidget2(widget) {

            // Widget 2 - Calendly widget
            if (0 == $('.sp-right-side-widgets').length) {
                $('body').append('<div class="sp-right-side-widgets"></div>');
            }

            $('.sp-right-side-widgets').append('<button class="widget sp-widget-button sp-widget-font-fmaily sp--direction-ltr" id="sp-widget2"></button>');

            if ($('.sp-right-side-widgets button, .sp-right-side-widgets div').length > 1) {
                $('#sp-widget2').css('margin-top', '20px');
            }

            $('#sp-widget2').html('<i class="fa fa-calendar"></i><div>' + sp.escapeHtml(widget.buttonText) + '</div>');
            $('#sp-widget2').click(function () {
                swal({
                    showCancelButton: true,
                    showConfirmButton: false,
                    html: '<iframe src="/assets/viewer/widget/calendly.html?user=' + sp.escapeHtml(widget.userName) + '" height="420" frameborder="0"></iframe>',
                    title: widget.buttonText,
                }).done();

                /**
                 * Send Calendly event.
                 *
                 * param_1_varchar - The text on the Calendly button.
                 */
                sp.sendEvent({
                    type: sp.viewer.eventName.viewerWidgetCalendlyClicked,
                    channelFriendlyId: sp.viewer.linkHash,
                    sessionId: SP.SESSION_ID,
                    param_1_varchar: $(this).text()
                });
            });
        }


        function implementWidget3(widget) {

            // Widget 3 - Ask a question widget.
            // Custom settings.
            var confirmButtonText = 'Submit';
            if (typeof widget.confirmButtonText !== 'undefined' && widget.confirmButtonText !== '') {
                confirmButtonText = widget.confirmButtonText;
            }

            var cancelButtonText = 'Cancel';
            if (typeof widget.cancelButtonText !== 'undefined' && widget.cancelButtonText !== '') {
                cancelButtonText = widget.cancelButtonText;
            }

            var formTitle = widget.buttonText;
            if (typeof widget.formTitle !== 'undefined' && widget.formTitle !== '') {
                formTitle = widget.formTitle;
            }

            var formMessage = '';
            if (typeof widget.formMessage !== 'undefined' && widget.formMessage !== '') {
                formMessage = '<div id="sp-widget-3-form-message">' + sp.escapeHtml(widget.formMessage) + '</div>';
            }

            var customMessageLabel = 'Enter your message:';
            if (typeof widget.customMessageLabel !== 'undefined' && widget.customMessageLabel !== '') {
                customMessageLabel = widget.customMessageLabel;
            }

            var customEmailLabel = 'Enter your email address:';
            if (typeof widget.customEmailLabel !== 'undefined' && widget.customEmailLabel !== '') {
                customEmailLabel = widget.customEmailLabel;
            }

            var buttonColor = config.viewer.toolbarButtonBackground;
            if (!widget.isDefaultButtonColorEnabled) {
                if (typeof widget.buttonColor !== 'undefined' && widget.buttonColor !== '') {
                    buttonColor = widget.buttonColor;
                }
            }

            sp.validate = sp.validate || {};
            sp.validate.errorMessage = 'You must provide a valid email address.';
            if (typeof widget.customEmailValidationErrorMessage !== 'undefined' && widget.customEmailValidationErrorMessage !== '') {
                sp.validate.errorMessage = sp.escapeHtml(widget.customEmailValidationErrorMessage);
            }

            if (typeof widget.location === 'undefined' || widget.location.right) {
                loadRight();
            }

            if (typeof widget.location !== 'undefined' && widget.location.bottom) {
                loadBottom();
            }

            function loadRight() {
                if (0 == $('.sp-right-side-widgets').length) {
                    $('body').append('<div class="sp-right-side-widgets"></div>');
                }

                $('.sp-right-side-widgets').append('<button class="widget sp-widget-button sp-widget-font-fmaily sp--direction-ltr" id="sp-widget3"></button>');

                if ($('.sp-right-side-widgets button, .sp-right-side-widgets div').length > 1) {
                    $('#sp-widget3').css('margin-top', '20px');
                }

                $('#sp-widget3')
                    .css({
                        'background-color': buttonColor,
                        'color': config.viewer.toolbarCta1Color,
                    })
                    .html('<i class="fa fa-comment"></i><div>' + sp.escapeHtml(widget.buttonText) + '</div>');

                $('#sp-widget3').click(function () {
                    $.getScript('/assets/viewer/js/jquery.validate.min.js', function () {
                        $.getScript('/assets/viewer/js/sp-viewer-validation.js', function () {
                            loadSwal();
                        });
                    });
                });
            }

            function loadBottom() {
                $.getScript('/assets/viewer/js/jquery.validate.min.js', function () {
                    $.getScript('/assets/viewer/js/sp-viewer-validation.js', function () {
                        $('#sp-widget3__bottom-submit').click(function () {
                            validateBottomOfDocumentForm();
                        });
                    });
                });

                var bottomOfDocumentHtml =
                    '<div class="widget sp-widget3__bottom-document-container">' +
                    '<div>' +
                    '<h4 id="sp-widget3__bottom-success-message">Thanks, your message has been submitted!</h4>' +
                    '<form id="widget3-bottom-form" class="sp-widget-font-fmaily">' +
                    '<h2 id="sp-widget-3-form-title">' + sp.escapeHtml(formTitle) + '</h2>' +
                    '<div class="form-group">' +
                    '<label for="sp-widget3-bottom-message" class="sp-widget3-label">' + sp.escapeHtml(customMessageLabel) + '</label>' +
                    '<textarea id="sp-widget3-bottom-message" rows="5"></textarea>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label for="sp-widget3-bottom-email" class="sp-widget3-label"><span>* </span>' + sp.escapeHtml(customEmailLabel) + '</label>' +
                    '<input type="text" name="widget3EmailBottom" id="sp-widget3-bottom-email">' +
                    '<span class="form-control-feedback fa"></span>' +
                    '</div>' +
                    formMessage +
                    '<div id="sp-widget3__bottom-document-submit-container" class="form-group">' +
                    '<div id="sp-widget3__bottom-submit">' + sp.escapeHtml(confirmButtonText) + '</div>' +
                    '<div>' +
                    '</form>' +
                    '</div>' +
                    '</div>';

                $('.page:last').after(bottomOfDocumentHtml);
                setWidgetWidthRelativeToPageWidth();

                $(window).on('scalechange', function () {
                    setWidgetWidthRelativeToPageWidth();
                });

                function setWidgetWidthRelativeToPageWidth() {
                    $('.sp-widget3__bottom-document-container').width($('.page').width());
                }
            }

            function validateBottomOfDocumentForm() {
                if ($('#widget3-bottom-form').valid()) {
                    sp.sendEvent({
                        type: sp.viewer.eventName.viewerWidgetAskQuestion,
                        channelFriendlyId: sp.viewer.linkHash,
                        sessionId: SP.SESSION_ID,
                        param_2_varchar: $('#sp-widget3-bottom-message').val(),
                        param_3_varchar: $('#sp-widget3-bottom-email').val(),
                        param_4_varchar: confirmButtonText,
                        param_5_varchar: cancelButtonText,
                        param_6_varchar: customMessageLabel,
                        param_7_varchar: customEmailLabel,
                        param_8_varchar: sp.validate.errorMessage,
                        param_9_varchar: 'bottom',
                        param_10_varchar: formTitle,
                    });

                    $('.sp-widget3__bottom-document-container form').hide();
                    $('#sp-widget3__bottom-success-message').show();
                }
            }

            function loadSwal() {
                swal({
                    customClass: 'sp--direction-ltr',
                    confirmButtonText: confirmButtonText,
                    cancelButtonText: cancelButtonText,
                    showCancelButton: true,
                    showConfirmButton: true,
                    html: '<form id="widget3-form" class="sp-widget-font-fmaily">' +
                    '<div class="form-group">' +
                    '<label for="sp-widget3-message" class="sp-widget3-label">' + sp.escapeHtml(customMessageLabel) + '</label>' +
                    '<textarea class="swal2-textarea" id="sp-widget3-message" rows="5" autofocus></textarea>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label for="sp-widget3-email" class="sp-widget3-label"><span>* </span>' + sp.escapeHtml(customEmailLabel) + '</label>' +
                    '<input type="text" name="widget3Email" class="swal2-input" id="sp-widget3-email">' +
                    '<span class="form-control-feedback fa"></span>' +
                    '</div>' +
                    formMessage +
                    '</form>',
                    title: formTitle,
                    preConfirm: function () {
                        return new Promise(function (resolve) {
                            /**
                             * Send Ask a Question event.
                             *
                             * param_1_varchar - The text on the Ask a Question button.
                             * param_2_varchar - The message in the widget form.
                             * param_3_varchar - The email address to reply to in the widget form.
                             */

                            if ($('#widget3-form').valid()) {
                                sp.sendEvent({
                                    type: sp.viewer.eventName.viewerWidgetAskQuestion,
                                    channelFriendlyId: sp.viewer.linkHash,
                                    sessionId: SP.SESSION_ID,
                                    param_1_varchar: $('#sp-widget3').text(),
                                    param_2_varchar: $('#sp-widget3-message').val(),
                                    param_3_varchar: $('#sp-widget3-email').val(),
                                    param_4_varchar: confirmButtonText,
                                    param_5_varchar: cancelButtonText,
                                    param_6_varchar: customMessageLabel,
                                    param_7_varchar: customEmailLabel,
                                    param_8_varchar: sp.validate.errorMessage,
                                    param_9_varchar: 'right',
                                    param_10_varchar: formTitle,
                                });
                                resolve();
                            }
                        });
                    }
                }).then(function () {
                    swal("Success!", "Your message has been sent.", "success");
                }).done();
            }
        }


        function implementWidget4(widget) {

            // Widget 4 - Like button widget.
            $('body').append('<div class="widget sp-like-button-widget"></div>');

            $('.sp-like-button-widget').append(
                '<button class="sp-like-btn sp-hidden">' +
                '<i id="sp-thumbs-up__i" class="fa fa-thumbs-o-up" aria-hidden="true"></i>' +
                '<p id="sp-count-likes__p"></p>' +
                '</button>'
            );

            $('.sp-like-btn').one('click', function() {
                sp.sendEvent({
                    type: sp.viewer.eventName.viewerWidgetLikeClicked,
                    channelFriendlyId: sp.viewer.linkHash,
                    sessionId: SP.SESSION_ID
                });

                // Change the colour of the button.
                $('.sp-like-btn').addClass('sp-like-btn-clicked');
                $('#sp-thumbs-up__i, #sp-count-likes__p').css('color', '#fff');
            });
        }


        function implementWidget5(widget) {

            // Widget 5 - Hopper Widget.

            //Vertical part
            $('body').append(
                '<div class="widget sp-widget5 sp--direction-ltr">' +
                '<div class="sp-widget5__extend-button">' +
                '<i class="fa fa-chevron-left"></i>' +
                '</div>' +
                '<div id="sp-widget5__hopper-container"></div>' +
                '</div>');

            $.each(widget, function (index, value) {
                var id = 'sp-widget5__hop-' + index;
                $('#sp-widget5__hopper-container').append(
                    '<div class="sp-widget5__hop sp-widget5__hop-extended" id="' + sp.escapeHtml(id) + '" data-page-hop="' + sp.escapeHtml(value.hopperPage) + '">' +
                    '<p class="sp-widget5__hop-text sp-widget5__hop--visible">' + sp.escapeHtml(value.hopperText) + '</p>' +
                    '<p class="sp-widget5__hop-page sp-widget5__hop--hidden">' + sp.escapeHtml(value.hopperPage) + '</p>' +
                    '</div>'
                );

                // Set the hopper colour to be the same as CTA buttons.
                $('.sp-widget5__hop, .sp-widget5__extend-button').css({
                    'background-color': config.viewer.toolbarButtonBackground,
                    'color': config.viewer.toolbarCta1Color
                });
                if (typeof value.status !== 'undefined' && 'finished' === value.status) {
                    $('#' + id).css({'opacity': '0.5'});
                }

                // Send event.
                $('#sp-widget5__hop-' + index).on('click', function () {
                    sp.sendEvent({
                        type: sp.viewer.eventName.viewerWidgetHopperClicked,
                        channelFriendlyId: sp.viewer.linkHash,
                        sessionId: SP.SESSION_ID,
                        param_1_varchar: $('#sp-widget5__hop-' + index + ' .sp-widget5__hop-text').text(),
                        param_2_varchar: $('#sp-widget5__hop-' + index).attr('data-page-hop')
                    });

                    PDFViewerApplication.page = parseInt($('#sp-widget5__hop-' + index).attr('data-page-hop'));
                });
            });

            $('#sp-widget5__hopper-container').children().each(function () {
                if($(this).attr("data-page-hop") == PDFViewerApplication.page) {
                    $(this).addClass('selected');
                } // "this" is the current element in the loop
            });
            /**
             * Open and close the hoppers.
             *
             * The '.sp-widget5__extend-button' button can only be seen under 600px width.
             */
            $('.sp-widget5__extend-button').on('click', function () {
                hopperWidgetToggleButton();
            });

            function hopperWidgetToggleButton() {
                $('.sp-widget5__hop').toggleClass('sp-widget5__hop-extended');
                $('.sp-widget5__extend-button i').toggleClass('fa-chevron-right fa-chevron-left');

                // Toggle visibility of hopper page / hopper text.
                $('.sp-widget5__hop p').toggleClass('sp-widget5__hop--hidden sp-widget5__hop--visible');
            }
        }

        function implementWidget5HorizontalHopper(widget) {

            // Widget 5 - Hopper Widget.

            //Horizontal part
            $('body').append(
                '<div class="widget sp-widget5-horizontal-hopper sp--direction-ltr">' +
                '<div id="sp-widget5__horizontal-hopper-container"></div>' +
                '</div>');

            $.each(widget, function (index, value) {
                var id = 'sp-widget5__horizontal-hop-' + index;
                $('#sp-widget5__horizontal-hopper-container').append(
                    '<div class="sp-widget5__horizontal-hop sp-widget5__horizontal-hop-extended" id="' + sp.escapeHtml(id) + '" data-page-horizontal-hop="' + sp.escapeHtml(value.hopperPage) + '">' +
                    '<p class="sp-widget5__horizontal-hop-text sp-widget5__horizontal-hop--visible">' + sp.escapeHtml(value.hopperText) + '</p>' +
                    '<p class="sp-widget5__horizontal-hop-page sp-widget5__horizontal-hop--hidden">' + sp.escapeHtml(value.hopperPage) + '</p>' +
                    '</div>'
                );

                // Set the horizontal hopper colour to be the same as CTA buttons.
                $('.sp-widget5__horizontal-hop, .sp-widget5__extend-button').css({
                    'background-color': config.viewer.toolbarButtonBackground,
                    'color': config.viewer.toolbarCta1Color
                });

                if (typeof value.status !== 'undefined' && 'finished' === value.status) {
                    $('#' + id).css({'opacity': '0.5'});
                }

                // Send event.
                $('#sp-widget5__horizontal-hop-' + index).on('click', function () {
                    sp.sendEvent({
                        type: sp.viewer.eventName.viewerWidgetHopperClicked,
                        channelFriendlyId: sp.viewer.linkHash,
                        sessionId: SP.SESSION_ID,
                        param_1_varchar: $('#sp-widget5__horizontal-hop-' + index + ' .sp-widget5__horizontal-hop-text').text(),
                        param_2_varchar: $('#sp-widget5__horizontal-hop-' + index).attr('data-page-horizontal-hop')
                    });

                    PDFViewerApplication.page = parseInt($('#sp-widget5__horizontal-hop-' + index).attr('data-page-horizontal-hop'));
                });
            });
            $('#sp-widget5__horizontal-hopper-container').on("mousewheel",function(event){
                var value = $(this).scrollLeft() + 300;
                var value1 = $(this).scrollLeft() - 300;
                if(event.originalEvent.wheelDelta /120 > 0) {
                    $(this).scrollLeft(value);
                }
                else{
                    $(this).scrollLeft(value1);
                }
                event.preventDefault();
            });
            // Set the horizontal hopper arrow colour to be the same as CTA buttons.
            $('<style>.sp-widget5__horizontal-hop:after{border-left-color:'+config.viewer.toolbarButtonBackground+'}</style>').appendTo('head');

            // Select active button with color
            $('#sp-widget5__horizontal-hopper-container').children().each(function () {
                if($(this).attr("data-page-horizontal-hop") == PDFViewerApplication.page) {
                    $(this).addClass('selected')
                }; // "this" is the current element in the loop
            });
        }

        function implementWidget6(testimonials) {
            if (0 === $('.sp-right-side-widgets').length) {
                $('body').append('<div class="sp-right-side-widgets"></div>');
            }

            $('.sp-right-side-widgets').append(
                '<div class="widget" id="sp-widget6__button">' +
                '<div id="sp-widget6__button-counter">1</div>' +
                '<div id="sp-widget6__button-person-image"></div>' +
                '<i class="fa fa-user fa-inverse"></i>' +
                '</div>'
            );

            sp.viewer.widgets.widget6.isReady = true;
            $(document).trigger('spWidget6Ready');
        }


        /**
         * Load a testimonial to the widget container.
         */
        function loadTestimonial(testimonials) {

            // Format testimonials array to an object for ease of access.
            var testimonialsByPage = {};
            $.each(testimonials, function (index, testimonial) {
                testimonialsByPage['page' + testimonial.page.toString()] = testimonial;
            });

            for (var page = PDFViewerApplication.page; page > -1; page--) {
                if (typeof testimonialsByPage['page' + page] !== 'undefined') {

                    setTestimonial(
                        testimonialsByPage['page' + page].buttonText,
                        testimonialsByPage['page' + page].personImage,
                        testimonialsByPage['page' + page].personName,
                        testimonialsByPage['page' + page].personTitle,
                        testimonialsByPage['page' + page].testimonial
                    );

                    // If a page with a testimonial is found, break the loop.
                    break;
                }

                // If no page with a testimonial is found then do the following
                if (0 === page) {

                    // Set video to the first available video.
                    setTestimonial(
                        testimonials[0].buttonText,
                        testimonials[0].personImage,
                        testimonials[0].personName,
                        testimonials[0].personTitle,
                        testimonials[0].testimonial
                    );
                }
            }

            function setTestimonial(buttonText, personImage, personName, personTitle, testimonial) {
                var personImageDiv = '';

                if ('' !== personImage) {
                    personImageDiv = '<div id="sp-widget6__person-image" style="background-image: url(' + sp.escapeHtml(personImage) + ');"></div>';
                    $('#sp-widget6__button-person-image')
                        .css({'background-image': 'url(' + personImage + ')', 'background-color': 'transparent'});
                    $('#sp-widget6__button i').hide();
                } else {
                    $('#sp-widget6__button-person-image')
                        .css({'background-image': 'none', 'background-color': '#009688'});
                    $('#sp-widget6__button i').show();
                }

                $('#sp-widget6__button')
                    .off('click')
                    .on('click', function () {
                        swal({
                            customClass: 'sp--direction-ltr',
                            html: personImageDiv +
                            '<div><i class="fa fa-quote-left"></i> ' + sp.escapeHtml(testimonial).replace(/\r\n|\r|\n/g, '<br>') + ' <i class="fa fa-quote-right"></i></div>' +
                            '<div id="sp-widget6__person-name">' + sp.escapeHtml(personName) + '</div>' +
                            '<div id="sp-widget6__person-title">' + sp.escapeHtml(personTitle) + '</div>'
                        }).done();

                        /**
                         * Send Ask a Question event.
                         *
                         * param_1_varchar - The text on the Ask a Question button.
                         * param_2_varchar - The message in the widget form.
                         * param_3_varchar - The email address to reply to in the widget form.
                         */
                        sp.sendEvent({
                            type: sp.viewer.eventName.viewerWidgetTestimonialsClicked,
                            channelFriendlyId: sp.viewer.linkHash,
                            sessionId: SP.SESSION_ID,
                            param_1_varchar: buttonText,
                            param_2_varchar: personName,
                            param_3_varchar: personTitle,
                            param_4_varchar: testimonial,
                        });
                    });
            }
        }
    }
    function implementWidget7(widget) {

        // Widget 7 - Form widget.
        // Widget location - right side.
        if (0 == $('.sp-right-side-widgets').length) {
            $('body').append('<div class="sp-right-side-widgets"></div>');
        }

        $('.sp-right-side-widgets').append('<button class="widget sp-widget-button sp-widget-font-fmaily sp--direction-ltr" id="sp-widget7"></button>');

        if ($('.sp-right-side-widgets button, .sp-right-side-widgets div').length > 1) {
            $('#sp-widget7').css('margin-top', '20px');
        }

        $('#sp-widget7').html('<i class="fa ' + sp.escapeHtml(widget.formButtonIcon) + '"></i><div><p>' + sp.escapeHtml(widget.formButtonTextLine1) + '</p></div>');
        if ('' !== widget.formButtonTextLine2) {
            $('#sp-widget7 p').after(
                '<p>' + sp.escapeHtml(widget.formButtonTextLine2) + '</p>'
            );
        }

        // Widget location - below toolbar.
        if ('belowToolbar' === widget.formWidgetPlacement) {
            $('body').append(
                '<div class="widget" id="sp-widget7__toolbar-button-container">' +
                '<button id="sp-widget7__toolbar-button"></button>' +
                '</div>'
            );

            $('#sp-widget7__toolbar-button').html('<p>' + sp.escapeHtml(widget.formButtonTextLine1) + '</p>');
            if ('' !== widget.formButtonTextLine2) {
                $('#sp-widget7__toolbar-button p').after(
                    '<p>' + sp.escapeHtml(widget.formButtonTextLine2) + '</p>'
                );
            }

            $('#sp-widget7__toolbar-button-container').addClass('sp-widget7__toolbar-button-container--visibility');

            $('#sp-widget7').addClass('sp-widget7--hidden');
        }

        $('#sp-widget7, #sp-widget7__toolbar-button').css({
            'background-color': config.viewer.toolbarButtonBackground,
            'color': config.viewer.toolbarCta1Color,
        });

        // Widget Animation.
        if (widget.isWidgetButtonPulseEnabled) {
            $('#sp-widget7, #sp-widget7__toolbar-button').addClass('sp-widget7--beat');
        }

        var formAutoLoadTimeout = parseInt(widget.formAutoLoadTimeout);
        if (formAutoLoadTimeout > -1) {
            setTimeout(
                function () {

                    // Open form.
                    $('#sp-widget7').click();
                },

                // Time is converted to milliseconds.
                Math.floor(formAutoLoadTimeout * 1000)
            );
        }

        $('#sp-widget7, #sp-widget7__toolbar-button').click(function () {

            switch (widget.formSelectType) {
                case 'image':
                    imageSwal();
                    break;

                case 'form':
                    formSwal();
                    break;
            }

            /**
             * Send form button click event.
             *
             * param_1_varchar - The text on the button.
             */
            sp.sendEvent({
                type: sp.viewer.eventName.viewerWidgetFormButtonClicked,
                channelFriendlyId: sp.viewer.linkHash,
                sessionId: SP.SESSION_ID,
                param_1_varchar: $(this).text(),
                param_2_varchar: location.href
            });

            function formSwal() {
                swal({
                    allowOutsideClick: false,
                    cancelButtonText: widget.formCancelButton,
                    cancelButtonColor: widget.formCancelButtonColor,
                    customClass: 'sp-widget7__swal',
                    imageUrl: widget.formImage,
                    imageHeight: 65,
                    showCancelButton: true,
                    showConfirmButton: false,
                    html: '<iframe id="sp-widget7-form" style="width: 100%" src="' + sp.escapeHtml(widget.formUrl) + '" frameborder="0"></iframe>',
                    title: widget.formTitle,
                    width: 950,
                }).then(function () {
                    },
                    function (dismiss) {
                        if (dismiss === 'cancel') {
                            sp.sendEvent({
                                type: sp.viewer.eventName.viewerWidgetFormCancelClicked,
                                channelFriendlyId: sp.viewer.linkHash,
                                sessionId: SP.SESSION_ID,
                                param_1_varchar: $('.swal2-cancel').text()
                            });
                        }
                    });
            }

            function imageSwal() {
                swal({
                    html: '<img src="' + sp.escapeHtml(widget.formImage) + '" style="width: 100%; height: 100%; max-width: '
                    + sp.escapeHtml(widget.formImageMaxWidth) + '; max-height: ' + sp.escapeHtml(widget.formImageMaxWidth) + ';">',
                    title: widget.formTitle,
                }).done();
            }

            /**
             * Send form confirm click event.
             *
             * param_1_varchar - The text on the button.
             */
            $('.swal2-confirm').off('click').on('click', function () {
                sp.sendEvent({
                    type: sp.viewer.eventName.viewerWidgetFormConfirmClicked,
                    channelFriendlyId: sp.viewer.linkHash,
                    sessionId: SP.SESSION_ID,
                    param_1_varchar: $(this).text()
                });
            });
        });
    }

    /**
     * Implement widget 8 - Code widget.
     *
     * @params {array} items - The codes to be inserted into the viewer.
     */
    function implementWidget8(items) {
        $.each(items, function (index, item) {
            switch (item.codeLocation) {
                case 'beforeClosingHead':
                    $('head').append(item.codeContent);
                    break;

                case 'afterOpeningBody':
                    $('body').prepend(item.codeContent);
                    break;

                case 'beforeClosingBody':
                    $('body').append(item.codeContent);
                    break;
            }
        });
    }

    function implementWidget10(widget) {
        $('.toolbar').addClass('sp-z-index--0');

        sp.sendEvent({
            type: sp.viewer.eventName.viewerWidgetRequestFormShown,
            channelFriendlyId: sp.viewer.linkHash,
            sessionId: SP.SESSION_ID,
            param_1_varchar: widget.formTitle,
        });

        swal({
            allowEscapeKey: false,
            allowOutsideClick: false,
            html: '<h3 id="sp-widget10__form-title">' + sp.escapeHtml(widget.formTitle) + '</h3>',
            input: 'email',
            showCancelButton: false,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
        }).then(function (email) {
            sp.viewer.widgets.widget10.emailAddress = email;

            sp.sendEvent({
                type: sp.viewer.eventName.viewerWidgetRequestEmailEntered,
                channelFriendlyId: sp.viewer.linkHash,
                sessionId: SP.SESSION_ID,
                param_1_varchar: email,
                param_2_varchar: widget.formTitle,
            });

            // Add the email address & document link hash to local storage.
            var spWidgetsStorage = JSON.parse(localStorage.getItem('slidepiper'));
            if (null !== spWidgetsStorage && typeof spWidgetsStorage.widgets !== 'undefined') {
                if (typeof spWidgetsStorage.widgets.widget10 !== 'undefined') {
                    spWidgetsStorage.widgets.widget10.items.push({email: email, documentLinkHash: getParameterByName('f')});
                } else {
                    spWidgetsStorage.widgets.widget10 = {
                        items: [
                            {
                                email: email,
                                documentLinkHash: getParameterByName('f'),
                            },
                        ]
                    };
                }

                localStorage.setItem('slidepiper', JSON.stringify(spWidgetsStorage));
            } else {
                var newWidgetsStorage = {
                    widgets: {
                        widget10: {
                            items: [
                                {
                                    email: email,
                                    documentLinkHash: getParameterByName('f')
                                }
                            ]
                        }
                    }
                };
                localStorage.setItem('slidepiper', JSON.stringify(newWidgetsStorage));
            }

            $('.toolbar').removeClass('sp-z-index--0');

            document.dispatchEvent(new CustomEvent('spsessionstart'));
        });
    }

    function implementWidget11(widget) {
        var buttonColor = config.viewer.toolbarButtonBackground;

        if (widget.isButtonColorCustom) {
            if (typeof widget.buttonColor !== 'undefined' && widget.buttonColor !== '') {
                buttonColor = widget.buttonColor;
            }
        }

        if (0 == $('.sp-right-side-widgets').length) {
            $('body').append('<div class="sp-right-side-widgets"></div>');
        }

        $('.sp-right-side-widgets').append(
            '<button class="widget sp-widget-button sp-widget-font-fmaily sp--direction-ltr" id="sp-widget11"></button>'
        );

        if ($('.sp-right-side-widgets button, .sp-right-side-widgets div').length > 1) {
            $('#sp-widget11').css('margin-top', '20px');
        }

        $('#sp-widget11')
            .css({
                'background-color': buttonColor,
                'color': config.viewer.toolbarCta1Color,
            })
            .html('<i class="fa fa-share-alt"></i><div>' + sp.escapeHtml(widget.buttonText) + '</div>')
            .click(function () {
                sp.sendEvent({
                    type: sp.viewer.eventName.viewerWidgetShareButtonClicked,
                    channelFriendlyId: sp.viewer.linkHash,
                    sessionId: SP.SESSION_ID,
                });
            });

        var linkUrl = document.querySelectorAll('[property="og:url"]')[0].getAttribute('content');

        $('body').append(
            '<a class="a2a_dd" style="display: none;" href="https://www.addtoany.com/share">Share</a>'
            + '<script>'
            + 'var a2a_config = a2a_config || {};'
            + 'a2a_config.onclick = 1;'
            + 'a2a_config.prioritize = ["facebook", "linkedin", "email", "whatsapp"];'
            + 'a2a_config.num_services = 4;'
            + 'a2a_config.target = "#sp-widget11";'
            + 'a2a_config.linkurl = "' + linkUrl + '";'
            + 'a2a_config.templates = {'
            + 'twitter:' + JSON.stringify(sp.escapeHtml(widget.description) + ' ' + window.location.href) + ','
            + 'email: {'
            + 'subject:' + JSON.stringify(sp.escapeHtml(widget.title)) + ','
            + 'body:' + JSON.stringify('Follow this link: ' + window.location.href) + ','
            + '},'
            + 'whatsapp:' + JSON.stringify(sp.escapeHtml(widget.description) + ' ' + window.location.href) + ','
            + 'linkedin:' + JSON.stringify(sp.escapeHtml(widget.description) + ' ' + window.location.href) + ','
            + '};'
            + 'sp.viewer.widgets.widget11.spWidget11Share = function(data) {'
            + 'sp.viewer.widgets.widget11.sharedService = data.service;'
            + '$(document).trigger("spWidget11ServiceShared", [data.service]);'
            + '};'
            + 'a2a_config.callbacks = a2a_config.callbacks || [];'
            + 'a2a_config.callbacks.push({share: sp.viewer.widgets.widget11.spWidget11Share});'
            + '</script>'
        );

        $(document).on('spWidget11ServiceShared', function (event, sharedService) {
            sp.sendEvent({
                type: sp.viewer.eventName.viewerWidgetShareServiceClicked,
                channelFriendlyId: sp.viewer.linkHash,
                sessionId: SP.SESSION_ID,
                param_1_varchar: sharedService,
            })
        });

        $.getScript('/assets/viewer/js/page.min.js');
    }
});

sp.escapeHtml = function(input) {
    var entityMap = {
        '&': '&#38;',
        '<': '&#60;',
        '>': '&#62;',
        '"': '&#34;',
        "'": '&#39;',
        '/': '&#47;',
        '`': '&#96;',
        '=': '&#61;'
    };

    return String(input).replace(/[&<>"'`=\/]/g, function(char) {
        return entityMap[char];
    });
}


/**
 * Log event when video tab is clicked.
 *
 * @param {string} videoTabState - A value representing whether the video
 * widget container is opened or closed.
 */
function sendVideoTabClickedEvent(videoTabState) {
    sp.sendEvent({
        type: sp.viewer.eventName.viewerWidgetVideoTabClicked,
        channelFriendlyId: sp.viewer.linkHash,
        sessionId: SP.SESSION_ID,
        param_1_varchar: $(sp.viewer.widgets.widget1.currentVideoPlayerCssSelector).attr('src'),
        param_2_varchar: $('#sp-widget1-tab div').text(),
        param_3_varchar: videoTabState
    });
}


/**
 * Create YouTube player.
 *
 *  @see https://developers.google.com/youtube/iframe_api_reference
 */
var spYouTubePlayer;
function onYouTubeIframeAPIReady() {
    spYouTubePlayer = new YT.Player('sp-widget1-youtube-player', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    sp.viewer.widgets.widget1.videoPlayersIsReady['youTube'] = true;
    $(document).trigger('spYouTubePlayerReady');
}

/**
 * YouTube iFrame API function which is called when the state of the player
 * changes i.e. played, paused, ended.
 *
 * @param {string} param_1_varchar - The video being played.
 * @param {string} param_2_varchar - The title of the video chosen by the salesman.
 */
function onPlayerStateChange(event) {
    var playerState = event.data;

    // Return visibilty to player after YouTube has been video cued.
    if (5 === playerState) {
        $('#sp-widget1-youtube-player').css('visibility', 'visible');
    }

    if (playerState === 1 || playerState === 2) {
        var data = {
            channelFriendlyId: sp.viewer.linkHash,
            sessionId: SP.SESSION_ID,
            param_1_varchar: spYouTubePlayer.getVideoUrl(),
            param_2_varchar: $('#sp-widget1-tab div').text(),
        };
    }

    switch (playerState) {
        // YouTube video played.
        case 1:
            data.type = sp.viewer.eventName.viewerWidgetVideoYouTubePlayed;
            sp.sendEvent(data);
            break;

        // YouTube video paused.
        case 2:
            data.type = sp.viewer.eventName.viewerWidgetVideoYouTubePaused;
            sp.sendEvent(data);
            break;
    }
}


/**
 * The function returns the value of a URL query string parameter.
 *
 * @param String name Query string key.
 * @see http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 *
 * @return The URL query string parameter's value.
 */
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// CustomEvent polyfill.
(function() {
    if (typeof window.CustomEvent === 'function') return false;

    function CustomEvent(type, customEventInit) {
        customEventInit = customEventInit || {bubbles: false, cancelable: false, detail: undefined};
        var customEvent = document.createEvent('CustomEvent');
        customEvent.initCustomEvent(type, customEventInit.bubbles, customEventInit.cancelable, customEventInit.detail);
        return customEvent;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();