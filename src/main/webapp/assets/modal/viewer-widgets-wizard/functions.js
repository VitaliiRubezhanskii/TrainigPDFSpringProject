var sp = sp || {};

sp.widgets = {
  widget6: {
    item: '<hr>' + $('#sp-tab-6 .sp-widget-item').html(),
    
    init: (function() {
      /* Add Item */
      $('#sp-tab-6 .sp-widget__add-item').click(function() {
        sp.widgets.widget6.addItem();
      });
      
      /* Delete Item */
      $(document).on('click', '#sp-tab-6 .sp-widget__delete-item', function() {
        $(this).closest('.sp-widget-item').remove();
      });
      
      // Set person image.
      $(document).on('change', '.sp-widget6__input-person-image', function() {
        var $file = $(this);
        var file = this.files[0];
        var reader = new FileReader();
  
        reader.addEventListener('load', function() {
          $file.closest('.sp-widget-item').find('.sp-widget6__person-image')
              .removeClass('fa fa-user fa-4x')
              .css('background-image', 'url(' + reader.result + ')');
          
          $file.closest('.sp-widget-item').find('[name="person-image"]')
              .val(reader.result);
        }, false);
        
        if (file) {
          reader.readAsDataURL(file);
        }
      });
    })(),
    
    /**
     * Add a testimonial item to the widget setting panel.
     */
    addItem: function() {
      $('#sp-tab-6 .container-fluid')
          .append('<div class="sp-widget-item">' + this.item + '</div>');
    },
    
    /**
     * Load saved testimonials to the widget setting panel.
     */
    displayItems: function(widgetData) {
      
      // Display is enabled.
      $('#sp-widget6--is-enabled')
          .prop('checked', widgetData.isEnabled)  
          .closest('div').removeClass('sp-hide-is-enabled');
      
      // Display items.
      var items = widgetData.items;
      $.each(items, function(index, item) {
        $.each(item, function(key, value) {
          switch (key) {
            case 'page':
              $('.sp-widget-item [name="page"]')[index].value = value;
              break;
              
            case 'personImage':
              if ('' !== value) {
                $('.sp-widget6__person-image')[index]
                    .className = 'sp-widget6__person-image';
                
                $('.sp-widget6__person-image')[index]
                    .style.backgroundImage = 'url(' + value + ')';
                
                $('.sp-widget-item [name="person-image"]')[index].value = value;
              }
              break;
              
            case 'personName':
              $('.sp-widget-item [name="person-name"]')[index].value = value;
              break;
            
            case 'personTitle':
              $('.sp-widget-item [name="person-title"]')[index].value = value;
              break;
            
            case 'testimonial':
              $('.sp-widget-item [name="testimonial"]')[index].value = value;
              break;            
          }
        });
        
        if (index < items.length - 1) {
          sp.widgets.widget6.addItem();
        }
      });
    },
    
    /**
     * Save testimonials from the widget setting panel.
     */
    saveItems: function(fileHash) {
      var widgetSetting = {
        apiVersion: '1.0',
        data: {
          fileHash: fileHash,
          widgetId: 6,
          isEnabled: $('#sp-widget6--is-enabled').prop('checked'),
          items: []
        }
      };
      
      /* Validation */
      var validationCode = 0;
      var items = [];
      var itemsPages = [];
      $('#sp-tab-6 .sp-widget-item').each(function() {
        
        /* Validate Item */
        var jqueryObjectsToValidate = [
            $(this).find('[name="page"]'),
            $(this).find('[name="person-name"]'),
            $(this).find('[name="person-title"]'),
            $(this).find('[name="testimonial"]')
        ];
        
        var emptyJqueryObects =
            sp.data.getEmptyJqueryObjects(jqueryObjectsToValidate);
        
        // All item properties are empty.
        if (jqueryObjectsToValidate.length === emptyJqueryObects.length) {
          
            // Items have been saved at least once.
            if (! $('#sp-widget6--is-enabled').parent().hasClass('sp-hide-is-enabled')) {
              sp.error.handleError('You must fill all fields.');
              validationCode = 1;
            }
            return false;
            
        // At least one item property is empty.
        } else if (emptyJqueryObects.length > 0) {
          sp.error.handleError('You must fill all fields.');
          validationCode = 1;
          return false;
          
        // No item property is empty.
        } else {
          var page = parseInt($(this).find('[name="page"]').val());
          var personName = $(this).find('[name="person-name"]').val();
          var personImage = $(this).find('[name="person-image"]').val();
          var personTitle = $(this).find('[name="person-title"]').val();
          var testimonial = $(this).find('[name="testimonial"]').val();
          
          if (-1 !== itemsPages.indexOf(page)) {
            sp.error.handleError('You can only enter one testimonial per page.');
            validationCode = 1;
            return false;
          }
          itemsPages.push(page);
          
          /* Save Item */
          var item = {
            page: page,
            personImage: personImage,
            personName: personName,
            personTitle: personTitle,
            testimonial: testimonial
          };
          
          items.push(item);
          validationCode = 2;
        }
      });
      
      if (0 === validationCode || 2 === validationCode) {
        widgetSetting.data.items = items;
        
        // Set isEnabled to true if items are valid and saved for the first time.
        if (2 === validationCode
            && $('#sp-widget6--is-enabled').parent().hasClass('sp-hide-is-enabled')) {
          
          widgetSetting.data.isEnabled = true;
        }
        
        return widgetSetting;
      } else {
        return undefined;
      }
    }
  },
  
  widget7: {
    init: (function() {
      // Set person image.
      $(document).on('change', '.sp-widget7__input-form-image', function() {
        var $file = $(this);
        var file = this.files[0];
        var reader = new FileReader();

        reader.addEventListener('load', function() {
          $file.closest('.sp-widget-item').find('.sp-widget7__form-image')
              .removeClass('fa fa-picture-o fa-4x')
              .css('background-image', 'url(' + reader.result + ')');
          
          $file.closest('.sp-widget-item').find('[name="formImage"]')
              .val(reader.result);
        }, false);
        
        if (file) {
          reader.readAsDataURL(file);
        }
      });
      
      $('[name="formSelectType"]').on('change', function(event) {
        switch($(event.currentTarget).attr('id')) {
          case 'sp-widget7__upload-form-radio':
            $('.sp-widget7__image-elements').hide();
            $('.sp-widget7__form-elements').show();
            $('.sp-widget7__form-image').parent().prev('label').text('Company Logo');
            break;
            
          case 'sp-widget7__upload-image-radio':
            $('.sp-widget7__image-elements').show();
            $('.sp-widget7__form-elements').hide();
            $('.sp-widget7__form-image').parent().prev('label').text('Image');
            break;
        }
      });
    })()
  },
  
  widget8: {
    html: $('#sp-tab-8 .sp-widget-item').html(),
    addItem: function() {
      $('#sp-tab-8 .container-fluid').append(
          '<div class="sp-widget-item">' +
            sp.widgets.widget8.html +
          '</div>'
      );
      
      // Set Code Location radio name attribute.
      var codeLocationOptions = ['beforeClosingHead', 'afterOpeningBody', 'beforeClosingBody'];
      $('#sp-tab-8 .sp-widget-item').each(function(index, item) {
        $(item)
          .find('[name*="codeLocation"]').attr('name', 'codeLocation-' + index)
          .each(function(ind) {
            $(this).attr('data-code-location-' + index, codeLocationOptions[ind]);
          });
      });
    },
    init: (function() {
      
      // Add.
      $(document).off('click', '#sp-tab-8 .sp-widget__add-item').on('click', '#sp-tab-8 .sp-widget__add-item', function() {
        sp.widgets.widget8.addItem();
      });
      
      // Delete.
      $(document).on('click', '#sp-tab-8 .sp-widget__delete-item', function() {
        $(this).closest('.sp-widget-item').remove();
      });
    })(),
    
    validate: function() {
      var isEmpty = false;
      
      $('#sp-tab-8 .sp-widget-item').each(function() {
        if ('' === $(this).find('textarea').val()) {
          isEmpty = true;
        } else {
          isEmpty = false;
        }
      });
      
      return isEmpty;
    }
  }
};

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
          if (widget.data.items.length > 0) {
            displayVideoSettings(widget.data);
          }
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
        	
        case 5:
          if (widget.data.items.length > 0) {
            displayWidget5(widget.data);
          }
          break;
          
        case 6:
          if (widget.data.items.length > 0) {
            sp.widgets.widget6.displayItems(widget.data);
          }
          break;
          
        case 7:
          if (widget.data.items.length > 0) {
            displayWidget7(widget.data);
          }
          break;
          
        case 8:
          if (widget.data.items.length > 0) {
            displayWidget8(widget.data);
          }
          break;
      }
    });
    
    /**
     * Display a Video widgets settings in the modal window.
     * 
     * Check for items.length  > 0 - If widget was once defined but then deleted, a widgetId
     * will still exist in the DB although there will be no settings available.
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
      $('[name="spWidget3FormMessage"]').val(widget.items[0].formMessage);
    }
    
    function displayLikeWidgetSettings(widget) {
    	$('[name="like-widget-is-enabled"]').prop('checked', widget.isEnabled),
    	$('[name="like-widget-counter-is-enabled"]').prop('checked', widget.items[0].isCounterEnabled);
    }
    
    
    /**
     * Display settings for Widget 5 - Hopper Widget
     * 
     * Check for items.length  > 0  - If widget was once defined but then deleted, a widgetId
     * will still exist in the DB although there will be no settings available.
     * 
     * @param {object} widget - The settings for the Hopper widget.
     */
    function displayWidget5(widget) {
      
      for (var i = 0; i < widget.items.length - 1; i++) {
        $('#sp-hopper-customize__container').append(
            '<div class="row sp-hopper-widget__row">' + 
              sp.viewerWidgetsModal.hopperHtml + 
            '</div>'      
        );
      }
      
      $('[name="hopper-widget-is-enabled"]')
          .prop('checked', widget.isEnabled)
          .closest('div').removeClass('sp-hide-is-enabled');
      
      $('.sp-hopper-widget__row').each(function(index) {
        $(this).find('[data-item-setting]').each(function() {
          $(this).val(widget.items[index][$(this).attr('data-item-setting')]);
        });
      });
    }
    
    /**
     * Display settings for the Form widget.
     * 
     * @params {object} widget - The form widget settings.
     */
    function displayWidget7(widget) {
      $('[name="widget7-is-enabled"]')
        	.prop('checked', widget.isEnabled)
        	.closest('div').removeClass('sp-hide-is-enabled');
      
      $('#sp-tab-7 [name*="form"]').each(function(index) {
        if ($(this).attr('name') === 'formImage') {
					$('.sp-widget7__form-image')
            .removeClass('fa fa-picture-o fa-4x')
            .css('background-image', 'url(' + widget.items[0][$(this).attr('name')] + ')');
        }
        
        if ('formSelectType' === $(this).attr('name')) {
          $('[data-widget-type=' + widget.items[0][$(this).attr('name')] + ']')
            .prop('checked', true)
            .change();
        }
        
        if ('formWidgetPlacement' === $(this).attr('name')
            && typeof widget.items[0][$(this).attr('name')] !== 'undefined') {
          $('[data-widget-placement=' + widget.items[0][$(this).attr('name')] + ']')
            .prop('checked', true)
            .change();
        }
        
        $(this).val(widget.items[0][$(this).attr('name')]); 
      });
    }
    
    function displayWidget8(widget) {
      for (var i = 0; i < widget.items.length - 1; i++) {
        sp.widgets.widget8.addItem();
      }
      
      $('[name="sp-widget8__is-enabled"]')
        .prop('checked', widget.isEnabled)
        .closest('div').removeClass('sp-hide-is-enabled');
      
      $('#sp-tab-8 .sp-widget-item').each(function(index) {
        $(this).find('[name*="code"]').each(function() {
          if ('codeLocation' === $(this).attr('name')) {
            if ($(this).val() === widget.items[index][$(this).attr('name')]) {
              $(this).prop('checked', true);
            }
          } else {
            $(this).val(widget.items[index][$(this).attr('name')]);
          }
        });
      });
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
    
    $('.sp-viewer-widgets-modal input').removeClass('sp-widget-form-error');

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
    
    if (! sp.viewerWidgetsModal.isInputEmpty(5)
        || ! $('[name="hopper-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
      settings.push(sp.viewerWidgetsModal.saveWidget5(fileHash));
    }
    
    var widget6Settings = sp.widgets.widget6.saveItems(fileHash);
    if (typeof widget6Settings === 'undefined') {
      settings.push(undefined);
    } else if (widget6Settings.data.items.length > 0 ) {
      settings.push(widget6Settings);
    }
    
    if (! sp.viewerWidgetsModal.isInputEmpty(7)
        || ! $('[name="widget7-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
      settings.push(sp.viewerWidgetsModal.saveWidget7(fileHash));
    }
    
    if (! sp.widgets.widget8.validate()
        || ! $('[name="sp-widget8__is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
      settings.push(sp.viewerWidgetsModal.saveWidget8(fileHash));
    }
    
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
      $('.tabs-container').contents().hide();
      $('#sp-save-widgets-settings__button, #sp-save-test-widgets-settings__button')
          .attr('disabled', 'true');
      $('#' + targetId).text('Saving...');
      $('.sp-widgets-customisation__spinner').addClass('sp-widgets-customisation__spinner-show');
      
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
      
      // Return modal content to pre-saving state.
      $('.tabs-container').contents().show();
      $('#sp-save-widgets-settings__button, #sp-save-test-widgets-settings__button')
          .attr('disabled', 'false');

      if (targetId === 'sp-save-widgets-settings__button') {
        $('#' + targetId).text('Save');
      } else {
        $('#' + targetId).text('Save & Preview');
      }
      $('.sp-widgets-customisation__spinner').removeClass('sp-widgets-customisation__spinner-show');
      
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
   * class .sp-widget-form-error which sets the border color to #1ab394.
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
      $('[name="calendly-widget-username"]').addClass('sp-widget-form-error');
    }
    
    if ('' === $('[name="calendly-widget-button-text"]').val()) {
      sp.error.handleError('You must fill the field.');
      $('[name="calendly-widget-button-text"]').addClass('sp-widget-form-error');
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
      $('[name="question-widget-text"]').addClass('sp-widget-form-error');
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
            	buttonText: $('[name="question-widget-text"]').val(),
            	formMessage: $('[name="spWidget3FormMessage"]').val()
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
   * Validate then save Hopper widget settings.
   * 
   * If one of the fields are empty, it returns undefined, otherwise it returns 
   * widget5 which contains the settings for this widget.
   * 
   * @param fileHash
   * @returns widget5 || undefined
   */
  saveWidget5: function(fileHash) {
    
    if ($('[name="hopper-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
      $('[name="hopper-widget-is-enabled"]').prop('checked', true);
    }
    
    var widget5 = {
        apiVersion: '1.0',
        data: {
          fileHash: fileHash,
          widgetId: 5,
          isEnabled: $('[name="hopper-widget-is-enabled"]').prop('checked')         
        }
    };
    
    var items = [];
    var isHopperSettingEmpty = false;
    $('.sp-hopper-widget__row').each(function() {
      
      var item = {};
      $(this).find('[data-item-setting]').each(function() {
        switch($(this).attr('data-item-setting')) {
          
          case 'hopperText':
          case 'hopperPage':
            if ('' === $(this).val()) {
              sp.error.handleError('You must fill the field.');
              $(this).addClass('sp-widget-form-error');
              sp.viewerWidgetsModal.openErrorTab();
              isHopperSettingEmpty = true;
              return false;
            } else {
              item[$(this).attr('data-item-setting')] = $(this).val();
            }
            break;
        }
      });
      
      items.push(item);
    });
    
    widget5.data.items = items;
    
    if (! isHopperSettingEmpty) {
      return widget5;
    } else {
      return undefined;
    }
  },
  
  
  /**
   * Form widget.
   * 
   * Save params for the form widget.
   * 
   * @param fileHash
   * @returns {object} widget7 - The widget data.
   */
  saveWidget7: function(fileHash) {
    if ($('[name="widget7-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
      $('[name="widget7-is-enabled"]').prop('checked', true);
    }
    
    var widget7 = {
        apiVersion: '1.0',
        data: {
          fileHash: fileHash,
          widgetId: 7,
          isEnabled: $('[name="widget7-is-enabled"]').prop('checked'),
          items: []
        }
    };
    
    var isWidget7SettingEmpty = false;
    var item = {};
    var fieldsToValidate = [];
    
    switch($('[name="formSelectType"]:checked').attr('id')) {
      case 'sp-widget7__upload-form-radio':
        fieldsToValidate = $('#sp-tab-7 .form-group:not(.sp-widget7__image-elements)').find('input');
        break;
        
      case 'sp-widget7__upload-image-radio':
        fieldsToValidate = $('#sp-tab-7 .form-group:not(.sp-widget7__form-elements)').find('input');
        break;
    }
    
    $.each(fieldsToValidate, function() {
      
      if ('' === $(this).val() 
        && $(this).attr('name') !== 'formSelectType'
        && $(this).attr('name') !== 'formImage'
        && $(this).attr('name') !== 'formImageMaxWidth'
        && $(this).attr('name') !== 'formImageMaxHeight'
        && $(this).attr('name') !== 'formWidgetPlacement'
        && $(this).attr('name') !== 'formTitle'
        && $(this).attr('type') !== 'file'
        && $(this).attr('name') !== 'formSuccess') {
        
        sp.error.handleError('You must fill the field.');
        $(this).addClass('sp-widget-form-error');
        sp.viewerWidgetsModal.openErrorTab();
        isWidget7SettingEmpty = true;
      } else if ($(this).attr('name') === 'formSelectType') {
        item[$(this).attr('name')] = $('[name="formSelectType"]:checked').attr('data-widget-type');
      } else if ($(this).attr('name') === 'formWidgetPlacement') {
        item[$(this).attr('name')] = $('[name="formWidgetPlacement"]:checked').attr('data-widget-placement');
      } else if (typeof $(this).attr('name') !== 'undefined') {
        item[$(this).attr('name')] = $(this).val();
      }
    });
    
    widget7.data.items.push(item);
    
    if (! isWidget7SettingEmpty) {
      return widget7;
    } else {
      return undefined;
    }
  },
  
  /**
   * Save settings for Code Widget
   * 
   * @param {string} fileHash - The file hash.
   * @returns {object} widget8 - Code Widget settings.
   */
  saveWidget8: function(fileHash) {
    if ($('[name="sp-widget8__is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
      $('[name="sp-widget8__is-enabled"]').prop('checked', true);
    }
    
    var widget8 = {
        apiVersion: '1.0',
        data: {
          fileHash: fileHash,
          widgetId: 8,
          isEnabled: $('[name="sp-widget8__is-enabled"]').prop('checked'),
          items: []
        }
    };
    
    var isWidget8SettingEmpty = false;
    
    $('#sp-tab-8 .sp-widget-item').each(function(index) {
      var item = {};
      
      $(this).find('[name*=code]').each(function() {
        switch($(this).attr('name')) {
          case 'codeContent':
            if ('' === $(this).val()) {
              sp.error.handleError('You must fill the field.');
              $(this).addClass('sp-widget-form-error');
              sp.viewerWidgetsModal.openErrorTab();
              isWidget8SettingEmpty = true;
            } else {
              item[$(this).attr('name')] = $(this).val();
            }
            break;
            
          case 'codeLocation':
            if ($(this).is(':checked')) {
              item[$(this).attr('name')] = $(this).val();
            }
            break;
            
          case 'codeDescription':
            item[$(this).attr('name')] = $(this).val();
            break;
        }
      });
      
      widget8.data.items.push(item);
    });
    
    if (! isWidget8SettingEmpty) {
      return widget8;
    } else {
      return undefined;
    }
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
	            $(this).addClass('sp-widget-form-error');
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
	            $(this).addClass('sp-widget-form-error');
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
		            $(value2).addClass('sp-widget-form-error');
		            sp.error.handleError('You must fill the field.');
		            sp.viewerWidgetsModal.openErrorTab();
		            isNumberFieldEmpty = true;
		          } else if (pagesOverlapping) {
		            var errorNumber = $(this).val();
		            $(this).closest('#sp-video-customization-options-container').find('[name="video-widget-page-start"]')
		            	.each(function(index, value) {
			              if ($(value).val() === errorNumber) {
			                  $(value).addClass('sp-widget-form-error');
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
      if ($(this).hasClass('sp-widget-form-error')) {
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
    $('#sp-tab-' + widgetId).find('input[type="text"]').each(function(index, input) {
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
            + '<input type="number" placeholder="e.g. 1" data-video="videoPageStart" class="sp-video-widget" name="video-widget-page-start" min="1" data-key-id="7" data-key-type="integer">'
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
   * Convert YouTube, Vimeo or Barclays video link to embed link.
   * 
   * @param {string} videoSource - The video URL.
   * 
   * @return an [] - Whether the checkbox checking whether the URL is a youtube video is checked
   * and the videoSource.
   */
  handleVideoSource: function(videoSource) {
    if (typeof videoSource !== 'undefined') {
      var domain = null;
      
      if (videoSource.indexOf("//") > -1) {
        domain = videoSource.split('/')[2];
      } else {
        domain = videoSource.split('/')[0];
      }
      
      domain = domain.split('.');
      
      // e.g. If address is www.media.barclays.co.uk
      if (domain.length > 3) {
        domain = domain[domain.length - 3];
        
      // e.g. If address is www.youtube.com
      } else {
        domain = domain[domain.length - 2];
      }
      
      if ('youtube' == domain) {
        $('[name="video-widget-is-youtube-video"]').prop('checked', true);
      } else if ('youtu' === domain) {
      	$('[name="video-widget-is-youtube-video"]').prop('checked', true);
    		videoSource = 'https://www.youtube.com/embed/' + videoSource.split('/')[3];
      } else {
        $('[name="video-widget-is-youtube-video"]').prop('checked', false);
      }
      
      // Allow for saving a regular YouTube, Vimeo, or Barclays link, and not only an embed one.
      if (typeof domain !== 'undefined') {
        switch(domain) {
          case 'youtube':
            if (videoSource.indexOf('?') > -1) {
              videoSource = 'https://www.youtube.com/embed/' + getParameterByKey('v', videoSource);
            }
            break;
            
          case 'vimeo':
            
            // Video source id is always last part of Vimeo link after the final '/'.
            videoSource = 'https://player.vimeo.com/video/' + videoSource.split('/')[videoSource.split('/').length - 1];
            break;
          
          case 'barclays':
            videoSource = '//www.media.barclays.co.uk/player/?id=' + getParameterByKey('?', videoSource);
            break;
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

/**
 * Event handlers for adding and deleting widget rows in the 'Customize' modal.
 */
(function addDeleteRows() {
  sp.viewerWidgetsModal.hopperHtml = $('.sp-hopper-widget__row').html();
  
  // Hopper.
  $(document).off('click', '.sp-add-hopper-widget__a').on('click', '.sp-add-hopper-widget__a', function() {
    if ($('.sp-hopper-widget__row').length < 12) {
      $('#sp-hopper-customize__container').append(
          '<div class="row sp-hopper-widget__row">' + 
            sp.viewerWidgetsModal.hopperHtml + 
          '</div>'      
      );
    } else {
      sp.error.handleError('You can add a maximum of 12 hoppers.');
    }
  });

  $(document).on('click', '.sp-delete-hopper-widget__a', function() {
      $(this).closest('.row').remove();
  });
  
  // Video.
  $(document).off('click', '.sp-add-video-widget__a').on('click', '.sp-add-video-widget__a', function() {
    sp.viewerWidgetsModal.renderAddVideoRows();
  });
  
  $(document).on('click', '.sp-delete-video-widget__a', function() {
    $(this).closest('.row').remove();
  });
})();


$('.sp-video-link-tooltip').tooltip({delay: {show: 100, hide: 200}, placement: 'top'});
