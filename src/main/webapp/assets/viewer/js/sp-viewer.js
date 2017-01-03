/**
 * Disable cache on AJAX requests.
 */
$.ajaxSetup({
	cache: false
});


/**
 * Splash page.
 */
$(document).on('pagesloaded', function() {
	$('#sp-splash-logo-container').addClass('sp--fadeout');
	$('#viewer').addClass('sp-viewer--fadein');
	$(document).trigger('splashPageHidden');
});


/**
 * Set document links to open in a new tab.
 */
$(document).on('textlayerrendered', function() {
  var aArray = document.getElementsByTagName('a');
  for (var i = 0; i < aArray.length; i++) {
    var a = aArray[i];
    if (null === a.getAttribute('target')) {
      a.setAttribute('target', '_blank');
    }
  };
});


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
      
  var poweredBySlidePiper = 'Powered by <span class="sp-powered-by"><a target="_blank" href="https://www.slidepiper.com">SlidePiper</a></span>';
  var termsAndPrivacy = '<a href="https://www.slidepiper.com/tou.html" target="_blank">Terms</a> · <a href="https://www.slidepiper.com/privacy.html" target="_blank">Privacy</a>';
  
  $('body').append('<div class="sp--direction-ltr" id="sp-terms-privacy">' + poweredBySlidePiper + ' · ' + termsAndPrivacy + '</div>');
  $('#secondaryToolbarButtonContainer').append(
     '<div class="horizontalToolbarSeparator"></div>' +
     '<div id="sp-terms-privacy-secondary-toolbar">' + poweredBySlidePiper + '<br>' + termsAndPrivacy + '</div>');
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
    viewerWidgetFormButtonClicked: 'VIEWER_WIDGET_FORM__BUTTON_CLICKED',
    viewerWidgetFormConfirmClicked: 'VIEWER_WIDGET_FORM_CONFIRM_CLCKED',
    viewerWidgetFormCancelClicked: 'VIEWER_WIDGET_FORM_CANCEL_CLICKED',
    viewerWidgetLinkClicked: 'VIEWER_WIDGET_LINK_CLICKED',
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
    widget9: {
      isReady: false,
      isValidated: false,
      lastViewedPage: 0
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
      
      // Send page number of event.
      if (typeof PDFViewerApplication !== 'undefined') {
        data.data.param1int = PDFViewerApplication.page;
      } else {
        data.data.param1int = 0;
      }
      
      $.post('../../ManagementServlet', JSON.stringify(data));
    }
  }
};

