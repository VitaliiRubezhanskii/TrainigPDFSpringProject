$(function() {
  parent.swal.disableConfirmButton();  
  
  $('.sp-next-section').click(function() {
    var sectionId = parseInt($(this).closest('section').attr('data-section-id'));
    console.log('Currently on section: ' + sectionId);
    
    var isFormValid = false;   
    
    switch (sectionId) {
      case 0:
        if ($('#form-' + sectionId).valid()) {
          isFormValid = true;
          $('.pagination-container').removeClass('hidden');
          
          $('#id').val($('#id-init').val());
          $('#first-name').val($('#first-name-init').val());
          $('#last-name, #last-name-partner').val($('#last-name-init').val());
          
          var mobileOperatorCode = ['050', '052', '054', '055', '057', '058'];
          if (mobileOperatorCode.indexOf($('#phone-operator-code-init').val()) > -1) {
            $('#phone-mobile-operator-code').val($('#phone-operator-code-init').val());
            $('#phone-mobile-number').val($('#phone-number-init').val());
          } else {
            $('#phone-home-operator-code').val($('#phone-operator-code-init').val());
            $('#phone-home-number').val($('#phone-number-init').val());
          }
          
          $('#email').val($('#email-init').val());
        }
        break;
        
      case 1:
        if ($('#form-' + sectionId).valid()) {
          isFormValid = true;
          if ('male' === $('[name="gender"]:checked').val()) {
            $('#retirement-age-male').show();
          } else {
            $('#retirement-age-female').show();
          }
        }
        break;
        
      default:
        if ($('#form-' + sectionId).valid()) {
          isFormValid = true;
        }
        break;
    }
    
    if (isFormValid) {
      // Section settings.
      $('section').hide();
      sectionId++;
      $('section[data-section-id="' + sectionId.toString() + '"]').show();
      
      // Pagination settings.
      $('.pagination li').removeClass('active');
      $('#pagination-' + sectionId.toString()).addClass('active');
    }
  });
  
  
  /* Form 1 Settings */
  $('#city').change(function() {
    $('#street').closest('.form-group').append(
      '<div id="street-loading">טוען...</div>'
    );
    
    var data = {
      resource_id: 'a7296d1a-f8c9-4b70-96c2-6ebb4352f8e3',
      filters: {'סמל_ישוב': $(this).val()},
      limit: 1000000000000
    };
    
    $.ajax({
      url: 'https://data.gov.il/api/3/action/datastore_search',
      method: 'POST',
      data: JSON.stringify(data)
    }).done(function(data) {
      $('#street-loading').remove();
      $('#street').empty();
      $.each(data.result.records, function(index, object) {
        $('#street').append(
          '<option value="' + object['סמל_רחוב'].replace(/"/g, '&quot;') + '">' + object['שם_רחוב'] + '</option>'
        );
      })
      console.log(data);
    });  
  });
  
  // Partner & Kids settings.
  $('[name="isHasPartner"], [name="isHasKids"]').change(function() {
    if ($('#is-has-partner-no').is(':checked')) {
      $('#partner').hide();
      
      if ($('#is-has-kids-no').is(':checked')) {
        $('#partner-no-kids-yes-container').hide();
        $('#partner-no-kids-no-container').show();
      } else if ($('#is-has-kids-yes').is(':checked')) {
        $('#partner-no-kids-no-container').hide();
        $('#partner-no-kids-yes-container').show();
      }
    } else {
      $('#partner-no-kids-no-container', '#partner-no-kids-yes-container').hide()
      $('#partner').show();
    }
  });
  
  // Beneficiaries settings.
  $('[name="beneficiaries"]').change(function() {
    if ($('#beneficiaries-new').is(':checked')) {
      $('#beneficiaries-container, #beneficiary-1').show();
    } else if ($('#beneficiaries-existing').is(':checked')) {
      $('#beneficiaries-container').hide();
    }
  });
  
  $('#beneficiary-add').click(function() {
    var beneficiariesCount = $('#beneficiaries .beneficiary:visible').length;
    if (beneficiariesCount <= 6) {
      beneficiariesCount++;
      $('#beneficiary-' + beneficiariesCount).show();
    }
  });
  
  $('#beneficiary-remove', function() {
    var beneficiariesCount = $('#beneficiaries .beneficiary:visible').length;
    $('#beneficiary-' + beneficiariesCount).hide();
  });
  
  
  /* Form 3 Settings */
  $('[name="career"]').change(function() {
    if ($('#career-employment').is(':checked')) {
      $('#independent').hide();
      $('#employer').show()      
    } else if ($('#career-independent').is(':checked')) {
      $('#employer').hide();
      $('#independent').show()
    }
  });
  
  $('#employer-name').change(function() {
    if ('0' !== $(this).val()) {
      $('#employer-hp').val($(this).val());
      $('#employer-hp').prop('readonly', true);
    } else {
      $('#employer-hp').val('');
      $('#employer-hp').prop('readonly', false);
    }
  });
  
  
  /* Form 4 Settings */
  $('[name="smoking"]').change(function() {
    if ($('#smoking-yes').is(':checked')) {
      $('#smoking-when-stopped-container').hide();
      $('#smoking-amount-container').show();
    } else {
      $('#smoking-amount-container').hide();
      $('#smoking-when-stopped-container').show();
    }
  });
  
  $('#medical-questionnaire-no-for-all').click(function() {
    $('.medical-questionnaire-no').prop('checked', true);
    $('#medical-questionnaire-2-yes-container').hide();
    $('#medical-questionnaire-3-yes-container').hide();
    $('#medical-questionnaire-4-yes-container').hide();
    $('#medical-questionnaire-5-yes-container').hide();
    $('#medical-questionnaire-6-yes-container').hide();
  });
  
  $('[name="medical-questionnaire-2"]').change(function() {
    if ($('#medical-questionnaire-2-yes').is(':checked')) {
      $('#medical-questionnaire-2-yes-container').show();
    } else {
      $('#medical-questionnaire-2-yes-container').hide();
    }
  });
  
  $('[name="medical-questionnaire-3"]').change(function() {
    if ($('#medical-questionnaire-3-yes').is(':checked')) {
      $('#medical-questionnaire-3-yes-container').show();
    } else {
      $('#medical-questionnaire-3-yes-container').hide();
    }
  });
  
  $('[name="medical-questionnaire-4"]').change(function() {
    if ($('#medical-questionnaire-4-yes').is(':checked')) {
      $('#medical-questionnaire-4-yes-container').show();
    } else {
      $('#medical-questionnaire-4-yes-container').hide();
    }
  });
  
  $('[name="medical-questionnaire-5"]').change(function() {
    if ($('#medical-questionnaire-5-yes').is(':checked')) {
      $('#medical-questionnaire-5-yes-container').show();
    } else {
      $('#medical-questionnaire-5-yes-container').hide();
    }
  });
  
  $('[name="medical-questionnaire-6"]').change(function() {
    if ($('#medical-questionnaire-6-yes').is(':checked')) {
      $('#medical-questionnaire-6-yes-container').show();
    } else {
      $('#medical-questionnaire-6-yes-container').hide();
    }
  });
  
  
  /* Form 5 Settings */
  $('[name="isTransferFunds"]').change(function() {
    if ($('#is-transfer-funds-yes').is(':checked')) {
      $('#transfer-funds-container, #fund-1').show();
    } else {
      $('#transfer-funds-container').hide();
    }
  });
  
  $('.fund-name').change(function() {
    $(this).closest('.fund').find('.fund-code').val($(this).val());
  });
  
  $('#fund-remove').click(function() {
    var fundsCount = $('#funds .fund:visible').length;
    $('#fund-' + fundsCount).hide();
  });
  
  var fund = $('#funds').html();
  $('#fund-add').click(function() {
    var fundsCount = $('#funds .fund:visible').length;
    if (fundsCount <= 5) {
      fundsCount++;
      $('#fund-' + fundsCount).show();
    }
  });
  
  
  /* Form 6 Settings */
  $('#is-confirm-statements').change(function() {
    sendFormButton();
  });
  
  
  
  /* jQuery Validation */
  jQuery.validator.addMethod('exactLength', function(value, element, param) {
    return this.optional(element) || value.length == param;
  });
  
  /*
  jQuery.validator.addMethod("isTotal100", function(value, element, param) {
    return this.optional(element) || value.length == param;
  });
  */
  
  jQuery.extend(jQuery.validator.messages, {
    email: 'כתובת מייל לא חוקית',
    exactLength: 'השדה צריך להיות בעל {0} תווים',
    maxlength: 'השדה צריך להיות עד  {0} תווים',
    minlength: 'השדה צריך להיות בעל יותר מ- {0} תווים',
    number: 'השדה יכול להכיל רק מספרים',
    required: 'נא למלא את השדה',
    isTotal100: 'סכום אחוז הקרבה שונה מ- 100'
    //lettersonly: 'השדה יכול להכיל רק אותיות'
  });
  
  
  /* Date Picker */
  $('#datetimepicker1, #datetimepicker2').datetimepicker({
    format: 'DD/MM/YYYY',
    icons: {
      date: "fa fa-calendar"
    },
    viewMode: 'years'
  });
  
  
  /* Signature Pad */
  var isSignaturePadClear = true;
  var canvas = document.querySelector('canvas');
  var signaturePad = new SignaturePad(canvas, {
    onEnd: function() {
      isSignaturePadClear = false;
      sendFormButton()
    }
  });
  
  $('#hag-signature--clear').click(function() {
    signaturePad.clear();
    isSignaturePadClear = true;
    sendFormButton();
  });
  
  function sendFormButton() {
    if ($('#is-confirm-statements').is(':checked') && ! signaturePad.isEmpty() && ! isSignaturePadClear) {
      parent.swal.enableConfirmButton();
    } else {
      parent.swal.disableConfirmButton();
    }
  }
});
