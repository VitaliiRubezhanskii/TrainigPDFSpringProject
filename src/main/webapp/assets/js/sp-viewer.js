/* global DEFAULT_URL */
DEFAULT_URL = ''; 

var sp = sp || {};
sp.viewer = {
  breakPoint: 768,
  eventName: {
    clickedCta: 'CLICKED_CTA'
  },
  linkHash: getParameterByName('f'),
  
  init: (function() {
    $(document).ready(function() {
      $('.sp-cta, .sp-secondary-cta').click(function() {
        var eventData = {
          buttonText: $(this).text(),
          destinationUrl: $(this).attr('href'),
          eventName: sp.viewer.eventName.clickedCta,
          id: $(this).attr('id'),
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
      
      $.post('../ManagementServlet', JSON.stringify(data));
    }
  }
};

var iframeSrc;
if ('' != sp.viewer.linkHash) {
  $.getJSON('../config-viewer', {linkHash: sp.viewer.linkHash}, function(config) {
    PDFViewerApplication.open(config.appUrl + '/file/' + sp.viewer.linkHash);
    $(document).prop('title', 'SlidePiper Viewer');
    
    // Customization settings.
    if (typeof config.viewer.toolbarBackground !== 'undefined') {
      $('#toolbarContainer, #toolbarSidebar, #secondaryToolbar')
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
      $('.toolbarLabel, .pageNumber, #scaleSelect > option')
          .css('color', config.viewer.toolbarColor);
      
      $(document).on('pagerendered', function(){
        $('#scaleSelect').css('color', config.viewer.toolbarColor);
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
      $('.sp-toolbar-logo img')
          .attr('src', 'data:image/png;base64,' + config.viewer.toolbarLogoImage);
      
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
    
    // Since loading fonts is currently done asynchronous, this section
    // is positioned at the end of the templating process.
    if (typeof config.viewer.toolbarFontFamily !== 'undefined') {
      if (typeof config.viewer.toolbarWebFontFamilies !== 'undefined') {
        WebFontConfig = {
          google: { families: [ config.viewer.toolbarWebFontFamilies ] },
          active: function() {
            $('.toolbarLabel, .pageNumber, .dropdownToolbarButton')
                .css('font-family', config.viewer.toolbarFontFamily);
            loadToolbar();
          }
        };
        
        /**
         * @see Google Fonts.
         */
        (function() {
          var wf = document.createElement('script');
          wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
            '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
          wf.type = 'text/javascript';
          wf.async = 'true';
          var s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(wf, s);
        })();
      } else {
        loadToolbar();
      }
    } else {
      loadToolbar();
    }
    
    function loadToolbar() {
      $('#toolbarContainer, #toolbarSidebar').css('visibility', 'visible');
    }
    
    // Chat settings.
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
    
    /* Widget Settings */
    
    // Widget 1 - YouTube widget 
    if (true == config.viewer.widget1.isEnabled) {
      $('body').append('<div class="sp-demo-video sp-demo-video1"><div class="sp-demo-video-title-container"><span class="sp-demo-video-title__span"></span><i class="fa fa-chevron-up"></i></div></div>');
      $('.sp-demo-video1 span').text(config.viewer.widget1.title);
      $('.sp-demo-video').append($('#sp-player'));
      if (true == config.viewer.isYoutubeVideo) {
        iframeSrc = config.viewer.widget1.iframeSrc.split('/')[4];
        $.getScript("https://www.youtube.com/iframe_api");
      } else {
        $('#sp-player').append('<iframe src=' + config.viewer.widget1.iframeSrc + '></iframe>');
      }
     
      config.viewer.isFileLoaded = false;
      config.viewer.lastViewedPage = 0;      
      $(document).on('pagesloaded pagechange', function(event) {
        if ('pagesloaded' == event.type) {
          config.viewer.isFileLoaded = true;
        }
        if (config.viewer.isFileLoaded && config.viewer.lastViewedPage != PDFViewerApplication.page) {
          if (config.viewer.widget1.pageNumber == PDFViewerApplication.page) {
            $('.sp-demo-video1').css('visibility', 'visible');
            $('.sp-demo-video1 .fa').removeClass('fa-chevron-up').addClass('fa-chevron-down');
            $('.sp-demo-video1 iframe').show(300, 'swing');
            $('.sp-demo-video1').removeClass('sp-video1-clicked');
            $(window).resize();
          } else if (! $('.sp-demo-video1').hasClass('sp-video1-clicked')) {
            $('.sp-demo-video1 .fa').removeClass('fa-chevron-down').addClass('fa-chevron-up');
            $('.sp-demo-video1 iframe').hide(300, 'swing');
          }
          config.viewer.lastViewedPage = PDFViewerApplication.page;
        }
      });
      
      $('.sp-demo-video1').click(function() {
        $('.sp-demo-video1 iframe').slideToggle('swing', function () {
          if ($('.sp-demo-video iframe').is(':visible')) {
            $('.sp-demo-video-title__span')
              .css({'padding-right': '0', 'max-width': '80%'});
            $('.sp-demo-video1').css('width', '34%');
            $('.sp-demo-video1').css('min-width', '300px');
          } else {
            $('.sp-demo-video-title__span')
              .css({'padding-right': '20px', 'max-width': '80%'});
            $('.sp-demo-video1').css('width', '34%');
            $('.sp-demo-video1').css('min-width', '175px');
          }
          $(window).resize();
        });
        $('.sp-demo-video1 .fa').toggleClass('fa-chevron-down fa-chevron-up');
        if ($('.sp-demo-video1').hasClass('sp-video1-active')) {
          $('.sp-demo-video1').addClass('sp-video1-clicked');
          $('.sp-demo-video1').removeClass('sp-video1-active');
        } else {
          $('.sp-demo-video1').addClass('sp-video1-active');
        } 
      });
    }
    
    // Widget 2 - Calendly widget
    if (true == config.viewer.widget2.isEnabled) {
      $('body').append('<button class="sp-widget-button sp-widget2"></button>');
      $('.sp-widget2').html('<i class="fa fa-2x fa-calendar"></i><div>' + config.viewer.widget2.title + '</div>');

      config.viewer.widget2.flag = false;
      setInterval(function() {
        if (config.viewer.widget2.pageNumber == PDFViewerApplication.page) {
          if (false == config.viewer.widget2.flag) {
            $('.sp-widget2').css('visibility', 'visible');
            $('.sp-widget2').css('transform', 'translate(0,0)');
            config.viewer.widget2.flag = true;
          }
        } else {
          $('.sp-widget2').css('transform', 'translate(188px,0)');         
          config.viewer.widget2.flag = false;
        }
      }, 1000);

      $('.sp-widget2').click(function() {
        swal({
          html: true,
          showCancelButton: true,
          showConfirmButton: false,
          text: '<iframe src="../assets/viewer/widget/calendly.html?user=' + config.viewer.widget2.iframeSrc + '" height="420" frameborder="0"></iframe>',
          title: 'Schedule Meeting',
        });
      });
    }
  });
}

$(window).resize(function (){
  videoWidth = $('.sp-demo-video iframe').width();
  var videoHeight = (videoWidth / (16/9));
  $('.sp-demo-video iframe').height(videoHeight);
  console.log('Width: ' + videoWidth + ', Height: ' +  videoHeight);
}).resize();

/* YouTube iFrame API */
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('sp-player', {
    height: '168.75',
    width: '300',
    videoId: iframeSrc,
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

var done = false;
function onPlayerStateChange(event) {
  var playerState = event.data;
  var viewDuration = getViewDuration();
  var currentVideo = getVideoUrl();
  if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 6000);
    done = true;
  }
}
function stopVideo() {
  player.stopVideo();
}

function getViewDuration() {
  return player.getDuration() - (player.getDuration() - player.getCurrentTime());
}

function getVideoUrl() {
  return player.getVideoUrl();
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
