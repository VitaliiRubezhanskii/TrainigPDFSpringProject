var sp = sp || {};

sp.viewerWidgetsModal = {
  
  /**
   * Get a file widget settings from the DB.
   * 
   * @param {String} fileHash - The file hash.
   */
  getWidgetsSettings: function(fileHash) {
    $.getJSON(
        'ManagementServlet',
        {
          action: 'getWidgetsSettings',
          fileHash: fileHash
        },
        function(data) {
          sp.viewerWidgetsModal.displayWidgetsSettings(fileHash, data.widgetsSettings);
        }
    );
  },
  
  
  /**
   * Display a file widgets settings in a modal window.
   * 
   * @param {String} fileHash - The file hash.
   * @param {Object} widgetsSettings - The file widgets settings.
   */
  displayWidgetsSettings: function(fileHash, widgetsSettings) {
    
    /* Arrange Settings */
    
    var widgets = {};
    $.each(widgetsSettings, function(key, value) {
      var widget = {};
      $.each(value, function(key, value) {
        widget['keyId' + key] = value;
      });
      
      widgets['widget' + value.widgetId] = widget;            
    });
    
    
    /* Display Settings */
    
    /**
     * The following mechanism automatically sets widgets setting according to 
     * their HTML input elements.
     * Currently, the mechanism only supports boolean values connected to checkbox 
     * elements, and string values connected to input type text elements.
     * 
     * The condition keyId >= 8 is used to skip the auto setting of the Video 
     * and Calendly widgets.
     */
    $.each(widgets, function(widgetIndex, widget) {
      $.each(widget, function(key, value) {
        
        // key is expected to be of the form "keyId<number>"
        var keyId = parseInt(key.substring(5));  
        if (! isNaN(keyId) && keyId >= 8) {
          var input = $('.sp-viewer-widgets-modal [data-key-id="' + keyId + '"]');
          switch (typeof value) {
            case 'boolean':
              input.prop('checked', value);
              break;
            
            case 'string':
              input.val(value);
              break;
          }
        }
      });  
    });
    
    
    /* Widget 1  - Video Widget */
    
    if (typeof widgets['widget1'] != 'undefined') {
      $('[name="video-widget-is-enabled"]').prop('checked', function() {
        if (typeof widgets.widget1['keyId' + $(this).attr('data-key-id')] != 'undefined') {
          if (widgets.widget1['keyId' + $(this).attr('data-key-id')]) {
            return true;
          } else {
            return false;
          }
        }
      });
      
      $('[name="video-widget-link"]').val(function() {
        if (typeof widgets.widget1['keyId' + $(this).attr('data-key-id')] != 'undefined') {
          return widgets.widget1['keyId' + $(this).attr('data-key-id')];
        }
      });
      
      $('[name="video-widget-title"]').val(function() {
        if (typeof widgets.widget1['keyId' + $(this).attr('data-key-id')] != 'undefined') {
          return widgets.widget1['keyId' + $(this).attr('data-key-id')];
        }
      });
      
      $('[name="video-widget-page"]').val(function() {
        if (typeof widgets.widget1['keyId' + $(this).attr('data-key-id')] != 'undefined') {
          return widgets.widget1['keyId' + $(this).attr('data-key-id')];
        }
      });
    }
    
    
    /* Widget 2 - Calendly Widget */
    if (typeof widgets['widget2'] != 'undefined') {
      $('[name="calendly-widget-is-enabled"]').prop('checked', function() {
        if (typeof widgets.widget2['keyId' + $(this).attr('data-key-id')] != 'undefined') {
          if (widgets.widget2['keyId' + $(this).attr('data-key-id')]) {
            return true;
          } else {
            return false;
          }
        }
      });
      
      $('[name="calendly-widget-username"]').val(function() {
        if (typeof widgets.widget2['keyId' + $(this).attr('data-key-id')] != 'undefined') {
          return widgets.widget2['keyId' + $(this).attr('data-key-id')];
        }
      });
    }
    
    
    /* Save Buttons */
    
    // Add data-file-hash attribute for the save and save & test buttons.
    $('#sp-save-widgets-settings__button, #sp-save-test-widgets-settings__button')
        .attr('data-file-hash', fileHash);
    
    // Add data-file-link attribute (containing a test user file link)
    // for the save & test button.
    sp.file.setFileLinkAttribute(
        fileHash,
        'test@example.com',
        sp.config.salesman.email,
        'sp-save-test-widgets-settings__button'
    );
    
    // Save widgets settings, and if clicked on save & test button
    // open a file link. 
    $('#sp-save-widgets-settings__button, #sp-save-test-widgets-settings__button')
        .on('click', function () {
          sp.viewerWidgetsModal.setWidgetSettings(
              $(this).attr('data-file-hash'), $(this).attr('id'));
    });
  },
  
  
  /**
   * Set a file widgets settings.
   * 
   * @param {String} fileHash - The file hash. 
   * @param {String} targetId - The id of the target (clicked) HTML element.
   */
  setWidgetSettings: function(fileHash, targetId) {
    
    var widgetsSettings = [];
    $('.sp-viewer-widgets-modal input').each(function(index, value) {
      var keyId = parseInt($(this).attr('data-key-id'));
      var keyType = $(this).attr('data-key-type');
      
      var setting = {
        keyId: keyId,
        keyType: keyType,
      };
      
      switch (keyType) {
        case "boolean":
          setting.value = $(this).prop('checked');
          break;
        
        case "integer":
          setting.value = parseInt($(this).val());
          break;
          
        case "string":
          var string = $(this).val().toString();
          
          switch (keyId) {
            case 1:
              // Set video widget - isYouTubeVideo value.
              var url = string;
              var domain = null;
              
              if (url.indexOf("://") > -1) {
                domain = url.split('/')[2];
              } else {
                domain = url.split('/')[0];
              }
              domain = domain.split('.');
              domain = domain[domain.length - 2];
              
              if ('youtube' == domain) {
                $('[name="video-widget-is-youtube-video"]').prop('checked', true);
              }
              
              // Allow for saving a regular YouTube link, and not only an embed one.
              if ('youtube' == domain && string.indexOf('?') > -1) {
                string = 'https://www.youtube.com/embed/' + getParameterByKey('v', string);
              }
              
              /**
              * The function returns the value of a URL query string parameter.
              * 
              * @param {String} name - Query string key.
              * 
              * @return The URL query string parameter's value.
              */
              function getParameterByKey(key, url) {
                var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
                var results = regex.exec('?' + url.split('?')[1]);
                
                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
              };
              break;
              
            case 3:
              // If the input is for example https://calendly.com/username
              if (string.indexOf('://') > -1) {
                string = string.split('/').slice(3).join('/');
              }
              break;
          }
          
          setting.value = string;
          break;
      }
      
      widgetsSettings.push(setting);
    });
    
    var data = {
      action: 'setWidgetsSettings',
      fileHash: fileHash,
      widgetsSettings: widgetsSettings
    };
    
    $.post('ManagementServlet', JSON.stringify(data), function(data) {
      $('button[data-dismiss="modal"]').click();
      
      var resultCode = data.resultCode;
      if (0 == resultCode) {
        errorCallback();
      } else if (1 == resultCode) {
        if ('sp-save-widgets-settings__button' == targetId) {
          swal("Success!", "Your widgets settings have been saved!", "success");
        } else if ('sp-save-test-widgets-settings__button' == targetId) {
          window.open($('#' + targetId).attr('data-file-link'));
        }
      }
    })
    .fail(function() {
      errorCallback();
    });
    
    function errorCallback() {
      swal('Error', 'Something went wrong. Your settings weren\'t saved.', 'error');
    }
  }
};

$('.sp-video-link-tooltip').tooltip({delay: {show: 100, hide: 200}, placement: 'right'});