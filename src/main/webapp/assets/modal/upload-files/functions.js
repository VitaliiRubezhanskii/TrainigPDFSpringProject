var sp = sp || {};

sp.uploadFiles = {
  files: [],
  subAction: {
    update: 'update',
    upload: 'upload',
  },
  init: (function() {
    var uploadUpdateButton = $('.sp-file__upload-update-file-button');
    
    /*// Toggle file upload type.
    $('#sp-file__upload-choice input').click(function() {
      $('#sp-file__upload-form input').addClass('sp-file--input-hidden');
      $('[name="' + $(this).attr('data-upload-type') + '"]').removeClass('sp-file--input-hidden');
    });*/
    
    $(uploadUpdateButton).click(function() {
      if ($(this).attr('data-upload-update') === 'upload') {
        sp.uploadFiles.upload(sp.uploadFiles.subAction.upload);
      } else {
        sp.uploadFiles.upload(sp.uploadFiles.subAction.update);
      }
    });
    
    // Get file input & validate.
    $('input[type=file]').on('change', function(event) {
      
      // Fix for firefox bug not locating event.
      if(! event) {
        event = window.event;
      }
      
      sp.uploadFiles.files = event.target.files;
      
      if (sp.uploadFiles.files.length > 0) {
          $(uploadUpdateButton).removeAttr('disabled');
      } else {
        /*if (sp.uploadFiles.files.length === 0 && '' === $('.sp-file__dropbox-url').val()) {*/
          $(uploadUpdateButton).attr('disabled', true);
        /*}*/
      }
    });
    
    /*// Validate Dropbox text input.
    $('.sp-file__dropbox-url').keyup(function() {
      if ('' !== $(this).val()) {
        $(uploadUpdateButton).removeAttr('disabled');
      } else {
        if (sp.uploadFiles.files.length === 0 && '' === $(this).val()) {
          $(uploadUpdateButton).attr('disabled', true);
        }
      }
    });*/
  })(),
  
  upload: function(subAction) {
    var data = new FormData();
    data.append('salesmanEmail', Cookies.get('SalesmanEmail'));
    data.append('subAction', subAction);
    
    if ('update' === subAction) {
      data.append('fileHash', sp.file.fileHash);
    }
    
    // Send either files or dropbox URL.
    /*if ($('.sp-file__dropbox-url').is(':visible')) {
      $('.sp-file__dropbox-url').each(function() {
        if ('' !== $(this).val()) {
          data.append('fileUrl', $(this).val());
        }
      });
    } else {*/
      if (sp.uploadFiles.files.length > 0) {
        $.each(sp.uploadFiles.files, function(key, value) {
          data.append(key, value);
        });
      }
    /*}*/
    
    var successVerb;
    if ('upload' === subAction) {
      $('#sp-modal-upload-files .container-fluid').hide();
      successVerb = 'uploaded';
    } else {
      $('#sp-modal-update-file .container-fluid').hide();
      successVerb = 'updated';
    }
    
    $('.sk-spinner').show();
    $('.sp-file__upload-update-file-button').removeClass('btn-primary').addClass('btn-default').text('Uploading...');
    
    $.ajax({
      url: 'upload-files',
      type: 'POST',
      data: data,
      cache: false,
      processData: false,
      contentType: false,
      success: function(resultCode) {
        $('button[data-dismiss="modal"]').click();
        $('.sk-spinner').hide();
        
        if (resultCode === 1) {
          sp.file.getFilesList('fileUploadDashboard');
          sp.uploadFiles.files = [];
          swal("Success!", "Your file was " + successVerb + "!", "success");
        } else if (resultCode === 0) {
          swal("Error!", "Your file was not " + successVerb + "!", "error");
        }
      },
      error: function () {
        swal("Error!", "Your file was not " + successVerb + "!", "error");
      }
    });
  },    
};