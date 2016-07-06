sp.viewerToolbar = {
    init: function() {
      $.getScript('assets/js/plugins/spectrum/spectrum.js', function () {
        sp.viewerToolbar.getSettings();
      });
      $('#sp-toolbar-settings__form').submit(function (event) {
        sp.viewerToolbar.postSettings(event);
      });
    },
    
    getSettings: function () {
      $.ajax({
        url: 'customize-navbar',
        type: 'get',
        cache: false,
        data: {salesman: sp.config.salesman.email},
        success: function (data) {
          $.each(data['data'][0], function (key, value) {
            if (value.slice(0, 1) === '#' || value.slice(0, 3) === 'rgb' || value === 'transparent') {
              if (value === 'transparent') {
                $('[name="viewer_toolbar_cta_is_transparent"]').prop('checked', true);
              }
              $('[name="'+ key +'"]')
                .spectrum({
                  appendTo: '#sp-toolbar-settings__modal',
                  chooseText: 'Choose',
                  cancelText: 'Cancel',
                  preferredFormat: 'hex',
                  showAlpha: true,
                  showInput: true,
                })
                .val(value)
                .attr('data-color', value)
                .spectrum('set', value);
            } else if (value === 'true') {
                $('[name="'+ key +'"]').prop('checked', true);
                $('#sp-cta' + key.split('_')[2].slice(-1) + '-settings').show();
            } else {
              $('[name="'+ key +'"]').val(value);
            }
          });
          sp.viewerToolbar.styleDemoBox();
        }
      });
    },
    
    postSettings: function(event) { 
      if (!event) {
        event = window.event;
      }
      event.stopPropagation();
      event.preventDefault();
      
      var formData = new FormData();
      formData.append('action', 'setToolbarSettings');
      formData.append('salesman', sp.config.salesman.email);
       
       $('.sp-color-picker').each(function (ind, val){
         formData.append($(val).attr('name'), $(val).attr('data-color'));
       });
       
       $('input[type="checkbox"]').each(function (ind, val) {
         formData.append($(val).attr('name'), $(val).is(':checked') ? 'true': 'false');
       });
       
       $('#sp-toolbar-settings__modal input[type="text"]:not(.sp-input, .sp-color-picker)').each(function (ind, val) {
         formData.append($(val).attr('name'), $(val).val());
       });
       
       formData.append('viewer_toolbar_logo_image', sp.viewerToolbar.logo === undefined ? null: sp.viewerToolbar.logo[0]);
       
      $.ajax({
        type: 'POST',
        url: 'customize-navbar',
        contentType : false,
        processData: false,
        cache: false,
        data: formData,
      }).done(function(data) {
        switch (data.statusCode) {
          case 200:
            swal('Success!', 'Your settings have been udpated', 'success');
            break;

          case 0:
            swal('Error', 'Something went wrong. Your settings weren\'t saved.', 'error');
        }
        $('.close').click();
      }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus + ': ' + errorThrown);
      });
      event.preventDefault();
    },
    
    styleDemoBox: function () {
      $('.sp-viewer-choice-demo-toolbar').css('background-color',
          $('[name="viewer_toolbar_background"]').attr('data-color'));
      
      $('.sp-viewer-choice-demo-button').css('background-color',  $('[name="viewer_toolbar_cta_background"]').attr('data-color'));
      
      $('#sp-toolbar-desc__p').css('color', $('[name="viewer_toolbar_text_color"]').attr('data-color'));
      $('#sp-cta-button-desc__p').css('color', $('[name="viewer_toolbar_cta_text_color"]').attr('data-color'));
      
      $('[name="viewer_toolbar_cta_background"]').spectrum('set',
          $('[name="viewer_toolbar_cta_background"]').attr('data-color'));
    },
    
    prepareDemoBox: (function () {
      $('[name="viewer_toolbar_background"]').on('change', function () {
        $('[name="viewer_toolbar_background"]').attr('data-color', $('[name="viewer_toolbar_background"]').val());
        sp.viewerToolbar.styleDemoBox();
      });
      $('[name="viewer_toolbar_cta_background"]').on('change', function () {
        $('[name="viewer_toolbar_cta_background"]').attr('data-color', $('[name="viewer_toolbar_cta_background"]').val());
        sp.viewerToolbar.styleDemoBox();
      });
      $('[name="viewer_toolbar_text_color"]').on('change', function () {
        $('[name="viewer_toolbar_text_color"]').attr('data-color', $('[name="viewer_toolbar_text_color"]').val());
        sp.viewerToolbar.styleDemoBox();
      });
      $('[name="viewer_toolbar_cta_text_color"]').on('change', function () {
        $('[name="viewer_toolbar_cta_text_color"]').attr('data-color', $('[name="viewer_toolbar_cta_text_color"]').val());
        sp.viewerToolbar.styleDemoBox();
      });
    })(),
   
    addFile: (function() {
      $('input[type=file]').on('change', function(event) {
        if (!event) {
          event = window.event;
        }
        sp.viewerToolbar.logo = event.target.files;
      });
    })(),
    
    transparentCtaButtonHandler: (function () {
      $('[name="viewer_toolbar_cta_is_transparent"]').on('change', function () {
        var $ctaBackground = $('[name="viewer_toolbar_cta_background"]');
        if ($(this).is(':checked')) {
          $ctaBackground
            .val('transparent')
            .spectrum('set', 'transparent')
            .attr('data-color', 'transparent');
        } else {
          $ctaBackground
            .spectrum('set', '#1B1464')
            .attr('data-color', '#1B1464');
        }
        sp.viewerToolbar.styleDemoBox();
      });
      
      $('[name="viewer_toolbar_cta_background"]').on('change.spectrum', function () {
        $('[name="viewer_toolbar_cta_is_transparent"]').prop('checked', false);
      });
    })(),
    
    toggleCtaSettingsBtns: (function () {
      for (var i = 1; i <= 3; i++) {
        (function (i) {
          $('#sp-cta'+ i +'-settings').hide();
          $('[name="viewer_toolbar_cta'+ i +'_is_enabled"]').on('click', function () {
            $('#sp-cta'+ i +'-settings').toggle();
            if ($(this).is(':checked')) {
              $('[name="viewer_toolbar_cta'+ i +'_text"],[name="viewer_toolbar_cta'+ i +'_link"]')
                .attr('required', 'true');
            } else {
              $('[name="viewer_toolbar_cta'+ i +'_text"],[name="viewer_toolbar_cta'+ i +'_link"]')
              .removeAttr('required');
            }
          });
        })(i);
      };
   })(),
};

sp.viewerToolbar.init();