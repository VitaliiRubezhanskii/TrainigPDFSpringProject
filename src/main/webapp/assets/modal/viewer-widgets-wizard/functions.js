var sp = sp || {};

sp.viewerWidgetsModal = {
  
  /**
   * Get a file widget settings from the DB.
   * 
   * @param {string} fileHash - The file hash.
   */
  getWidgetsSettings: function(fileHash) {
    $.getJSON(
        'ManagementServlet',
        {
          action: 'getWidgetsSettings',
          fileHash: fileHash
        },
        function(data) {
          sp.viewerWidgetsModal.displayWidgetsSettings(data.widgetsSettings);
          sp.viewerWidgetsModal.setSaveButtons(fileHash);
        }
    );
  },
  
  /**
   * @param {object} widgetData - The widget settings for this file, received from
   * the ManagementServlet.
   */
  displayWidgetsSettings: function(widgetsSettings) {
    $.each(widgetsSettings, function(index, value) {
      var widget = JSON.parse(value.widgetData);
      
      switch(widget.data.widgetId) {
        case 1:
          displayVideoSettings(widget.data);
          break;
          
        case 2:
          displayCalendlySettings(widget.data);
          break;
          
        case 3:
          displayAskQuestionSettings(widget.data);
          break;
          
        case 4:
        	displayLikeWidgetSettings(widget.data);
        	break;
      }
    });
    
    /**
     * Display a Video widgets settings in the modal window.
     * 
     * @param {string} widget - The widget settings.
     */
    function displayVideoSettings(widget) {
    	
    	for (var i = 0; i < widget.items.length - 1; i++) {
    		sp.viewerWidgetsModal.renderAddVideoRows();
    	}
      
      $('[name="video-widget-is-enabled"]')
        .prop('checked', widget.isEnabled)  
        .closest('div').removeClass('sp-hide-is-enabled');
        
      $('.sp-video-widget-data-row').each(function(index) {
        $(this).find('[data-video]').each(function() {
        	switch($(this).attr('data-video')) {
        		case 'videoSource':
        			$(this).val(widget.items[index].videoSource);
        			break;
        			
        		case 'videoTitle':
        			$(this).val(widget.items[index].videoTitle);
        			break;
        			
        		case 'videoPageStart':
        			$(this).val(widget.items[index].videoPageStart);
        			break;
          }
        });
      });
      
      $(document).off('click', '.sp-add-video-widget__a').on('click', '.sp-add-video-widget__a', function() {
        sp.viewerWidgetsModal.renderAddVideoRows();
      });
      
      $(document).on('click', '.sp-delete-video-widget__a', function() {
    		$(this).closest('.row').remove();
      });
    }
    
    /**
     * Display settings for Calendly Widget in the modal window.
     * 
     * @param {object} widget - The settings for the Calendly widget.
     */
    function displayCalendlySettings(widget) {
      $('[name="calendly-widget-is-enabled"]')
        .prop('checked', widget.isEnabled)
        .closest('div').removeClass('sp-hide-is-enabled');
          
      $('[name="calendly-widget-username"]').val(widget.items[0].userName);
      $('[name="calendly-widget-button-text"]').val(widget.items[0].buttonText);
    }
    

    /**
     * Display settings for Question Widget.
     * 
     * @param {object} widget - The settings for the Question widget in the modal window.
     */ 
    function displayAskQuestionSettings(widget) {
      $('[name="question-widget-is-enabled"]')
        .prop('checked', widget.isEnabled)
        .closest('div').removeClass('sp-hide-is-enabled');
          
      $('[name="question-widget-text"]').val(widget.items[0].buttonText);
    }
    
    function displayLikeWidgetSettings(widget) {
    	$('[name="like-widget-is-enabled"]').prop('checked', widget.isEnabled),
    	$('[name="like-widget-counter-is-enabled"]').prop('checked', widget.items[0].isCounterEnabled);
    }
  },
  
  /**
   * 1) Set Save buttons.
   * 2) Add data-file-hash attribute for the save and save & test buttons.
   * 3) Save widgets settings, and if clicked on 'Save & Test' button open a file link.
   */
  setSaveButtons: function(fileHash) {

    // 1)
    $('#sp-save-widgets-settings__button, #sp-save-test-widgets-settings__button')
        .attr('data-file-hash', fileHash);
    
    // 2)
    sp.file.setFileLinkAttribute(
        fileHash,
        'test@example.com',
        sp.config.salesman.email,
        'sp-save-test-widgets-settings__button'
    );
    
    // 3)
    $('#sp-save-widgets-settings__button, #sp-save-test-widgets-settings__button')
        .on('click', function () {
          sp.viewerWidgetsModal.validateWidgetsSettings(
              $(this).attr('data-file-hash'), $(this).attr('id'));
    });
  },
  
  /**
   * Validate a file widgets settings.
   * 
   * @param {string} fileHash - The file hash. 
   * @param {string} targetId - The id of the target (clicked) HTML element.
   * 
   * @var {object} settings - An array containing the widgets settings.
   * 
   * This function calls sp.viewerWidgetsModal.allInputsFilled, to remove the error border-color
   * if all the inputs have now been filled upon submit.
   * 
   * If any of the input fields aren't empty in panel in the Customize Modal then call the relevant function
   * to save the settings for this widget.
   * 
   * These functions return an object containing the widget data, if there was a validation error, the function
   * returns undefined, which then halts the sp.viewerWidgetsModal.postWidgetSettings from being called.
   * 
   */
  validateWidgetsSettings: function(fileHash, targetId) {
    var settings = [];
    
    $('.sp-viewer-widgets-modal input').removeClass('sp-video-widget-form-error');

    if (! sp.viewerWidgetsModal.isInputEmpty(3)
    		|| ! $('[name="question-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
      settings.push(sp.viewerWidgetsModal.saveAskQuestionWidgetSettings(fileHash));
    }
    
    if (! sp.viewerWidgetsModal.isInputEmpty(1)
    		|| ! $('[name="video-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
    	settings.push(sp.viewerWidgetsModal.saveVideoWidgetSettings(fileHash));
    }
    
    if (! sp.viewerWidgetsModal.isInputEmpty(2)
    		|| ! $('[name="calendly-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
    	settings.push(sp.viewerWidgetsModal.saveCalendlyWidgetSettings(fileHash));
    }
    
    settings.push(sp.viewerWidgetsModal.saveLikeWidgetSettings(fileHash));
    
    var data = {
        action: 'setWidgetsSettings',
        widgetsSettings: settings
    };
    
    /**
     * If the user entered invalid information, the functions to find widget settings
     * will have returned undefined.
     */
    var isValidWidgetSettings = false;
    $.each(settings, function(index, setting) {
      if (typeof setting === 'undefined') {
        isValidWidgetSettings = false;
        return false;
      } else {
      	isValidWidgetSettings = true;  
      }
    });
    
    if (isValidWidgetSettings) {
      sp.viewerWidgetsModal.postWidgetSettings(data, fileHash, targetId);
    } else if (0 === settings.length) {
    	$('button[data-dismiss="modal"]').click();
    	swal('No settings were saved.', '', 'info');
    }
  },
  
  /**
   * Post widget settings to ManagementServlet
   * 
   * @param {object} data - The widget settings data.
   * @param {string} fileHash - The document fileHash.
   * @param {number} targetId - The ID of the 'Save' button clicked on. 
   */
  postWidgetSettings: function(data, fileHash, targetId) {	  
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
  },
  
  
  /**
   * Validate then save Calendly Widget Settings.
   * 
   * If the user hasn't filled the field it will alert them to this by adding the
   * class .sp-video-widget-form-error which sets the border color to #1ab394.
   * 
   * @param {string} fileHash - The fileHash
   * @return {object} calendlyWidgetData - The widget data for Calendly widget
   */
  saveCalendlyWidgetSettings: function(fileHash) {    
    var username = $('[name="calendly-widget-username"]').val();
    
    if (username.indexOf('://') > -1) {
      username = username.split('/').slice(3).join('/');
    }
    
    if ($('[name="calendly-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
      $('[name="calendly-widget-is-enabled"]').prop('checked', true);
    }
    
    if ('' === $('[name="calendly-widget-username"]').val()) {
      sp.error.handleError('You must fill the field.');
      $('[name="calendly-widget-username"]').addClass('sp-video-widget-form-error');
    }
    
    if ('' === $('[name="calendly-widget-button-text"]').val()) {
      sp.error.handleError('You must fill the field.');
      $('[name="calendly-widget-button-text"]').addClass('sp-video-widget-form-error');
    }
    
    if ('' === $('[name="calendly-widget-button-text"]').val() || '' === $('[name="calendly-widget-username"]').val()) {
      sp.viewerWidgetsModal.openErrorTab();
      return undefined;
    }
      
    var calendlyWidgetData = {
        apiVersion: '1.0',
        data: {
          fileHash: fileHash,
          widgetId: 2,
          isEnabled: $('[name="calendly-widget-is-enabled"]').prop('checked'),
          items: [
            {
	            userName: username,
	            buttonText: $('[name="calendly-widget-button-text"]').val()
            }
          ]
        }
    };
    
    return calendlyWidgetData;
  },
  
  /**
   * Validate then save Question Widget Settings.
   * 
   * If the user has selected that the widget 'Is Enabled' but haven't entered filled the field,
   * it will alert them to this.
   * 
   * @param {string} fileHash - The fileHash
   * @return {object} askQuestionWidgetData - The widget data for Question widget
   */
  saveAskQuestionWidgetSettings: function(fileHash) {

    if ($('[name="question-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
      $('[name="question-widget-is-enabled"]').prop('checked', true);
    }
    
    if ('' === $('[name="question-widget-text"]').val()) {
      sp.error.handleError('You must fill the field.');
      $('[name="question-widget-text"]').addClass('sp-video-widget-form-error');
      sp.viewerWidgetsModal.openErrorTab();
      return undefined;
    }
   
    var askQuestionWidgetData = {
    		apiVersion: '1.0',
    		data: {
          fileHash: fileHash,
          widgetId: 3,
          isEnabled: $('[name="question-widget-is-enabled"]').prop('checked'),
          items: [
            {
            	buttonText: $('[name="question-widget-text"]').val()     
            }
          ]
        }
    };
    
    return askQuestionWidgetData;
  },
  
  saveLikeWidgetSettings: function(fileHash) {
  	var likeWidgetData = {
			apiVersion: '1.0',
      data: {
        fileHash: fileHash,
        widgetId: 4,
        isEnabled: $('[name="like-widget-is-enabled"]').prop('checked'),
        items: [
          {
            isCounterEnabled: $('[name="like-widget-counter-is-enabled"]').prop('checked')
          }
        ]
      }
  	};
  	
  	return likeWidgetData;
  },
  
  
  /**
   * Validate then save Video Widget Settings.
   * 
   * This function also contains validation of the user input. For example, it checks
   * that they haven't selected two videos to appear on the same page, or that they have
   * submitted a video without a video URL.
	 *
   * Validation checks:
   * 	- Two page starts aren't the same.
   *  - Video page start is not empty.
   *  - Video Source is not empty.
   *  - Video Title is not empty.
   * 
   * @param {string} fileHash - The fileHash
   * @return {object} videoWidgetData - The widget data for Video widget
   */
  saveVideoWidgetSettings: function(fileHash) {
  
	  if ($('[name="video-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
	    $('[name="video-widget-is-enabled"]').prop('checked', true);
	  }
  
    var videoWidgetData = {
      	apiVersion: '1.0',
    		data: {
	        fileHash: fileHash,
	        widgetId: 1,
	        isEnabled: $('[name="video-widget-is-enabled"]').prop('checked')
        }
    };
    
    var items = [];
    var pagesWithVideo = [];
    var pagesOverlapping = false;
    var isVideoSourceEmpty = false;
    var isNumberFieldEmpty = false;
    var isVideoTitleEmpty = false;
    var videoSourceArr = [];
    $('.sp-video-widget-data-row').each(function(index, value) {
      var item = {};
      var pageStart = null;
      $(this).find('[data-video]').each(function(index2, value2) {
      	
	    	switch($(this).attr('data-video')) {
		    	case 'videoSource':
		    		var videoSource = $(value2).val();
	          if (! videoSource || '' === videoSource) {
	            sp.error.handleError('You must fill the field.');
	            $(this).addClass('sp-video-widget-form-error');
	            isVideoSourceEmpty = true;
	            sp.viewerWidgetsModal.openErrorTab();
	          } else {
	          	videoSourceArr = sp.viewerWidgetsModal.handleVideoSource(videoSource);
		          item['isYouTubeVideo'] = videoSourceArr[0];  
		          item['videoSource'] = videoSourceArr[1];
	          }
	          break;
	          
		    	case 'videoTitle':
		    		var videoTitle =  $(value2).val();
	          if ('' === videoTitle) {
	            sp.error.handleError('You must fill the field.');
	            $(this).addClass('sp-video-widget-form-error');
	            isVideoTitleEmpty = true;
	            sp.viewerWidgetsModal.openErrorTab();
	          } else {
	          	item['videoTitle'] =  videoTitle;
	          }
	          break;
	          
		    	case 'videoPageStart':
		    		pageStart = parseInt($(value2).val());
		        pagesOverlapping = sp.viewerWidgetsModal.arePagesOverlapping(pageStart, pagesWithVideo);
		        if (null !== pageStart) {
		          if (isNaN(pageStart)) {
		            $(value2).addClass('sp-video-widget-form-error');
		            sp.error.handleError('You must fill the field.');
		            sp.viewerWidgetsModal.openErrorTab();
		            isNumberFieldEmpty = true;
		          } else if (pagesOverlapping) {
		            var errorNumber = $(this).val();
		            $(this).closest('#sp-video-customization-options-container').find('[name="video-widget-page-start"]')
		            	.each(function(index, value) {
			              if ($(value).val() === errorNumber) {
			                  $(value).addClass('sp-video-widget-form-error');
			              }
		            });
		            sp.viewerWidgetsModal.openErrorTab();
		            sp.error.handleError('You must fill the field.');
		          } else {
		          	item['videoPageStart'] = pageStart;
		          }
		        }
		        break;
	    	}  
      });
      items.push(item);
    });
    videoWidgetData.data.items = items;
    if (! pagesOverlapping && ! isVideoSourceEmpty && ! isNumberFieldEmpty && ! isVideoTitleEmpty) {
      return videoWidgetData;
    }
  },
  
  /**
   * Open the tab where there is an input validation error.
   */
  openErrorTab: function() {
    $('#sp-viewer-widgets-modal input').each(function() {
      if ($(this).hasClass('sp-video-widget-form-error')) {
         $('#sp-viewer-widgets-modal .tab-pane').removeClass('active');
         $(this).closest('.tab-pane').addClass('active');
         var tabId = $(this).closest('.tab-pane').attr('id');
         $('#sp-viewer-widgets-modal .nav-tabs li').removeClass('active');
         $('[href="#' + tabId + '"]').closest('li').addClass('active');
      }
    });
  },
  
  /**
   * Check if input fields are empty in document cusomization. 
   * 
   * @return {boolean} isEmpty - returns true if any of the input fields are empty.
   */
  isInputEmpty: function(widgetId) {	  
    var isEmpty = false;
    $('#sp-tab-' + widgetId).find('input:not(input[type="checkbox"])').each(function(index, input) {
      if ('' === $(input).val()) {
        isEmpty = true;
      } else {
      	isEmpty = false;
        return false;
      }
    });
    
    return isEmpty;
  },

  /**
   * HTML for adding a new row for a video widget setting.
   */
  renderAddVideoRows: function() {
    $('#sp-video-customization-options-container').append(
        '<div class="row sp-video-widget-data-row">'
           +'<div class="col-xs-4">'                 
             + '<input type="text" data-video="videoSource" class="sp-video-widget" name="video-widget-link" placeholder="e.g. https://www.youtube.com/watch?v=tk-_PgWTASU" data-key-id="1" data-key-type="string">'
           + '</div>'
                                
          + '<div class="col-xs-4">'
            + '<input type="text" data-video="videoTitle" class="sp-video-widget" name="video-widget-title" placeholder="e.g. Watch This Video!" data-key-id="2" data-key-type="string">'
          + '</div>'

          + '<div class="col-xs-2 sp-video-widget-page-choice-container">'
            + '<input type="number" data-video="videoPageStart" class="sp-video-widget" name="video-widget-page-start" min="1" data-key-id="7" data-key-type="integer">'
          + '</div>'
                       
          + '<div class="col-xs-2">'
            + '<a class="btn btn-white btn-sm sp-delete-video-widget__a">'
              + '<i class="fa fa-times" aria-hidden="true"></i>'
            + '</a>'
          + '</div>'
          + '<input type="checkbox" class="form-control" style="display: none;" name="video-widget-is-youtube-video" data-key-id="4" data-key-type="boolean">'
       + '</div>'
    );
  },
  
  /**
   * Check if video URL is a YouTube link.
   * 
   * @param {string} videoSource - The video URL.
   * 
   * If videoSource is a youtube video, generate a YouTube embed link.
   * 
   * @return an [] - Whether the checkbox checking whether the URL is a youtube video is checked
   * and the videoSource.
   */
  handleVideoSource: function(videoSource) {
    if (typeof videoSource !== 'undefined') {
      var domain = null;
      
      if (videoSource.indexOf("://") > -1) {
        domain = videoSource.split('/')[2];
      } else {
        domain = videoSource.split('/')[0];
      }
      domain = domain.split('.');
      domain = domain[domain.length - 2];
      
      if ('youtube' == domain) {
        $('[name="video-widget-is-youtube-video"]').prop('checked', true);
      } else if ('youtu' === domain) {
      	$('[name="video-widget-is-youtube-video"]').prop('checked', true);
    		videoSource = 'https://www.youtube.com/embed/' + videoSource.split('/')[3];
      } else {
        $('[name="video-widget-is-youtube-video"]').prop('checked', false);
      }
      
      // Allow for saving a regular YouTube link, and not only an embed one.
      if (typeof domain !== 'undefined') {
        if ('youtube' == domain.toLowerCase() && videoSource.indexOf('?') > -1) {
          videoSource = 'https://www.youtube.com/embed/' + getParameterByKey('v', videoSource);
        }
      }

      return [$('[name="video-widget-is-youtube-video"]').prop('checked'), videoSource];
      
      /**
      * The function returns the value of a URL query string parameter.
      * 
      * @param {string} name - Query string key.
      * 
      * @return The URL query string parameter's value.
      */
      function getParameterByKey(key, url) {
        var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
        var results = regex.exec('?' + url.split('?')[1]);
        
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
      };
    }
  },
  
  /**
   * Check if two page numbers are the same.
   * 
   * @param {number} pageStart - The page the video has been selected to start.
   * @param {object} pagesWithVideo - The array containing the current pages selected.
   * 
   * If pageStart is already in pagesWithVideo, it means there is a validation error.
   * 
   * @return {true} if pages are overlapping.
   */
  arePagesOverlapping: function(pageStart, pagesWithVideo) {
    if ($.inArray(pageStart, pagesWithVideo) === -1) {
      pagesWithVideo.push(pageStart);
    } else {
      return true;
    }
    return false;
  }
};

$('.sp-video-link-tooltip').tooltip({delay: {show: 100, hide: 200}, placement: 'top'});