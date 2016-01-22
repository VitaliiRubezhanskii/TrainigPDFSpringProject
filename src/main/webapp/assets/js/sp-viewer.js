/* global DEFAULT_URL */
DEFAULT_URL = ''; 

var sp = sp || {};
sp.viewer = {
  linkHash: getParameterByName('f')
};

if ('' != sp.viewer.linkHash) {
  $.getJSON('../config-viewer', {linkHash: sp.viewer.linkHash}, function(config) {
    PDFViewerApplication.open(config.appUrl + '/file/' + sp.viewer.linkHash);
    $(document).prop('title', 'SlidePiper Viewer');
    
    // Template settings.
    if (typeof config.viewer.toolbarBackgroundImage !== 'undefined') {
      $('#toolbarContainer, #toolbarSidebar, #secondaryToolbar')
          .css('background-image', config.viewer.toolbarBackgroundImage);
    }
    
    if (typeof config.viewer.toolbarBackgroundColor !== 'undefined') {
      $('#toolbarContainer, #toolbarSidebar, #scaleSelect > option, #secondaryToolbar')
          .css('background-color', config.viewer.toolbarBackgroundColor);
    }
    
    if (typeof config.viewer.toolbarButtonBackgroundColor !== 'undefined') {
      $('.toolbarButton, .secondaryToolbarButton')
          .css('background-color', config.viewer.toolbarButtonBackgroundColor);
    
      if (typeof config.viewer.toolbarButtonHoverBackgroundColor !== 'undefined') {
        $('.toolbarButton, .secondaryToolbarButton').hover(
          function() {
            $(this).css('background-color', config.viewer.toolbarButtonHoverBackgroundColor);
          },function() {
            $(this).css('background-color', config.viewer.toolbarButtonBackgroundColor);
          });
      }
    }
    
    if (typeof config.viewer.toolbarButtonBorderColor !== 'undefined') {
      $('.toolbarButton, .secondaryToolbarButton')
          .css('border-color', config.viewer.toolbarButtonBorderColor);
    
      if (typeof config.viewer.toolbarButtonHoverBorderColor !== 'undefined') {
        $('.toolbarButton, .secondaryToolbarButton').hover(
          function() {
            $(this).css('border-color', config.viewer.toolbarButtonHoverBorderColor);
          },function() {
            $(this).css('border-color', config.viewer.toolbarButtonBorderColor);
          });
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
          });
      }
    }
    
    if (typeof config.viewer.toolbarColor !== 'undefined') {
      $('.toolbarLabel, .pageNumber, #scaleSelect > option')
          .css('color', config.viewer.toolbarColor);
      
      $(document).on('pagerendered', function(){
        $('#scaleSelect').css('color', config.viewer.toolbarColor);
      });
    }
    
    if (typeof config.viewer.toolbarLogoImage !== 'undefined') {
      $('.sp-toolbar-logo img')
          .attr('src', 'data:image/png;base64,' + config.viewer.toolbarLogoImage);
      
      if (typeof config.viewer.toolbarLogoLink !== 'undefined') {
        $('.sp-toolbar-logo a').attr('href', config.viewer.toolbarLogoLink);
      }
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
  });
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
