$(function() {
  parent.swal.disableConfirmButton();  
  
  $('.sp-next-section').click(function() {
    var sectionId = parseInt($(this).closest('section').attr('data-section-id'));
    console.log('Currently on section: ' + sectionId);
    
    if (! $('#form-' + sectionId).valid()) {
      if (0 === $('#form-not-valid').length) {
        $(this).closest('.form-group').before('<div class="form-group has-error" id="form-not-valid"><label class="control-label">לא כל שדות החובה מלאים, ולכן לא ניתן לעבור למסך הבא</label></div>');
      }
      return false;
    } else {
      $('#form-not-valid').remove();
    }
    
    switch (sectionId) {
      case 0:
        $('.pagination-container').removeClass('hidden');
        
        $('#id').val($('#id-init').val());
        $('#first-name').val($('#first-name-init').val());
        $('#last-name').val($('#last-name-init').val());
        
        var mobileOperatorCode = ['050', '052', '054', '055', '057', '058'];
        if (mobileOperatorCode.indexOf($('#phone-operator-code-init').val()) > -1) {
          $('#phone-mobile-operator-code').val($('#phone-operator-code-init').val());
          $('#phone-mobile-number').val($('#phone-number-init').val());
        } else {
          $('#phone-home-operator-code').val($('#phone-operator-code-init').val());
          $('#phone-home-number')
            .val($('#phone-number-init').val())
            .rules( "add", {
              exactLength: 7,
              number:true,
              required: true
          });
        }
        
        $('#email').val($('#email-init').val());
        break;
        
      case 1:
        if ('male' === $('[name="gender"]:checked').val()) {
          $('#retirement-age-female').hide();
          $('#retirement-age-male').show();
        } else {
          $('#retirement-age-male').hide();
          $('#retirement-age-female').show();
        }
        break;
    }
    
    // Section settings.
    $('section').hide();
    sectionId++;
    $('section[data-section-id="' + sectionId.toString() + '"]').show();
    
    // Pagination settings.
    $('.breadcrumb li').removeClass('active');
    $('#pagination-' + sectionId.toString()).addClass('active');
  });
  
  $('.sp-back-section').click(function() {
    $('#form-not-valid').remove();
    
    var sectionId = parseInt($(this).closest('section').attr('data-section-id'));
    $('section').hide();
    sectionId--;
    $('section[data-section-id="' + sectionId.toString() + '"]').show();
    
    // Pagination settings.
    $('.breadcrumb li').removeClass('active');
    $('#pagination-' + sectionId.toString()).addClass('active');
  });
  
  /* Form 1 Settings */
  $('#city').select2({
    dir: 'rtl',
    language: 'he',
    placeholder: 'בחר עיר',
    theme: 'bootstrap'
  });
  
  $('#street').select2({
    dir: 'rtl',
    language: 'he',
    placeholder: 'בחר רחוב',
    theme: 'bootstrap'
  });
  
  $('#city').change(function() {
    $(this).valid();
    
    $('#street').closest('.form-group').append(
      '<div id="street-loading">טוען...</div>'
    );
    
    var data = {
      resource_id: 'a7296d1a-f8c9-4b70-96c2-6ebb4352f8e3',
      filters: {'סמל_ישוב': $(this).val()},
      sort: 'שם_רחוב asc',
      limit: 1000000000000
    };
    
    $.ajax({
      url: 'https://data.gov.il/api/3/action/datastore_search',
      method: 'POST',
      data: JSON.stringify(data)
    }).done(function(data) {
      $('#street-loading').remove();
      $('#street')
        .empty()
        .append('<option value=""></option>');
      
      
      /*
      If the first and the second results are equal, then we assume
      that the API has duplicated the rows. In that case loop over every
      second element.
      */
      var increment = 0;
      if (typeof data.result.records[1] !== 'undefined' && (data.result.records[0]['סמל_רחוב'] === data.result.records[1]['סמל_רחוב'])) {
        increment = 2;
      } else {
        increment = 1;
      }
      
      for (var i = 0; i < data.result.records.length; i += increment) {
        $('#street').append(
          '<option value="' + data.result.records[i]['סמל_רחוב'].replace(/"/g, '&quot;') + '">' + data.result.records[i]['שם_רחוב'] + '</option>'
        );
      }
      
      console.log(data);
    });  
  });
  
  $('#street').change(function() {
    $(this).valid();
  });
  
  
  // Family status.
  $('#family-status').change(function() {
    if ('2' === $(this).val()) {
      $('#is-has-partner-yes').trigger('click');
      $('[name="isHasPartner"]').valid();
    }
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
    if (beneficiariesCount <= 2) {
      beneficiariesCount++;
      $('#beneficiary-' + beneficiariesCount).show();
    }
  });
  
  $('#beneficiary-remove').click(function() {
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
  
  $('#employer-name').select2({
    dir: 'rtl',
    language: 'he',
    placeholder: 'בחר מעסיק (אם לא קיים ברשימה, המשך/י להקלידו, ולחץ/י על שמו בסיום)',
    tags: true,
    theme: 'bootstrap'
  });
  
  $('#employer-name').change(function() {
    $(this).valid();
    
    var $option = $('#employer-name [value="' + $(this).val() + '"]'); 
    if ('0' !== $option.val() && '1' === $option.attr('data-is-original')) {
      $('#employer-hp').val($(this).val());
    } else {
      $('#employer-hp').val('');
    }
  })
  
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
    $(this).closest('.fund').find('.fund-code')
        .val($(this).val())
        .valid();
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
  
  
  jQuery.validator.addMethod("validId", function(value, element, param) {
    return this.optional(element) || isIdValid(value) === param;
  });
      
  jQuery.extend(jQuery.validator.messages, {
    email: 'כתובת מייל לא חוקית',
    exactLength: 'השדה צריך להיות בעל {0} תווים',
    maxlength: 'השדה צריך להיות עד  {0} תווים',
    minlength: 'השדה צריך להיות בעל יותר מ- {0} תווים',
    number: 'השדה יכול להכיל רק מספרים',
    required: 'נא למלא את השדה',
    validId: 'ת.ז. שהוזנה אינה תקינה'
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
  
  
  /**
   * Returns true if input is a valid Israel ID.
   */
  function isIdValid(id) {
    var isIdValid = false;
    var sum = 0;
    var lastDigitCalculated = -1;
    
    if (id.length === 9) {
      for (var n = 1; n < 9; n++) {
        var i = n - 1;
        var digit = parseInt(id.charAt(i));
        if (NaN !== digit) {
          
          if (n % 2 === 0) {
            if (digit * 2 > 9) {
              sum += 1 + parseInt((digit * 2).toString().charAt(1));
            } else {
              sum += digit * 2;
            }
          } else {
            sum += digit;
          }
        }
      }
      
      if (sum % 10 === 0) {
        lastDigitCalculated = 0;
      } else {
        lastDigitCalculated = Math.floor(sum / 10) * 10 + 10 - sum;
      }
      
      if (parseInt(id.charAt(8)) === lastDigitCalculated) {
        isIdValid = true;
      }
    }
    
    return isIdValid;
  }
});