if ('' != sp.viewer.linkHash) {
  $.getJSON('../../config-viewer', {linkHash: sp.viewer.linkHash}, function(config) {
    
    // Set document title.
    if (typeof config.viewer.documentTitle !== 'undefined'
        && null !== config.viewer.documentTitle
        && '' !== config.viewer.documentTitle) {
      document.title =  config.viewer.documentTitle;
    } else {
      document.title = 'SlidePiper';
    }
    
    // Load file.
    if (typeof config.viewer.file.documentUrl !== 'undefined'
        && null !== config.viewer.file.documentUrl
        && '' !== config.viewer.file.documentUrl) {
      
      PDFViewerApplication.open(encodeURI(config.viewer.file.documentUrl));
    } else {
      PDFViewerApplication.open(config.appUrl + '/file/' + sp.viewer.linkHash
          + '?file-name=' + config.viewer.file.fileName);
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
    $(document).on('splashPageHidden', function() {
    	getWidgetsSettings();
    });
    
    function getWidgetsSettings() {
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
    	            case 6:
    	            case 9:
    	              widgetData.items = OrderWidgetDataItemsByPage(widgetId, widgetData.items);
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
            function OrderWidgetDataItemsByPage(widgetId, items) {
              var itemsByPage = {};
              var itemsPage = [];
              
              $.each(items, function(index, item) {
                
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
      
      /**
       * The following is a mechanisem for setting a widget item (out of a set of items)
       * everytime the user changes a page. 
       */
      $(document).on('pagechange spDefaultPlayerReady spYouTubePlayerReady spWidget6Ready spWidget9Ready', function(event) {
      	
        /* Widget 1 */
        if (sp.viewer.widgets.widget1.isValidated) {
          
          // Check if all applicable video players are ready.
          if (! sp.viewer.widgets.widget1.isVideoPlayersReady) {
            var isVideoPlayersReady = false;
            
            $.each(sp.viewer.widgets.widget1.videoPlayersIsReady, function(videoPlayer, isReady) {
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
        
        /* Widget 9 */
        if (sp.viewer.widgets.widget9.isValidated) {
          
          // Verification before setting a link.
          if (PDFViewerApplication.page !== sp.viewer.widgets.widget9.lastViewedPage
              && sp.viewer.widgets.widget9.isReady) {
            
            loadWidget9Link(widgets.widget9.items);
            sp.viewer.widgets.widget9.lastViewedPage = PDFViewerApplication.page;
          }
        }
      });
      
      
      /* Validate Widget 1 */
      var widget1RequiredSettings = ['videoPageStart', 'videoSource', 'videoTitle', 'isYouTubeVideo'];
      
      if (typeof widgets.widget1 !== 'undefined'
          && typeof widgets.widget1.items !== 'undefined'
          && widgets.widget1.items.length > 0) {
        var isWidget1Valid = false;
        
        $.each(widgets.widget1.items, function(index, item) {
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
          $.each(widgets.widget1.items, function(index, video) {
            if (video.isYouTubeVideo && -1 === videoPlayers.indexOf('youTube')) {
              videoPlayers.push('youTube');
            } else if (-1 === videoPlayers.indexOf('defaultPlayer')) {
              videoPlayers.push('defaultPlayer');
            }
          });
          
          $.each(videoPlayers, function(index, videoPlayer) {
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
        
        $.each(widgets.widget6.items, function(index, item) {
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
        $.each(widgets.widget5.items, function(index, item) {
          if (isWidgetSettingsDefined(item, widget5RequiredSettings)) {
            isWidget5Valid = true;
          } else {
            isWidget5Valid = false;
            return false;
          }
        });
          
        if (isWidget5Valid) {
          implementWidget5(widgets.widget5.items);
        }
      }
      
      /* Validate Widget 7 */
      var widget7RequiredSettings = ['formButtonTextLine1', 'formButtonIcon'];
      
      if (typeof widgets.widget7 !== 'undefined'
        && typeof widgets.widget7.items !== 'undefined'
        && widgets.widget7.items.length > 0) {
       var isWidget7Validated = false;
        
        $.each(widgets.widget7.items, function(index, item) {
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
        $.each(widgets.widget8.items, function(index, item) {
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
      
      /* Validate Widget 9 */
      var widget9RequiredSettings = ['buttonText1', 'link', 'pageFrom', 'pageTo'];
      
      if (typeof widgets.widget9 !== 'undefined'
        && typeof widgets.widget9.items !== 'undefined'
        && widgets.widget9.items.length > 0) {
       var isWidget9Validated = false;
        
        $.each(widgets.widget9.items, function(index, item) {
          if (isWidgetSettingsDefined(item, widget9RequiredSettings)) {
            isWidget9Validated = true;
          } else {
            isWidget9Validated = false;
            return false;
          }
        });
        
        if (isWidget9Validated) {
          sp.viewer.widgets.widget9.isValidated = true;
          implementWidget9(widgets.widget9);
        }
      }
      
      /* Implement Widget 1 */
      function implementWidget1(videos) {
        
        // Create widget structure. 
        $('body').append(
            '<div class="sp--direction-ltr" id="sp-widget1">' +
                '<div id="sp-widget1-tab"><i class="fa fa-video-camera"></i><div class="sp-widget-font-fmaily">Loading...</div></div><i id="sp-widget1-fa-chevron" class="fa fa-chevron-up"></i>' +
                '<div id="sp-widget1-video-container"></div>' +
            '</div>');
        
        
        /* Load Video Players */
        $.each(sp.viewer.widgets.widget1.videoPlayersIsReady, function(videoPlayer, isReady) {
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
        $.each(videos, function(index, video) {
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
        $('#sp-widget1').off('click').on('click', function(event) {          
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
      };
      
      
      function implementWidget2(widget) {
        
        // Widget 2 - Calendly widget
        if (0 == $('.sp-right-side-widgets').length) {
          $('body').append('<div class="sp-right-side-widgets"></div>');
        }
        
        $('.sp-right-side-widgets').append('<button class="sp-widget-button sp-widget-font-fmaily sp--direction-ltr" id="sp-widget2"></button>');
        
        if ($('.sp-right-side-widgets button, .sp-right-side-widgets div').length > 1) {
          $('#sp-widget2').css('margin-top', '20px');
        }
        
        $('#sp-widget2').html('<i class="fa fa-calendar"></i><div>' + widget.buttonText +'</div>');
        $('#sp-widget2').click(function() {
          swal({
            showCancelButton: true,
            showConfirmButton: false,
            html: '<iframe src="../../assets/viewer/widget/calendly.html?user=' + widget.userName + '" height="420" frameborder="0"></iframe>',
            title: widget.buttonText,
          }).done();
          
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
        if (typeof widget.formTitle !== 'undefined' &&  widget.formTitle !== '') {
        	formTitle = widget.formTitle;
        }
        
        var formMessage = '';
        if (typeof widget.formMessage !== 'undefined' &&  widget.formMessage !== '') {
          formMessage = '<div id="sp-widget-3-form-message">' + widget.formMessage + '</div>';
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
        if (! widget.isDefaultButtonColorEnabled) {
        	if (typeof widget.buttonColor !== 'undefined' && widget.buttonColor !== '') {
        		buttonColor = widget.buttonColor;
          }
        }
        
        sp.validate = sp.validate || {};
        sp.validate.errorMessage = 'You must provide a valid email address.';
        if (typeof widget.customEmailValidationErrorMessage !== 'undefined' && widget.customEmailValidationErrorMessage !== '') {
        	sp.validate.errorMessage = widget.customEmailValidationErrorMessage;
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
          
          $('.sp-right-side-widgets').append('<button class="sp-widget-button sp-widget-font-fmaily sp--direction-ltr" id="sp-widget3"></button>');
          
          if ($('.sp-right-side-widgets button, .sp-right-side-widgets div').length > 1) {
            $('#sp-widget3').css('margin-top', '20px');
          }
          
          $('#sp-widget3')
          	.css({
          		'background-color': buttonColor,
        			'color': config.viewer.toolbarCta1Color,
          	})
          	.html('<i class="fa fa-comment"></i><div>' + widget.buttonText + '</div>');
          
      		$('#sp-widget3').click(function() {
      			$.getScript('../../assets/viewer/js/plugins/validationjs/jquery.validate.min.js', function() {
            	$.getScript('../../assets/viewer/js/sp-viewer-validation.js', function() {
            		loadSwal();
            	});
            });
      		});
      	}
      	
      	function loadBottom() {
      		$.getScript('../../assets/viewer/js/plugins/validationjs/jquery.validate.min.js', function() {
          	$.getScript('../../assets/viewer/js/sp-viewer-validation.js', function() {
            	$('#sp-widget3__bottom-submit').click(function() {
            		validateBottomOfDocumentForm();
            	});
          	});
          });
      		
      		var bottomOfDocumentHtml = 
      			'<div class="sp-widget3__bottom-document-container">' +
      				'<div>' +
      				'<h4 id="sp-widget3__bottom-success-message">Thanks, your message has been submitted!</h4>' +
	      			'<form id="widget3-bottom-form" class="sp-widget-font-fmaily">' +
	      			'<h2 id="sp-widget-3-form-title">' + formTitle + '</h2>' +
	    				'<div class="form-group">' +
	      				'<label for="sp-widget3-bottom-message" class="sp-widget3-label">' + customMessageLabel + '</label>' +
	      				'<textarea id="sp-widget3-bottom-message" rows="5"></textarea>' +
	    				'</div>' +
	    				'<div class="form-group">' +
	    					'<label for="sp-widget3-bottom-email" class="sp-widget3-label"><span>* </span>' + customEmailLabel + '</label>' + 
	    					'<input type="text" name="widget3EmailBottom" id="sp-widget3-bottom-email">' +
	    					'<span class="form-control-feedback fa"></span>' + 
	    				'</div>' + 
	    				formMessage +
	    				'<div id="sp-widget3__bottom-document-submit-container" class="form-group">' +
	    					'<div id="sp-widget3__bottom-submit">' + confirmButtonText + '</div>' +
	    				'<div>' +
	    				'</form>' +
	    				'</div>' +
    				'</div>';
	    				
      		$('.page:last').after(bottomOfDocumentHtml);
      		setWidgetWidthRelativeToPageWidth();
      		
      		$(window).on('scalechange', function() {
      			setWidgetWidthRelativeToPageWidth();
      		});
      		
      		function setWidgetWidthRelativeToPageWidth() {
      			$('.sp-widget3__bottom-document-container').width($('.page').width());
      		}
      	}
      	
    		function validateBottomOfDocumentForm() {
    			if ($('#widget3-bottom-form').valid()) {
        		sp.viewer.setCustomerEvent({
              eventName: sp.viewer.eventName.viewerWidgetAskQuestion,
              linkHash: sp.viewer.linkHash,
              sessionId: sessionid,
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
              				'<label for="sp-widget3-message" class="sp-widget3-label">' + customMessageLabel + '</label>' +
              				'<textarea class="swal2-textarea" id="sp-widget3-message" rows="5" autofocus></textarea>' +
            				'</div>' +
            				'<div class="form-group">' +
            					'<label for="sp-widget3-email" class="sp-widget3-label"><span>* </span>' + customEmailLabel + '</label>' + 
            					'<input type="text" name="widget3Email" class="swal2-input" id="sp-widget3-email">' +
            					'<span class="form-control-feedback fa"></span>' + 
            				'</div>' + 
            				formMessage +
            			'</form>',
            title: formTitle,
            preConfirm: function() {
              return new Promise(function(resolve) {
                /**
                 * Send Ask a Question event.
                 * 
                 * param_1_varchar - The text on the Ask a Question button.
                 * param_2_varchar - The message in the widget form.
                 * param_3_varchar - The email address to reply to in the widget form.
                 */
              	
              	if ($('#widget3-form').valid()) {
              		sp.viewer.setCustomerEvent({
                    eventName: sp.viewer.eventName.viewerWidgetAskQuestion,
                    linkHash: sp.viewer.linkHash,
                    sessionId: sessionid,
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
          }).then(function() {
            swal("Success!", "Your message has been sent.", "success");
          }).done();
      	}
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
          );
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
          );
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
             sessionId: sessionid
           });
           
           if (widget.isCounterEnabled) {
             sp.viewer.widgets.widget4.likeCount++;
             formatDisplayLikeCount(sp.viewer.widgets.widget4.likeCount);
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
         *      15,700 likes will appear as 15k.
         *      More than 99,999 likes will appear as 99k+.
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
      
      
      function implementWidget5(widget) {
        
        // Widget 5 - Hopper Widget.
        $('body').append(
            '<div class="sp-widget5 sp--direction-ltr">' +
              '<div class="sp-widget5__extend-button">' +
                '<i class="fa fa-chevron-right" aria-hidden="true"></i>' +
              '</div>' +
            '</div>');
       
        $.each(widget, function(index, value) {
          $('.sp-widget5').append(
            '<div class="sp-widget5__hop" id="sp-widget5__hop-' + index + '" data-page-hop="' + value.hopperPage + '">' + 
              '<p class="sp-widget5__hop-text sp-widget5__hop--hidden">' + value.hopperText + '</p>' + 
              '<p class="sp-widget5__hop-page sp-widget5__hop--visible">' + value.hopperPage + '</p>' +
            '</div>'
          );
          
          // Set the hopper colour to be the same as CTA buttons.
          $('.sp-widget5__hop, .sp-widget5__extend-button').css({
            'background-color': config.viewer.toolbarButtonBackground,
            'color': config.viewer.toolbarCta1Color
          });
          
          // Send event.
          $('#sp-widget5__hop-' + index).on('click', function() {
            sp.viewer.setCustomerEvent({
                eventName: sp.viewer.eventName.viewerWidgetHopperClicked, 
                linkHash: sp.viewer.linkHash,
                sessionId: sessionid,
                param_1_varchar: $('#sp-widget5__hop-' + index + ' .sp-widget5__hop-text').text(),
                param_2_varchar: $('#sp-widget5__hop-' + index).attr('data-page-hop')
            });
            
            PDFViewerApplication.page = parseInt($('#sp-widget5__hop-' + index).attr('data-page-hop'));
          });
        });
        
        /**
         * Open and close the hoppers.
         * 
         * The '.sp-widget5__extend-button' button can only be seen under 600px width.
         */
        $('.sp-widget5__extend-button').on('click', function() {
          $('.sp-widget5__hop').toggleClass('sp-widget5__hop-extended');
          $('.sp-widget5__extend-button i').toggleClass('fa-chevron-right fa-chevron-left');
          
          // Toggle visibility of hopper page / hopper text.
          $('.sp-widget5__hop p').toggleClass('sp-widget5__hop--hidden sp-widget5__hop--visible');
        });
      }
      
      
      function implementWidget6(testimonials) {
        if (0 === $('.sp-right-side-widgets').length) {
          $('body').append('<div class="sp-right-side-widgets"></div>');
        }
        
        $('.sp-right-side-widgets').append(
            '<div id="sp-widget6__button">' +
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
        $.each(testimonials, function(index, testimonial) {
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
            personImageDiv = '<div id="sp-widget6__person-image" style="background-image: url(' + personImage + ');"></div>';
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
              .on('click', function() {
                swal({
                  customClass: 'sp--direction-ltr',
                  html: personImageDiv +
                      '<div><i class="fa fa-quote-left"></i> ' + testimonial.replace(/\r\n|\r|\n/g, '<br>') + ' <i class="fa fa-quote-right"></i></div>' +
                      '<div id="sp-widget6__person-name">' + personName +'</div>' +
                      '<div id="sp-widget6__person-title">' + personTitle +'</div>'
                }).done();
                
                /**
                 * Send Ask a Question event.
                 * 
                 * param_1_varchar - The text on the Ask a Question button.
                 * param_2_varchar - The message in the widget form.
                 * param_3_varchar - The email address to reply to in the widget form.
                 */
                sp.viewer.setCustomerEvent({
                  eventName: sp.viewer.eventName.viewerWidgetTestimonialsClicked,
                  linkHash: sp.viewer.linkHash,
                  sessionId: sessionid,
                  param_1_varchar: buttonText,
                  param_2_varchar: personName,
                  param_3_varchar: personTitle,
                  param_4_varchar: testimonial,
                });
              });
        };
      };
    };
    
    function implementWidget7(widget) {
      
      // Widget 7 - Form widget.
      // Widget location - right side.
      if (0 == $('.sp-right-side-widgets').length) {
        $('body').append('<div class="sp-right-side-widgets"></div>');
      }
      
      $('.sp-right-side-widgets').append('<button class="sp-widget-button sp-widget-font-fmaily sp--direction-ltr" id="sp-widget7"></button>');
      
      if ($('.sp-right-side-widgets button, .sp-right-side-widgets div').length > 1) {
        $('#sp-widget7').css('margin-top', '20px');
      }
      
      $('#sp-widget7').html('<i class="fa ' + widget.formButtonIcon + '"></i><div><p>' + widget.formButtonTextLine1 + '</p></div>');
      if ('' !== widget.formButtonTextLine2) {
      	$('#sp-widget7 p').after(
      			'<p>' + widget.formButtonTextLine2 + '</p>'
      	);
      }
      
      // Widget location - below toolbar.
      if ('belowToolbar' === widget.formWidgetPlacement) {
        $('body').append(
            '<div id="sp-widget7__toolbar-button-container">' +
              '<button id="sp-widget7__toolbar-button"></button>' +
            '</div>'
        );
        
        $('#sp-widget7__toolbar-button').html('<p>' + widget.formButtonTextLine1 + '</p>');
        if ('' !== widget.formButtonTextLine2) {
        	$('#sp-widget7__toolbar-button p').after(
        			'<p>' + widget.formButtonTextLine2 + '</p>'
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
      			function() {
      				
      				// Open form.
      				$('#sp-widget7').click();
      			},
      			
      			// Time is converted to milliseconds.
      			Math.floor(formAutoLoadTimeout * 1000)
      	);
      }
      
      $('#sp-widget7, #sp-widget7__toolbar-button').click(function() {
      
        switch(widget.formSelectType) {
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
        sp.viewer.setCustomerEvent({
          eventName: sp.viewer.eventName.viewerWidgetFormButtonClicked,
          linkHash: sp.viewer.linkHash,
          sessionId: sessionid,
          param_1_varchar: $(this).text()
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
            html: '<iframe id="sp-widget7-form" style="width: 100%" src="' + widget.formUrl + '" frameborder="0"></iframe>',
            title: widget.formTitle,
            width: 950,
          }).then(function() {
          },
          function(dismiss) {
            if (dismiss === 'cancel') {
              sp.viewer.setCustomerEvent({
                eventName: sp.viewer.eventName.viewerWidgetFormCancelClicked,
                linkHash: sp.viewer.linkHash,
                sessionId: sessionid,
                param_1_varchar: $('.swal2-cancel').text()
              });
            }
          });
        }
        
        function imageSwal() {
          swal({
            html: '<img src="' + widget.formImage + '" style="width: 100%; height: 100%; max-width: ' 
                  + widget.formImageMaxWidth + '; max-height: ' + widget.formImageMaxWidth + ';">',
            title: widget.formTitle,
          }).done();
        }
        
        /**
         * Send form confirm click event.
         * 
         * param_1_varchar - The text on the button.
         */
        $('.swal2-confirm').off('click').on('click', function() {
          sp.viewer.setCustomerEvent({
            eventName: sp.viewer.eventName.viewerWidgetFormConfirmClicked,
            linkHash: sp.viewer.linkHash,
            sessionId: sessionid,
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
      $.each(items, function(index, item) {
        switch(item.codeLocation) {
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

    function implementWidget9(widget) {
      
      // Widget 9 - Link Widget.
      if (0 == $('.sp-right-side-widgets').length) {
        $('body').append('<div class="sp-right-side-widgets"></div>');
      }
      
      $('.sp-right-side-widgets').append(
          '<button class="sp-widget-button sp-widget-font-fmaily sp--direction-ltr sp-hidden" id="sp-widget9">' +
            '<i class="fa fa-external-link"></i><div class="sp-widget9__text"></div>' +
          '</button>'
      );
      
      $('#sp-widget9').css({
      	'background-color': config.viewer.toolbarButtonBackground,
        'color': config.viewer.toolbarCta1Color,
      });
      
      if ($('.sp-right-side-widgets button, .sp-right-side-widgets div').length > 1) {
        $('#sp-widget9').css({
          'margin-top': '20px'
        });
      }
      
      sp.viewer.widgets.widget9.isReady = true;
      $(document).trigger('spWidget9Ready');
    }
    
    function loadWidget9Link(links) {
      
      // Format links array to an object for ease of access.
      var linksByPageFrom = {};
      var linksByPageTo = {};
      
      // +1 to the linkPageStop, so that the button is visible on the page the user has selected
      // the button to be visible until. The button is hidden on this page.
      $.each(links, function(index, link) {
      	linksByPageFrom['page' + link.pageFrom.toString()] = link;
      	linksByPageTo['page' + (parseInt(link.pageTo) + 1).toString()] = link;
      });
      
      for (var page = PDFViewerApplication.page; page > -1; page--) {
      	
      	if (typeof linksByPageFrom['page' + page] !== 'undefined') {
      		$('#sp-widget9').removeClass('sp-widget9__transition sp-hidden');
      	
          setWidget9Link(
          		linksByPageFrom['page' + page].buttonText1,
          		linksByPageFrom['page' + page].buttonText2,
          		linksByPageFrom['page' + page].link,
          		linksByPageFrom['page' + page].pageFrom,
          		linksByPageFrom['page' + page].pageTo
          );
          
          // If a page with a link is found, break the loop.
          break;
        } else if (typeof linksByPageTo['page' + page] !== 'undefined') {
           $('#sp-widget9').addClass('sp-widget9__transition');
           
           break;
        }
      	
      	if (0 === page) {
      		$('#sp-widget9').addClass('sp-widget9__transition');
      	}
      }
    }
    
    function setWidget9Link(buttonText1, buttonText2, link, pageFrom, pageTo) {
      $('.sp-widget9__text')
      	.empty()
      	.append('<p>' + buttonText1 + '</p>');
      
      if ('' !== buttonText2) {
      	$('.sp-widget9__text p').after('<p>' + buttonText2 + '</p>');
      }
      
       $('#sp-widget9').off('click').on('click', function() {
         if (! link.match(/^#/)) {
           window.open(link); 
         }
         
         sp.viewer.setCustomerEvent({
           eventName: sp.viewer.eventName.viewerWidgetLinkClicked,
           linkHash: sp.viewer.linkHash,
           sessionId: sessionid,
           param_1_varchar: buttonText1,
           param_2_varchar: buttonText2,
           param_3_varchar: link,
           param_4_varchar: pageFrom,
           param_5_varchar: pageTo,
         });
       });
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
