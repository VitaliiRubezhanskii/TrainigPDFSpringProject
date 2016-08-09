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
    viewerWidgetAskQuestion: 'VIEWER_WIDGET_ASK_QUESTION',
    viewerWidgetLikeClicked: 'VIEWER_WIDGET_LIKE_CLICKED'
  },
  isPagesLoaded: false,
  paramValue: {
  	videoTabOpened: 'VIEWER_WIDGET_VIDEO_TAB_OPENED',
  	videoTabClosed: 'VIEWER_WIDGET_VIDEO_TAB_CLOSED'
  },
  lastViewedPage: 0,
  linkHash: getParameterByName('f'),
  widgets: {
    widget1: {
      currentVideoPlayerCssSelector: '',
      isVideoPlayerReady: false,
      isVideoCollapseOverride: false,
      videoPlayersReadyStatus: {
        defaultVideo: false,
        youTube: false
      },
      lastVideoSource: ''
    },
    widget4: {
    	likeCount: 0
    }
  },
  
  
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
    
    
    /* Widget Mechanism */
    $.getJSON(
        '../../ManagementServlet',
        {
          action: 'getWidgetsSettings',
          fileLinkHash: sp.viewer.linkHash
        },
        function(data) {
          
          // Prepare the widgets data for implimentation.
          var widgets = {};
          
          $.each(data.widgetsSettings, function(index, data) {
            var widgetData = JSON.parse(data.widgetData).data;
            
            if (typeof widgetData !== 'undefined' && widgetData.isEnabled) { 
              var widgetId = widgetData.widgetId;
              
              switch(widgetId) {
  	            case 1:
  	              widgetData.items = OrderWidgetDataItemsByPage(widgetData.items);
  	              break;
  	          }
              
              widgets['widget' + widgetId.toString()] = widgetData;
            }
          });
          
          implementWidgets(widgets);
          
          
          /**
           * Sort widget data by page.
           * 
           * @return Sorted widget data.
           */
          function OrderWidgetDataItemsByPage(items) {
            var itemsByPage = {};
            var itemsPage = [];
            
            $.each(items, function(index, item) {
              var page = item.videoPageStart;
              
              itemsByPage['page' + page.toString()] = item;
              itemsPage.push(page);
            });
            
            // Order the items by page.
            itemsPage.sort(function(a, b) {
              return a - b;
            });
            
            var orderedItemsByPage = [];
            $.each(itemsPage, function(index, page) {
              orderedItemsByPage.push(itemsByPage['page' + page.toString()]);
            });
            
            return orderedItemsByPage;
          }
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
     * Validate and implement widgets into the viewer.
     * 
     * @param {object} widgets - Array containing widget data formed as objects.
     */
    function implementWidgets(widgets) {
      
      /* Validate Widget 1 */
      var widget1RequiredSettings = ['videoPageStart', 'videoSource', 'videoTitle', 'isYouTubeVideo'];
      
      if (typeof widgets.widget1 !== 'undefined') {
        var isWidget1Valid = true;
        
        $.each(widgets.widget1.items, function(index, item) {
          if (! isWidgetSettingsDefined(item, widget1RequiredSettings)) {
            isWidget1Valid = false;
            return false;
          }
        });
        
        if (isWidget1Valid) {
          implementWidget1(widgets.widget1.items);
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
      
      
      /* Implement Widget 1 */
      function implementWidget1(videos) {
        
        // Create widget structure. 
        $('body').append(
            '<div id="sp-widget1">' +
                '<div id="sp-widget1-tab"><i class="fa fa-video-camera"></i><div class="sp-widget-font-fmaily">Loading...</div></div><i id="sp-widget1-fa-chevron" class="fa fa-chevron-up"></i>' +
                '<div id="sp-widget1-video-container"></div>' +
            '</div>');
        
        /* Load Video Players API */
        // Default video.
        $('#sp-widget1-video-container').append(
            '<iframe id="sp-widget1-default-player" frameborder="0" scrolling="no"></iframe>'
        );
        sp.viewer.widgets.widget1.videoPlayersReadyStatus['defaultVideo'] = true;
        
        // YouTube video.
        $('#sp-widget1-video-container').append('<div id="sp-widget1-youtube-player"></div>');
        $.getScript('https://www.youtube.com/iframe_api');
        
        
        /**
         * Load video mechanism.
         */
        $(document).on('pagesloaded pagechange spYouTubePlayerReady', function(event) {
          if ('pagesloaded' === event.type) {
            sp.viewer.isPagesLoaded = true;
          }
          
          // Check if all applicable video players are ready.
          if (! sp.viewer.widgets.widget1.isVideoPlayerReady) {
            var isVideoPlayerReady = true;

            $.each(sp.viewer.widgets.widget1.videoPlayersReadyStatus, function(key, isReady) {
              if (! isReady) {
                isVideoPlayerReady = false;
                return false;
              }
            });
            
            sp.viewer.widgets.widget1.isVideoPlayerReady = isVideoPlayerReady;
          }
          
          // Format videos array to an object for ease of access.
          var videosByPage = {};
          $.each(videos, function(index, video) {
            videosByPage['page' + video.videoPageStart.toString()] = video;
          });
          
          // Verification before setting a video.
          if (sp.viewer.isPagesLoaded
              && sp.viewer.widgets.widget1.isVideoPlayerReady
              && PDFViewerApplication.page !== sp.viewer.lastViewedPage) {
            
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
          
            sp.viewer.lastViewedPage = PDFViewerApplication.page;
          }
          
          
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
              spYouTubePlayer.pauseVideo();
              $('#sp-widget1-default-player').removeAttr('src');
              
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
                $('#sp-widget1-default-player').attr('src', videoSource)
                    
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
            if (! sp.viewer.widgets.widget1.isVideoCollapseOverride) {
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
          };  
        });
        
        // Video widget tab click mechanism.
        $('#sp-widget1').click(function(event) {          
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
      };
      
      function implementWidget2(widget) {
        
        // Widget 2 - Calendly widget
        if (0 == $('.sp-right-side-widgets').length) {
          $('body').append('<div class="sp-right-side-widgets"></div>');
        }
        
        $('.sp-right-side-widgets').append('<button class="sp-widget-button sp-widget-font-fmaily" id="sp-widget2"></button>');
        
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
        
        $('.sp-right-side-widgets').append('<button class="sp-widget-button sp-widget-font-fmaily" id="sp-widget3"></button>');

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
            text: '<form class="sp-widget-font-fmaily"><label for="sp-widget3-message" class="sp-widget3-label">Enter your message:</label><textarea id="sp-widget3-message" rows="5" autofocus></textarea><label for="sp-widget3-email" class="sp-widget3-label">Enter your email address:</label><input type="text" id="sp-widget3-email" style="display: block; margin-top: 0;"></form>',
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
      
      function implementWidget4(widget) {
	      	
      	// Widget 4 - Like button widget.
        $('body').append('<div class="sp-like-button-widget"></div>');
              
        $('.sp-like-button-widget').append(
        	'<button class="sp-like-btn sp-hidden">' +	
        	    '<i id="sp-thumbs-up__i" class="fa fa-thumbs-o-up" aria-hidden="true"></i>' +	  
        	    '<p id="sp-count-likes__p"></p>' +
        	'</button>'
        );
        
        getLikeCount();
        
        
        /**
         * Get the number of likes a document has received.
         */
        function getLikeCount() {
        	$.getJSON(
      				'../../ManagementServlet',
      				{
      					action: 'getViewerWidgetMetrics',
                fileLinkHash: sp.viewer.linkHash,
                wigdetId: 4
      				},
      				function(data) {
      					sp.viewer.widgets.widget4.likeCount = parseInt(data.widgetMetrics.metrics[0]);
      					if (widget.isCounterEnabled) {
      						formatDisplayLikeCount(sp.viewer.widgets.widget4.likeCount);
      					}
      					
      					isLikeButtonClickedSession();
      				}
      		)
      	}
      	
      	
        /**
         * Check if the Like Button has been clicked this session.
         * 
         * If it has been clicked, add the class 'sp-like-btn-clicked', and remove
         * the 'click' event listener.
         */
        function isLikeButtonClickedSession() {
        	$.getJSON(
        			'../../ManagementServlet',
        			{
        				action: 'isLikeButtonClicked',
        				sessionid: sessionid
        			},
        			function(data) {
        				if (data.isLikeButtonClicked) {
        					$('.sp-like-btn').addClass('sp-like-btn-clicked');
        					$('#sp-thumbs-up__i, #sp-count-likes__p').css('color', '#fff');
        				} else {
        					likeButtonClickEventListener();
        				}
        				
        				$('.sp-like-btn').removeClass('sp-hidden');
        			}
        	)
        }
        
        
        /**
         * Send an event to customer_events table when the customer clicks the
         * Like Button.
         * 
         * The 'one' click allows them to click only once.
         * 
         * Update the like counter if it is enabled.
         */
        function likeButtonClickEventListener() {
        	$('.sp-like-btn').one('click', function() {
         	 sp.viewer.setCustomerEvent({
         		 eventName: sp.viewer.eventName.viewerWidgetLikeClicked,
             linkHash: sp.viewer.linkHash,
             param1int: PDFViewerApplication.page,
             sessionId: sessionid
           });
         	 
         	 if (widget.isCounterEnabled) {
         		 sp.viewer.widgets.widget4.likeCount++;
         		 formatDisplayLikeCount(sp.viewer.widgets.widget4.likeCount)
         	 }
         	 
         	 // Change the colour of the button.
         	 $('.sp-like-btn').addClass('sp-like-btn-clicked');
 	         $('#sp-thumbs-up__i, #sp-count-likes__p').css('color', '#fff');
         });
        }
        
        
        /**
         * Format the like count.
         * 
         * In the switch case, format the result before it appears in the Viewer.
         * e.g. 1,200 likes will appear as 1.2k.
         * 			15,700 likes will appear as 15k.
         * 			More than 99,999 likes will appear as 99k+.
         * 
         * @param likeCount - The like count.
         */
        function formatDisplayLikeCount(likeCount) {
        	var likeCountString = likeCount.toString();
        	var likeCountLength = likeCountString.length;
        	var likeCountToDisplay = '';
        	
        	switch(likeCountLength) {
  					case 1:
  					case 2:
  					case 3:
  						if (0 === likeCount) {
  							likeCountToDisplay = '';
  						} else {
  							likeCountToDisplay = likeCountString;
  						}
  					  
  						if (3 === likeCountLength) {
  							$('#sp-count-likes__p').addClass('sp-widget4-count-likes-4-digit');
  						}
  						break;
  						
  					case 4:
  						if (likeCountString.charAt(1) === '0') {
  							likeCountToDisplay = likeCountString.slice(0, 1) + 'k';
  						} else {
  							likeCountToDisplay = likeCountString.slice(0, 1) + '.' + likeCountString.slice(1, 2) + 'k';
  							$('#sp-count-likes__p').addClass('sp-widget4-count-likes-4-digit');
  						}
  						break;
  						
  					case 5:
  						likeCountToDisplay = likeCountString.slice(0, 2) + 'k';
  						$('#sp-count-likes__p')
  								.removeClass('sp-widget4-count-likes-4-digit')
  								.addClass('sp-widget4-count-likes-5-digit');
  						break;
  						
  					default:
  						likeCountToDisplay = '99k+';
  					$('#sp-count-likes__p')
  								.removeClass('sp-widget4-count-likes-5-digit')
  								.addClass('sp-widget4-count-likes-6-digit');
  						break;
					}
					
        	$('#sp-count-likes__p').text(likeCountToDisplay);
        }
      }
    }
  });
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
  sp.viewer.widgets.widget1.videoPlayersReadyStatus['youTube'] = true;
  $(document).trigger('spYouTubePlayerReady')
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
  
  var data = {
    linkHash: sp.viewer.linkHash, 
    sessionId: sessionid,
    param_1_varchar: spYouTubePlayer.getVideoUrl(),
    param_2_varchar: $('#sp-widget1-tab div').text(),
  };

  switch (playerState) {
    // YouTube video played.
    case 1:
      data.eventName = sp.viewer.eventName.viewerWidgetVideoYouTubePlayed;
      sp.viewer.setCustomerEvent(data);
      break;
    
    // YouTube video paused.
    case 2:
      data.eventName = sp.viewer.eventName.viewerWidgetVideoYouTubePaused;
      sp.viewer.setCustomerEvent(data);
      break;
  };
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
