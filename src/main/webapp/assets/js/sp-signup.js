/**
 * Add a salesman to the DB.
 */

var sp = sp || {};

sp = {
  signup: {
    init: function() {
      $(document).ready(function() {
         sp.signup.newUser();
      });
    },
    
    addFile: (function() {
      $('input[type=file]').on('change', function(event) {
        if(!event) {
          event = window.event;
        }
        sp.signup.file = event.target.files;
      });
    })(),
    
    styleDemoBox: (function () {
      // init style
      $('.sp-viewer-choice-demo-toolbar').css('background-color',
          $('[name="viewer_toolbar_background"]:checked').attr('data-color'));
      $('.sp-viewer-choice-demo-button').css('background-color',
          $('[name="viewer_toolbar_cta_background"]:checked').attr('data-color'));
      
      $('[name="viewer_toolbar_background"], [name="viewer_toolbar_cta_background"]')
        .on('change', function () {
          $('.sp-viewer-choice-demo-toolbar').css('background-color',
              $('[name="viewer_toolbar_background"]:checked').attr('data-color'));
        
          $('.sp-viewer-choice-demo-button').css('background-color',
              $('[name="viewer_toolbar_cta_background"]:checked').attr('data-color'));
          
          if ($('[data-color="#293846"').is(':checked')){
            $('#sp-toolbar-desc__p').css('color', '#fff');
          } else {
            $('#sp-toolbar-desc__p').css('color', '#293846');
          }
        });
    })(),
    
    newUser: function() { 
      $('#sp-signup__form').submit(function (event) {
        if (!event) {
          event = window.event;
        }
        event.stopPropagation();
        event.preventDefault();
        
        var formData = new FormData();
        formData.append('action', 'setSalesman');
         
         $('input[type="radio"]:checked').each(function (i, v){
           formData.append($(v).attr('name'), $(v).attr('data-color'));
         });
         
         $('input[type="checkbox"]').each(function (i, v) {
           formData.append($(v).attr('name'), $(v).is(':checked') ? 'true': 'false');
         });
         
         $('input[type="text"]').each(function (i, v) {
           formData.append($(v).attr('name'), $(v).val());
         });
         
         formData.append('email-client', $('select[name="email-client"]').val());
         formData.append('viewer_toolbar_logo_image', sp.signup.file === undefined ? null: sp.signup.file[0]);
         formData.append('password', $('input[type="password"][name="password"]').val());
         formData.append('magic', $('input[type="password"][name="magic"]').val());
         formData.append('email', $('input[type="email"]').val());
         
        $.ajax({
          type: 'POST',
          url: 'create-user',
          contentType : false,
          processData: false,
          cache: false,
          data: formData,
        }).done(function(data) {
          switch (data.statusCode) {
            case 200:
              location.href = 
                  'mailto:'   + $('[name="email"]').val()
                + '?subject=' + encodeURIComponent('Welcome to SlidePiper - Beta Test License!')
     
                + '&body='    + encodeURIComponent('Dear ' + $('[name="first-name"]').val() + ',\r\n\r\n'

                              + 'I would like to personally welcome you as a SlidePiper Beta user. We look forward to working with you to understand and customize this tool to give you more value.\r\n\r\n'
                    
                              + 'With this beta version you will be able to send tracked documents that have call to action buttons and chat.\r\n'
                              + 'You can then view the analytics that are generated from the viewing of the document. There will be updates giving more features as we finish the development and testing.\r\n\r\n'
                    
                              + 'Your username is:\r\n'
                              + $('[name="email"]').val() + '.\r\n\r\n'
                              + 'Your initial Password is:\r\n'
                              + $('[name="password"]').val() + '\r\n\r\n'
                              + 'To login follow this link:\r\n'
                              + 'http://www.slidepiper.com/login.html\r\n\r\n'
                    
                              + 'I have made a 3 minute video to walk you through the product and help get you started.\r\n'
                              + 'See this link: https://youtu.be/tk-_PgWTASU\r\n\r\n'
                                 
                              + 'Please feel free to reach out with any questions or support that you need.\r\n\r\n'  
                    
                              + 'Best Regards\r\n\r\n'
                    
                              + 'Sivan Bender - Founder & CEO\r\n'
                              + '054-681-5095\r\n'
                              + 'sivanb@slidepiper.com'
                  );
              break;

            case 100:
              alert('The user ' + $('[name="email"]').val() + ' already exists.');
              break;
              
            case 101:
              alert('The user was not added. Magic inccorect.');
              break;
              
            default:
              alert('The user was not added. Error code: ' + data.statusCode + '.');
          }

          // Reset form values.
          $('input:not([type=submit])').val('');
          $('select').val('gmail');
        }).fail(function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus + ': ' + errorThrown);
        });
        event.preventDefault();
      });
    },
    
    toggleSettingsBtns: (function () {
      $('#sp-cta2-settings').hide();
      $('#sp-cta1-settings').hide();
      
      $('[name="viewer_toolbar_cta2_is_enabled"]').on('click', function () {
        $('#sp-cta2-settings').toggle();
        if ($(this).is(':checked')){
          $('[name="viewer_toolbar_cta2_text"],[name="viewer_toolbar_cta2_link"]')
            .attr('required', 'true');
        } else {
          $('[name="viewer_toolbar_cta2_text"],[name="viewer_toolbar_cta2_link"]')
          .removeAttr('required');
        }
      });
      $('[name="viewer_toolbar_cta1_is_enabled"]').on('click', function () {
        $('#sp-cta1-settings').toggle();
        if ($(this).is(':checked')){
          $('[name="viewer_toolbar_cta1_text"],[name="viewer_toolbar_cta1_link"]')
            .attr('required', 'true');
        } else {
          $('[name="viewer_toolbar_cta1_text"],[name="viewer_toolbar_cta1_link"]')
          .removeAttr('required');
        }
      });
    })(),
  }
};

sp.signup.init();