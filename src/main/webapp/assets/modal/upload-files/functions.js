var sp = sp || {};

sp.uploadFiles = {
  files: [],
  action: {
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
        sp.uploadFiles.upload(sp.uploadFiles.action.upload);
      } else {
        sp.uploadFiles.upload(sp.uploadFiles.action.update);
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
  
  upload: function(action) {
    var data = new FormData();
    data.append('salesmanEmail', Cookies.get('SalesmanEmail'));
    data.append('action', action);
    
    if ('update' === action) {
      data.append('updateFileHash', sp.file.fileHash);
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
    if ('upload' === action) {
      $('#sp-modal-upload-files .container-fluid').hide();
      successVerb = 'uploaded';
    } else {
      $('#sp-modal-update-file .container-fluid').hide();
      successVerb = 'updated';
    }
    
    $('.sk-spinner').show();
    $('.sp-file__upload-update-file-button').removeClass('btn-primary').addClass('btn-default').text('Uploading...');
    
    $.ajax({
      url: 'upload-file',
      type: 'POST',
      data: data,
      cache: false,
      processData: false,
      contentType: false,
      success: function(result) {
        $('button[data-dismiss="modal"]').click();
        $('.sk-spinner').hide();
        
        if (result.flag > 0) {
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