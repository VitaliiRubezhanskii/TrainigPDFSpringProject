var sp = sp || {};

sp.uploadFiles = {
  files: [],
  action: {
    update: 'update',
    upload: 'upload',
  },
  init: (function() {
    var uploadUpdateButton = $('.sp-file__upload-update-file-button');

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

  })(),
  
  upload: function(action) {
    var formData = new FormData();
    var url = '/api/v1/documents';
    var type = 'POST';

    if ('upload' === action) {
        $.each(sp.uploadFiles.files, function(i) {
            formData.append('files[]', sp.uploadFiles.files[i]);
        });
    } else if ('update' === action) {
        formData.append('file', sp.uploadFiles.files[0]);
        url += '/' + sp.file.fileHash;
        type = 'PUT';
    }
    
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
      url: url,
      type: type,
      data: formData,
      cache: false,
      processData: false,
      contentType: false,
      beforeSend: function(xhr) {
          xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
      },
      success: function(data) {
          if (typeof data === 'string' && '<!DOCTYPE html>' === data.substring(0, 15)) {
              window.location = '/login';
          } else {
              $('button[data-dismiss="modal"]').click();
              $('.sk-spinner').hide();

              getFilesList('fileUploadDashboard');
              sp.uploadFiles.files = [];
              swal("Success!", "Your file was " + successVerb + "!", "success");
          }
      },
      error: function () {
        swal("Error!", "Your file was not " + successVerb + "!", "error");
      }
    });
  },    
};