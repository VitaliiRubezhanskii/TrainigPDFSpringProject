/* Initialize initView() in viewercode.js */
$(document).on('pagesloaded pagechange', function(event) {
  var isPagesLoaded = false;
  if (! isPagesLoaded && 'pagesloaded' === event.type) {
    initView();
    isPagesLoaded = true;
  }
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
      
  var innerTermsPrivacy =
    '<a href="../../tou.html" target="_blank">Terms</a> · <a href="../../privacy.html" target="_blank">Privacy</a><br>' +
    'Powered by <span class="sp-powered-by"><a target="_blank" href="http://www.slidepiper.com">SlidePiper</a></span>';
  
  $('body').append('<div id="sp-terms-privacy">' + innerTermsPrivacy + '</div>');
  $('#secondaryToolbarButtonContainer').append(
     '<div class="horizontalToolbarSeparator"></div>' +
     '<div id="sp-terms-privacy-secondary-toolbar">' + innerTermsPrivacy + '</div>');
})();


/**
 * Set actions on events.
 */
$('#secondaryPresentationMode').on('click', function() {
  send_event("REQUEST_FULLSCREEN", "0", "0", ipaddr);      
});

$('#secondaryPrint').on('click', function() {
  console.log('print');
  send_event("PRINT", "0", "0", ipaddr);      
});

$('#secondaryDownload').on('click', function() {
  send_event("DOWNLOAD", "0", "0", ipaddr);      
});


/**
 * Viewer functions.
 */
var sp = sp || {};
sp.viewer = {
  breakPoint: 768,
  eventName: {
    clickedCta: 'CLICKED_CTA',
    viewerWidgetCalendlyClicked: 'VIEWER_WIDGET_CALENDLY_CLICKED',
    viewerWidgetVideoTabClicked: 'VIEWER_WIDGET_VIDEO_TAB_CLICKED',
    viewerWidgetVideoYouTubePlayed: 'VIEWER_WIDGET_VIDEO_YOUTUBE_PLAYED',
    viewerWidgetVideoYouTubePaused: 'VIEWER_WIDGET_VIDEO_YOUTUBE_PAUSED',
    viewerWidgetAskQuestion: 'VIEWER_WIDGET_ASK_QUESTION'
  },
  paramValue: {
  	videoTabOpened: 'VIEWER_WIDGET_VIDEO_TAB_OPENED',
  	videoTabClosed: 'VIEWER_WIDGET_VIDEO_TAB_CLOSED'
  },
  linkHash: getParameterByName('f'),
  widget: {},
  
  /**
   * @param {String} param_1_varchar - The CTA button id attribute.
   * @param {String} param_2_varchar - The CTA button text
   * @param {String} param_3_varchar = The CTA button destination URL
   */
  init: (function() {
    $(document).ready(function() {
      $('.sp-cta, .sp-secondary-cta').click(function() {
        var eventData = {
          eventName: sp.viewer.eventName.clickedCta,
          param_1_varchar: $(this).attr('id'),
          param_2_varchar: $(this).text(),
          param_3_varchar: $(this).attr('href'),
          linkHash: sp.viewer.linkHash,
          sessionId: sessionid
        };
        
        sp.viewer.setCustomerEvent(eventData);
      });
    });
  })(),
  
  /**
   * Set a customer event in the DB.
   * 
   * @param {String} eventName The event name.
   * @param {Object} eventData The event data.
   */
  setCustomerEvent: function(eventData) {
    if ("0" == role) {
      var data = {
        action: 'setCustomerEvent',
        data: eventData
      };
      $.post('../../ManagementServlet', JSON.stringify(data));
    }
  }
};

if ('' != sp.viewer.linkHash) {
  $.getJSON('../../config-viewer', {linkHash: sp.viewer.linkHash}, function(config) {
    
    PDFViewerApplication.open(config.appUrl + '/file/' + sp.viewer.linkHash
        + '?file-name=' + config.viewer.file.fileName);
    
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
          function() {
            $(this).css('background', config.viewer.toolbarButtonHoverBackground);
          },function() {
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
          function() {
            $(this).css('border', config.viewer.toolbarButtonHoverBorder);
          },function() {
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
          function() {
            $(this).css('box-shadow', config.viewer.toolbarButtonHoverBoxShadow);
          },function() {
            $(this).css('box-shadow', config.viewer.toolbarButtonBoxShadow);
          }
        );
      }
    }
    
    if (typeof config.viewer.toolbarColor !== 'undefined') {
      $('.toolbarLabel, .toolbarField, #scaleSelect option, #sp-terms-privacy-secondary-toolbar, #sp-terms-privacy-secondary-toolbar a')
          .css('color', config.viewer.toolbarColor);
      
      // A fix to set the document scale (select element) color. 
      $(document).on('pagesinit', function() {
        $('#scaleSelect').css('color', config.viewer.toolbarColor);
        $('.toolbarLabel, .toolbarField, #scaleSelectContainer, #scaleSelect').css('visibility', 'visible');
      }); 
    }
    
    // Find toolbar.
    if (typeof config.viewer.toolbarFindColor !== 'undefined') {
      $('#findbar .toolbarLabel, #findInput').css('color', config.viewer.toolbarFindColor);
    }
    
    if (typeof config.viewer.toolbarFindBackground !== 'undefined') {
      $('#findbar').css('background', config.viewer.toolbarFindBackground);
    }
    
    // Logo.
    if (typeof config.viewer.toolbarLogoImage !== 'undefined') {
      $('.sp-toolbar-logo a')
          .append('<img src="data:image/png;base64,' + config.viewer.toolbarLogoImage + '" alt="Company Logo">');
      
      if (typeof config.viewer.toolbarLogoLink !== 'undefined') {
        if (config.viewer.toolbarLogoLink === 'no-logo-link'){
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
    if (true == config.viewer.isCta1Enabled) {
      $('#sp-cta-secondary-toolbar-separator').show();
      
      if (typeof config.viewer.cta1CollapseMaxWidth !== 'undefined') {
        $('body').append(
            '<style>@media all and (max-width: ' + config.viewer.cta1CollapseMaxWidth
            + ') {#sp-cta1 {display: none;}}</style>');
      }
      
      if (typeof config.viewer.toolbarCta1Background !== 'undefined') {
        $('#sp-cta1').css('background', config.viewer.toolbarCta1Background);
        
        if (typeof config.viewer.toolbarCta1HoverBackground !== 'undefined') {
          $('#sp-cta1').hover(
            function() {
              $(this).css('background', config.viewer.toolbarCta1HoverBackground);
            },function() {
              $(this).css('background', config.viewer.toolbarCta1Background);
            }
          );
          
          $('#sp-cta1').click(function() {
            $(this).css('background', config.viewer.toolbarCta1Background);
          });
        }
      }
      
      if (typeof config.viewer.toolbarCta1Border !== 'undefined') {
        $('#sp-cta1').css('border', config.viewer.toolbarCta1Border);
        
        if (typeof config.viewer.toolbarCta1HoverBorder !== 'undefined') {
          $('#sp-cta1').hover(
            function() {
              $(this).css('border', config.viewer.toolbarCta1HoverBorder);
            },function() {
              $(this).css('border', config.viewer.toolbarCta1Border);
            }
          );
          
          $('#sp-cta1').click(function() {
            $(this).css('border', config.viewer.toolbarCta1Border);
          });
        }
      }
      
      if (typeof config.viewer.toolbarCta1Color !== 'undefined') {
        $('#sp-cta1').css('color', config.viewer.toolbarCta1Color);
        
        if (typeof config.viewer.toolbarCta1HoverColor !== 'undefined') {
          $('#sp-cta1').hover(
            function() {
              $(this).css('color', config.viewer.toolbarCta1HoverColor);
            },function() {
              $(this).css('color', config.viewer.toolbarCta1Color);
            }
          );
          
          $('#sp-cta1').click(function() {
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
    if (true == config.viewer.isCta2Enabled) {
      $('#sp-cta-secondary-toolbar-separator').show();
      
      if (typeof config.viewer.cta2CollapseMaxWidth !== 'undefined') {
        $('body').append(
            '<style>@media all and (max-width: ' + config.viewer.cta2CollapseMaxWidth
            + ') {#sp-cta2 {display: none;}}</style>');
      }
      
      if (typeof config.viewer.toolbarCta2Background !== 'undefined') {
        $('#sp-cta2').css('background', config.viewer.toolbarCta2Background);
        
        if (typeof config.viewer.toolbarCta2HoverBackground !== 'undefined') {
          $('#sp-cta2').hover(
            function() {
              $(this).css('background', config.viewer.toolbarCta2HoverBackground);
            },function() {
              $(this).css('background', config.viewer.toolbarCta2Background);
            }
          );
          
          $('#sp-cta2').click(function() {
            $(this).css('background', config.viewer.toolbarCta2Background);
          });
        }
      }
      
      if (typeof config.viewer.toolbarCta2Border !== 'undefined') {
        $('#sp-cta2').css('border', config.viewer.toolbarCta2Border);
        
        if (typeof config.viewer.toolbarCta2HoverBorder !== 'undefined') {
          $('#sp-cta2').hover(
            function() {
              $(this).css('border', config.viewer.toolbarCta2HoverBorder);
            },function() {
              $(this).css('border', config.viewer.toolbarCta2Border);
            }
          );
          
          $('#sp-cta2').click(function() {
            $(this).css('border', config.viewer.toolbarCta2Border);
          });
        }
      }
      
      if (typeof config.viewer.toolbarCta2Color !== 'undefined') {
        $('#sp-cta2').css('color', config.viewer.toolbarCta2Color);
        
        if (typeof config.viewer.toolbarCta2HoverColor !== 'undefined') {
          $('#sp-cta2').hover(
            function() {
              $(this).css('color', config.viewer.toolbarCta2HoverColor);
            },function() {
              $(this).css('color', config.viewer.toolbarCta2Color);
            }
          );
          
          $('#sp-cta2').click(function() {
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
    if (true == config.viewer.isCta3Enabled) {
      $('#sp-cta-secondary-toolbar-separator').show();
      
      if (typeof config.viewer.cta3CollapseMaxWidth !== 'undefined') {
        $('body').append(
            '<style>@media all and (max-width: ' + config.viewer.cta3CollapseMaxWidth
            + ') {#sp-cta3 {display: none;}}</style>');
      }
      
      if (typeof config.viewer.toolbarCta3Background !== 'undefined') {
        $('#sp-cta3').css('background', config.viewer.toolbarCta3Background);
        
        if (typeof config.viewer.toolbarCta3HoverBackground !== 'undefined') {
          $('#sp-cta3').hover(
            function() {
              $(this).css('background', config.viewer.toolbarCta3HoverBackground);
            },function() {
              $(this).css('background', config.viewer.toolbarCta3Background);
            }
          );
          
          $('#sp-cta3').click(function() {
            $(this).css('background', config.viewer.toolbarCta3Background);
          });
        }
      }
      
      if (typeof config.viewer.toolbarCta3Border !== 'undefined') {
        $('#sp-cta3').css('border', config.viewer.toolbarCta3Border);
        
        if (typeof config.viewer.toolbarCta3HoverBorder !== 'undefined') {
          $('#sp-cta3').hover(
            function() {
              $(this).css('border', config.viewer.toolbarCta3HoverBorder);
            },function() {
              $(this).css('border', config.viewer.toolbarCta3Border);
            }
          );
          
          $('#sp-cta3').click(function() {
            $(this).css('border', config.viewer.toolbarCta3Border);
          });
        }
      }
      
      if (typeof config.viewer.toolbarCta3Color !== 'undefined') {
        $('#sp-cta3').css('color', config.viewer.toolbarCta3Color);
        
        if (typeof config.viewer.toolbarCta3HoverColor !== 'undefined') {
          $('#sp-cta3').hover(
            function() {
              $(this).css('color', config.viewer.toolbarCta3HoverColor);
            },function() {
              $(this).css('color', config.viewer.toolbarCta3Color);
            }
          );
          
          $('#sp-cta3').click(function() {
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
          '<style>@media all and (max-width: ' + config.viewer.toolbarLogoCollapseMaxWidth
          + ') {.sp-toolbar-logo {display: none;}}</style>');
    }
    
    
    /* Chat Settings */
    if (true == config.viewer.isChatEnabled) {
      if (true == config.viewer.isChatOpen && sp.viewer.breakPoint < $(window).width()) {
        $('.sp-chat').css('display', 'block');
      }     
      $('#sp-live-chat').css('visibility', 'visible');
    }
    
    $('#sp-live-chat header').on('click', function () {
      // If chat is visible, it means when clicking we will shut it, so the max-width
      // should be set for when it will be closed, and vice versa.
      if ($('.sp-chat').is(':visible')) {
        $('#sp-live-chat').animate({
          'width': '40%'
        }, function () {
          $('#sp-live-chat h4').css('width', '100%');
        });
      } else {
        $('#sp-live-chat h4').css('max-width', '100%');
        $('#sp-live-chat').css('width', 'auto');
      }
    });
    
    
    /* Widget */

    /**
     * Get widget settings.
     */
    $.getJSON(
        '../../ManagementServlet',
        {
          action: 'getWidgetsSettings',
          fileLinkHash: sp.viewer.linkHash
        },
        function(data) {
          var widgets = {};
          
          $.each(data.widgetsSettings, function(index, data) {
            var widgetData = JSON.parse(data.widgetData);
            
            switch(widgetData.data.widgetId) {
	            case 1:
	              displayVideoWidget(widgetData.data);
	              break;
	              
	            case 2:
	            case 3:
	              displayCalendlyAndQuestionWidget(widgetData.data);
	              break;
	          }
          });
          
          /**
           * This function creates an object out of the video widget data:
           * widget.widget1.pageX = videoData.
           * 
           * @param {object} videoWidgetData - Object containing the video widget data.
           * 
           * @example
           *  videoData = {
           * 			videoSource: {string},
           * 	     videoTitle: {string},
           *   videoPageStart: {number}, 
           *   isYoutubeVideo: {boolean}
           * }
           */
          function displayVideoWidget(videoWidgetData) {
            if (typeof videoWidgetData !== 'undefined') {
              var widgetId = 'widget' + videoWidgetData.widgetId;
              widgets[widgetId] = {
              		isEnabled: videoWidgetData.isEnabled
              }
              
              $.each(videoWidgetData.items, function(index, videoData) {
                var pageStart = 'page' + videoData.videoPageStart.toString();
              	widgets[widgetId][pageStart] = videoData;
              });
            }
          }
          
          /**
           * This function creates an object e.g.
           * widget.widget2.items = widgetItems;
           * 
           * widgetItems will contain key:value pairs relating to the widget 
           * e.g. the Calendly widget will have {buttonText: {string}} referring to the
           * text that will appear in the widget button in the viewer.
           * 
           * @param {object} widgetData - An object containing widget data
           * 
           */
          function displayCalendlyAndQuestionWidget(widgetData) {
            if (typeof widgetData !== 'undefined') {
              var widgetId = 'widget' + widgetData.widgetId;
              widgets[widgetId] = {
              	isEnabled: widgetData.isEnabled,
              	items: widgetData.items
              }
            }
          }

          implementWidgets(widgets);
        }
    );
    
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
      
      $.each(requiredSettings, function(index, requiredSetting) {
        if (typeof widgetSettings[requiredSetting] == 'undefined') {
          isWidgetSettingsDefined = false;
          return false;
        }
      });
      
      return isWidgetSettingsDefined;
    }
    
    /**
     * This is an implementation of the widgets platform,
     * taking its settings from the DB. 
     * 
     * @param {object} widgets - Array containing widget data formed as objects.
     */
    function implementWidgets(widgets) {
      
      var widget1RequiredSettings = ['videoPageStart', 'videoSource', 'videoTitle', 'isYouTubeVideo'];
      var widget2RequiredSettings = ['userName'];
      var widget3RequiredSettings = ['buttonText'];

      if (typeof widgets.widget1 !== 'undefined' && widgets.widget1.isEnabled) {
        var isValidVideoWidget = true;
        $.each(widgets.widget1, function(key, value) {
        	if ('page' === key.substring(0, 4)) {
        		if (! isWidgetSettingsDefined(value, widget1RequiredSettings)) {
	          	isValidVideoWidget = false;
	            return false;
	          }
        	}
        });
        
        if (isValidVideoWidget) {
        	implementWidget1(widgets.widget1);
        }
      }

      if (typeof widgets.widget2 !== 'undefined' && widgets.widget2.isEnabled) {
        if (isWidgetSettingsDefined(widgets.widget2.items[0], widget2RequiredSettings)) {
           implementWidget2(widgets.widget2.items[0]);
        }
      }
      
      if (typeof widgets.widget3 !== 'undefined' && widgets.widget3.isEnabled) {
        if (isWidgetSettingsDefined(widgets.widget3.items[0], widget3RequiredSettings)) {
           implementWidget3(widgets.widget3.items[0]);
        }
      }
      
      
      /**
       * 
       */
      function implementWidget1(widget) {
        
        // Widget 1 - YouTube widget. 
        $('body').append(
            '<div class="sp-demo-video sp-demo-video1">' +
              '<div class="sp-demo-video-title-container">' +
                '<span class="sp-demo-video-title__span"></span><i class="fa fa-chevron-up"></i><hr>' +
              '</div>' +
            '</div>');
        
        sp.viewer.widget.videoWidget = {
            isYouTubePlayerReady: false,
        };
        
        widget.lastVideoSource = '';
        widget.lastVideoTitle = '';
        widget.isFileLoaded = false;
        widget.lastViewedPage = 0;
        widget.currentVideoIsYoutube = false;
        
        /**
         * If any of the videos are YouTube videos, load the YouTube iFrame API.
         */
        function loadYouTubeAPI() {
          for (var page = 1; page <= PDFViewerApplication.pagesCount; page++) {
            if (typeof widget['page' + page] !== 'undefined' && widget['page' + page].isYouTubeVideo) {
              $.getScript("https://www.youtube.com/iframe_api");
              $('.sp-demo-video').append('<div id="sp-player"></div>');
            }
          }
        }
        
        /**
         * Set video widget source.
         * 
         * If it is a YouTube video, then append the #sp-player to .sp-demo-video which will become an iframe,
         * otherwise, append an iframe to the #sp-player, and load the video through the API function.
         * 
         * @param {string} videoSource - The video source.
         * @param {number} page - The current page number.
         * 
         * @var sp.viewer.widget.videoWidget.youTubeIframeSrc - The ID of the YouTube link. 
         */
        function setVideoSource(videoSource, page) {
          if (widget['page' + page].isYouTubeVideo) {
            sp.viewer.widget.videoWidget.youTubeIframeSrc = videoSource.split('/')[4];
            if (sp.viewer.widget.videoWidget.isYouTubePlayerReady) {
              player.cueVideoById(sp.viewer.widget.videoWidget.youTubeIframeSrc);
            }
            widget.currentVideoIsYoutube = true;
            if ($('#sp-not-youtube-player').length > 0) {
              $('#sp-not-youtube-player').remove(); 
            }
            $('#sp-player').show();
          } else {
            if ($('#sp-not-youtube-player').length < 1) {
              $('.sp-demo-video').append(
                  '<iframe src="' + videoSource + '" id="sp-not-youtube-player" frameborder="0" scrolling="no"></iframe>'
              );
              $('#sp-not-youtube-player').show();
            } else {
              $('#sp-not-youtube-player')
                .show()
                .attr('src', videoSource);
            }
            
            $('#sp-player').hide();
            widget.currentVideoIsYoutube = false;
          }
          widget.lastVideoSource = videoSource;
        };
        
        
        /**
         * PDF.js event listeners - pagesloaded, pageschange.
         * 
         * This function checks if the current page the user is on requires a new video source
         * or a new video title. This is checked against the video widget object, which contains 
         * the {videoPageStart: {string}} object e.g. page1.
         * 
         * It also checks when to automatically open the video widget.
         */
        var isYouTubeApiCalled = false;
        $(document).on('pagesloaded pagechange', function(event) {
          if (! isYouTubeApiCalled) {
            loadYouTubeAPI();
            isYouTubeApiCalled = true;
          }
          if ('pagesloaded' == event.type) {
            widget.isFileLoaded = true;
          }
          if (widget.isFileLoaded && widget.lastViewedPage != PDFViewerApplication.page) {
          	for (var page = PDFViewerApplication.page; page >= 1; page--) {
        			if (typeof widget['page' + page] !== 'undefined') {
								var videoSource = widget['page' + page].videoSource;
								var videoTitle = widget['page' + page].videoTitle;
								
								if (videoSource !== widget.lastVideoSource) {
								  setVideoSource(videoSource, page);
								  widget.lastVideoSource = videoSource;
								}
								
								if (videoTitle !== widget.lastVideoTitle) {
									$('.sp-demo-video1 span').text(videoTitle);
								  widget.lastVideoTitle = videoTitle;
								}
								
								if ($('.sp-demo-video').is(':hidden')) {
								  $('.sp-demo-video').show();
								}
                
								// If a page with a video is found, break the loop. 
								break;
             } else if (1 === page) {

               // Set video from page 1 to the first available video.
               var videoPages = [];
               $.each(widget, function(key, value) {
                 if ('page' === key.substring(0, 4)) {
                   videoPages.push(parseInt(key.substring(4)));
                 }
               });
                 
               videoPages.sort(function(a, b) {
                 return a - b;
               });
               
               var videoPageStart = videoPages.pop();
               var videoSource = widget['page' + videoPageStart].videoSource;
               var videoTitle = widget['page' + videoPageStart].videoTitle;
               
               if (videoSource !== widget.lastVideoSource) {
                 setVideoSource(videoSource, videoPageStart);
                 widget.lastVideoSource = videoSource;
               }
               
               if (videoTitle !== widget.lastVideoTitle) {
                 $('.sp-demo-video1 span').text(videoTitle);
                 widget.lastVideoTitle = videoTitle;
               }
		    		 }
          	}

            $.each(widget, function(key, value) {
            	if ('page' === key.substring(0, 4)) {
          		  if (parseInt(key.substring(4)) === PDFViewerApplication.page) {

                  // Hide/Show Video Widget.
                  sp.viewer.widget.videoWidget.showVideo = function(video) {
                    $(video).show(300, 'swing', function() {
                      $('.sp-demo-video').css('min-width', '300px');
                      keepAspectRatio();
                    });
                  };
                
                  if (widget.currentVideoIsYoutube) {
                    sp.viewer.widget.videoWidget.showVideo('.sp-demo-video #sp-player');
                  } else {
                    $('#sp-not-youtube-player').show();
                    $('.sp-demo-video').css('min-width', '300px');
                    keepAspectRatio();
                  }
                  $('.sp-demo-video1 .fa').removeClass('fa-chevron-up').addClass('fa-chevron-down');
                  $('.sp-demo-video1').removeClass('sp-video1-clicked');
                  return false;
                 
                } else if (! $('.sp-demo-video1').hasClass('sp-video1-clicked')) {
                  $('.sp-demo-video').css('min-width', '175px');
                  $('.sp-demo-video1 .fa').removeClass('fa-chevron-down').addClass('fa-chevron-up');
                  
                  if (widget.currentVideoIsYoutube) {
                    $('.sp-demo-video #sp-player').hide(300, 'swing');
                  } else {
                    $('#sp-not-youtube-player').hide(); 
                  }
                }
            	}
            });
            
            widget.lastViewedPage = PDFViewerApplication.page;
          }
        });

        /**
         * Depending on whether the video is open or not, set a different max and min width on the video.
         * The video should always be a certain minimum height when open, but when closed the tab can be
         * smalller.
         * 
         * @var {string} video - The jQuery selector for either a YouTube video or non-YouTube video. 
         */
        $('.sp-demo-video1').click(function(event) {
          var video = '';
          if ($(event.currentTarget).find('#sp-not-youtube-player').length > 0) {              
            video = '.sp-demo-video1 #sp-not-youtube-player';
          } else {
            video = '.sp-demo-video #sp-player';
          }
          
          $(video).slideToggle('swing', function () {
            if ($('.sp-demo-video iframe').is(':visible')) {
              $('.sp-demo-video-title__span')
                .css({'padding-right': '0', 'max-width': '80%'});
              $('.sp-demo-video1').css('width', '34%');
              $('.sp-demo-video1').css('min-width', '300px');
              
              sendVideoTabClickedEvent(sp.viewer.paramValue.videoTabOpened);
            } else {
              $('.sp-demo-video-title__span')
                .css({'padding-right': '20px', 'max-width': '80%'});
              $('.sp-demo-video1').css('width', '34%');
              $('.sp-demo-video1').css('min-width', '175px');
              
              sendVideoTabClickedEvent(sp.viewer.paramValue.videoTabClosed);
            }
            
            $('.sp-demo-video1').addClass('sp-video1-clicked');
            keepAspectRatio(); // Ensures the window remains 16:9
          });

          $('.sp-demo-video1').addClass('sp-video1-clicked');
          $('.sp-demo-video1 .fa').toggleClass('fa-chevron-down fa-chevron-up');
        });
      }
      
      function implementWidget2(widget) {
        
        // Widget 2 - Calendly widget
        if (0 == $('.sp-right-side-widgets').length) {
          $('body').append('<div class="sp-right-side-widgets"></div>');
        }
        
        $('.sp-right-side-widgets').append('<button class="sp-widget-button" id="sp-widget2"></button>');
        
        if ($('.sp-widget-button').length > 1) {
          $('#sp-widget2').css('margin-top', '20px');
        }
        
        $('#sp-widget2').html('<i class="fa fa-calendar"></i><div>' + widget.buttonText +'</div>');
        $('#sp-widget2').click(function() {
          swal({
            html: true,
            showCancelButton: true,
            showConfirmButton: false,
            text: '<iframe src="../../assets/viewer/widget/calendly.html?user=' + widget.userName + '" height="420" frameborder="0"></iframe>',
            title: widget.buttonText,
          });
          
          /**
           * Send Calendly event.
           * 
           * param_1_varchar - The text on the Calendly button.
           */
          sp.viewer.setCustomerEvent({
            eventName: sp.viewer.eventName.viewerWidgetCalendlyClicked,
            linkHash: sp.viewer.linkHash,
            sessionId: sessionid,
            param_1_varchar: $(this).text()
          });
        });
      }
      
      function implementWidget3(widget) {
        
        // Widget 3 - Ask a question widget
        if (0 == $('.sp-right-side-widgets').length) {
          $('body').append('<div class="sp-right-side-widgets"></div>');
        }
        
        $('.sp-right-side-widgets').append('<button class="sp-widget-button" id="sp-widget3"></button>');

        if ($('.sp-widget-button').length > 1) {
          $('#sp-widget3').css('margin-top', '20px');
        }
        
        $('#sp-widget3').html('<i class="fa fa-comment"></i><div>' + widget.buttonText + '</div>');
        $('#sp-widget3').click(function() {
          swal({
            closeOnConfirm: false,
            html: true,
            showCancelButton: true,
            showConfirmButton: true,
            text: '<form><label for="sp-widget3-message">Enter your message:</label><textarea id="sp-widget3-message" rows="5" autofocus></textarea><label for="sp-widget3-email" class="sp-widget3-label">Enter your email address:</label><input type="text" id="sp-widget3-email" style="display: block; margin-top: 0;"></form>',
            title: widget.buttonText,
          }, function(isConfirm) {
            if (isConfirm) {
              /**
               * Send Ask a Question event.
               * 
               * param_1_varchar - The text on the Ask a Question button.
               * param_2_varchar - The message in the widget form.
               * param_3_varchar - The email address to reply to in the widget form.
               */
              sp.viewer.setCustomerEvent({
                eventName: sp.viewer.eventName.viewerWidgetAskQuestion,
                linkHash: sp.viewer.linkHash,
                sessionId: sessionid,
                param_1_varchar: $('#sp-widget3').text(),
                param_2_varchar: $('#sp-widget3-message').val(),
                param_3_varchar: $('#sp-widget3-email').val()
              });
              
              swal("Succes!", "Your message has been sent.", "success");
            }
          });
        });
      }
    }
  });
}

$(window).resize(function () {
  keepAspectRatio();
});

function keepAspectRatio () {
  var videoWidth = $('.sp-demo-video iframe').width();
  var videoHeight = (videoWidth / (16 / 9));
  
  $('.sp-demo-video iframe').height(videoHeight);
}

/**
 * Log event when video tab is clicked.
 * 
 * @param {string} videoTabState - A value representing whether the video 
 * widget container is opened or closed.
 */
function sendVideoTabClickedEvent(videoTabState) {
  sp.viewer.setCustomerEvent({
    eventName: sp.viewer.eventName.viewerWidgetVideoTabClicked,
    linkHash: sp.viewer.linkHash,
    sessionId: sessionid,
    param_1_varchar: $('.sp-demo-video iframe').attr('src'),
    param_2_varchar: $('.sp-demo-video-title__span').text(),
    param_3_varchar: videoTabState
  });
}

/**
 *  YouTube iFrame API
 *  @see https://developers.google.com/youtube/iframe_api_reference
 */
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('sp-player', {
    height: '168.75',
    width: '300',
    events: {
      'onStateChange': onPlayerStateChange,
      'onReady': onPlayerReady
    }
  });
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
  var data = {
    linkHash: sp.viewer.linkHash, 
    sessionId: sessionid,
    param_1_varchar: player.getVideoUrl(),
    param_2_varchar: $('.sp-demo-video-title__span').text(),
  };

  switch (playerState) {
    case 1:
      
      // YouTube video played.
      data.eventName = sp.viewer.eventName.viewerWidgetVideoYouTubePlayed;
      sp.viewer.setCustomerEvent(data);
      break;
    
    case 2:
      
      // YouTube video paused.
      data.eventName = sp.viewer.eventName.viewerWidgetVideoYouTubePaused;
      sp.viewer.setCustomerEvent(data);
      break;
  };
}

function onPlayerReady() {
  sp.viewer.widget.videoWidget.isYouTubePlayerReady = true;
  player.cueVideoById(sp.viewer.widget.videoWidget.youTubeIframeSrc);
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
