$(function() {
  var beneficiariesPercentageValidationFlag = false;
  var isFormValidBoolean = false;
  var payload = {};
  var transferFundPayload = {};
  var sectionId = 0;
  
  var channelName = getParameterByName('f', document.referrer);
  var a = getParameterByName('a', document.referrer);
  var ci = getParameterByName('ci', document.referrer);
  var mqy = getParameterByName('mqy', document.referrer);
  var itfy = getParameterByName('itfy', document.referrer);
  
  if ('1' === a) {
    sectionId = 7;
    attachmentSectionView();
    $('[data-section-id="7"]').show();
  } else {
    $('.sp-next-section').text('המשך')
    $('[data-section-id="0"]').show();
  }
  sendSlidePiper('HALMAN_ALDUBI_CURRENT_SECTION', sectionId);
  
  function getParameterByName(name, url) {
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec('?' + url.split('?')[1]);
    if (null !== results) {
      return results[1];
    }
    return undefined;
  }
  
  function attachmentSectionView() {
    $('.pagination-container').css('visibility', 'hidden');
    $('.sp-back-section').hide();
    $('.sp-next-section').text('שלח צרופות');
    
    if (typeof a !== 'undefined' && '1' === a) {
      $('[data-section-name=add-attachemtns] .user-id').show();
    }
    
    if ((typeof ci !== 'undefined' && '1' === ci) || (typeof ci === 'undefined' && $('#career-independent').is(':checked'))) {
      $('[data-type=debitpermission].form-group').show();
    }
    
    if ((typeof mqy !== 'undefined' && '1' === mqy) || (typeof mqy === 'undefined' && $('.medical-questionnaire-yes').is(':checked'))) {
      $('[data-type=medicaldocument].form-group').show();
    }
    
    if ((typeof itfy !== 'undefined' && '1' === itfy) || (typeof itfy === 'undefined' && $('#is-transfer-funds-yes').is(':checked'))) {
      $('[data-type=report].form-group').show();
    }
  }
  
  $('.sp-next-section').click(function() {
    if (! isFormValid()) {
      isFormValidBoolean = false;
      return false;
    } else {
      isFormValidBoolean = true;
    }
    
    switch (sectionId) {
      case 0:
        $('.pagination-container').removeClass('hidden');
        
        $('.sp-back-section').hide();
        
        $('#id').val($('#id-init').val());
        $('#first-name').val($('#first-name-init').val());
        $('#last-name').val($('#last-name-init').val());
        
        var mobileOperatorCode = ['050', '052', '053', '054', '055', '057', '058'];
        if (mobileOperatorCode.indexOf($('#phone-operator-code-init').val()) > -1) {
          $('#phone-mobile-operator-code').val($('#phone-operator-code-init').val());
          $('#phone-mobile-number')
            .val($('#phone-number-init').val())
            .rules( "add", {
              exactLength: 7,
              number:true,
              required: true
            });
          
          $('#phone-mobile-number-label').html(function(index, oldHtml) {
            return '<span class="mandatory-field">*</span> ' + oldHtml;
          });
        } else {
          $('#phone-home-operator-code').val($('#phone-operator-code-init').val());
          $('#phone-home-number')
            .val($('#phone-number-init').val())
            .rules( "add", {
              exactLength: 7,
              number:true,
              required: true
            });
          
          $('#phone-home-number-label').html(function(index, oldHtml) {
            return '<span class="mandatory-field">*</span> ' + oldHtml;
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
      
      case 5:
        $('.sp-next-section').text('שלח טופס');
        sendFormButton();
        break;
        
      case 6:
        attachmentSectionView();
        break;
    }
    
    // Save current entries into the payload object.
    saveEntries();
  });
  
  
  $('.sp-back-section').click(function() {
    $('#form-not-valid').remove();
    
    sectionId--;
    setSectionView();
    
    // If previous section set next button to be 'Finish'.
    $('.sp-next-section')
      .prop('disabled', false)
      .text('המשך');
  });
  
  
  // Navigate the form on the navbar.
  $('.breadcrumb li').click(function() {
    if ($(this).hasClass('sp-form__menu-section--seen')) {
      var newSectionId = parseInt($(this).attr('id').split('-')[1]);

      // newSectionId is the clicked breadcrumb section ID.
      if (newSectionId !== sectionId) {
        if (newSectionId > sectionId) {
          
          do {
            $('.sp-next-section').click();
          } while (sectionId < newSectionId && isFormValidBoolean);
          
        } else {
          $('#form-not-valid').remove();
          sectionId = newSectionId;
          setSectionView();
        }
      }
    }
  });
  
  
  function isFormValid() {
    if (! $('#form-' + sectionId).valid()) {
      if (0 === $('#form-not-valid').length) {
        $('#panel').after('<div class="form-group has-error" id="form-not-valid"><label id="form-not-valid-label" class="control-label">לא כל שדות החובה מלאים, ולכן לא ניתן לעבור למסך הבא</label></div>');
      }
      return false;
    } else {
      $('#form-not-valid').remove();
      return true;
    }
  };
  
  
  function setSectionView() {
    console.log('Currently on section: ' + sectionId);
    sendSlidePiper('HALMAN_ALDUBI_CURRENT_SECTION', sectionId);
    
    // Section settings.
    $('section').hide();
    $('section[data-section-id="' + sectionId.toString() + '"]').show();
    
    // Breadcrumb settings.
    $('.breadcrumb li').removeClass('active');
    $('#pagination-' + sectionId.toString()).addClass('active sp-form__menu-section--seen');
    
    if (6 === sectionId) {
      $('.sp-next-section').text('שלח טופס');
      sendFormButton();
    } else if (7 === sectionId) {
      $('.sp-next-section').text('שלח צרופות');
    } else {
      $('.sp-next-section')
        .prop('disabled', false)
        .text('המשך');
    }
    
    if (sectionId <= 1 || 7 === sectionId) {
      $('.sp-back-section').hide();
    } else if (8 === sectionId) {
      $('#hr__next-back-buttons').css('visibility', 'hidden');
    } else {
      $('.sp-back-section').show();
    }
  };
  
  
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
          '<option value="' + data.result.records[i]['סמל_רחוב'] + '">' + data.result.records[i]['שם_רחוב'].replace(/"/g, '&quot;').replace(/\)(.+)\(/g, '($1)') + '</option>'
        );
      }
    });  
  });
  
  $('#street').change(function() {
    $(this).valid();
  });
  
  
  // Family status.
  $('#family-status').change(function() {
    if ('נשוי/אה' === $(this).val()) {
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
      
      $('#partner-kids-waiver-statement').show();
    } else if ($('#is-has-partner-yes').is(':checked')) {
      $('#partner-no-kids-no-container, #partner-no-kids-yes-container, #partner-kids-waiver-statement').hide()
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
      
      $('[name="percentageBeneficiary1"]').valid();
    }
  });
  
  $('#beneficiary-remove').click(function() {
    var beneficiariesCount = $('#beneficiaries .beneficiary:visible').length;
    if (beneficiariesCount > 1) {
      $('#beneficiary-' + beneficiariesCount).hide();
      
      $('[name="percentageBeneficiary1"]').valid();
    }
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
    
    $('[name="memberStatus1"]').change();
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
    
    var $option = $('#employer-name [value="' + $(this).val().replace('"', 'quot;') + '"]'); 
    if (parseInt($option.val()) > 0 && '1' === $option.attr('data-is-original')) {
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
    $('.medical-questionnaire-no')
      .click()
      .valid();
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
      $('#transfer-funds-container, #transfer-funds-statements').show();
    } else {
      $('#transfer-funds-container, #transfer-funds-statements').hide();
    }
  });
  
  $('.fund-name').change(function() {
    if (parseInt($(this).val()) > 0) {
      $(this).closest('.fund').find('.fund-code').val($(this).val());
      $('#account-number-container-1').hide();
    } else {
      $(this).closest('.fund').find('.fund-code').val('0');
      $('#account-number-container-1').show();
    }
  });
  
  $('[name="memberStatus1"]').change(function() {
    if ($('#active-member-1').is(':checked')) {
      
      if ($('#career-employment').is(':checked')) {
        $('#transfer-fund-statement-6-container').show();
      } else {
        $('#transfer-fund-statement-6-container').hide();
      }
      
      $('#transfer-fund-statement-7-container').show();
    } else {
      $('#transfer-fund-statement-7-container, #transfer-fund-statement-6-container').hide();
    }
  });
  
  /* Form 6 Settings */
  $('#general-statements').click(function() {
    $('#general-statements .fa').toggleClass('fa-plus-square fa-minus-square');
    $('#is-confirm-statements').prop('disabled', false);
  });
  
  $('#is-confirm-statements').change(function() {
    sendFormButton();
  });
  
  
  /* Tooltip */
  $('#pensionPlanTooltip').tooltip({
    delay: {
      show: 300,
      hide: 4000
    },
    html: true,
    placement: 'auto left',
    title: '<a class="sp-tooltip-a" target="_blank" href="http://www.hag.co.il/%d7%a7%d7%a8%d7%a0%d7%95%d7%aa-%d7%a4%d7%a0%d7%a1%d7%99%d7%94/%d7%aa%d7%95%d7%9b%d7%a0%d7%99%d7%95%d7%aa-%d7%91%d7%99%d7%98%d7%95%d7%97/">לחצ/י כאן ללמידה על תכניות הביטוח הקיימות</a>'
  });
  
  $('#investmentPlanTooltip').tooltip({
    delay: {
      show: 300,
      hide: 4000
    },
    html: true,
    placement: 'auto left',
    title: '<a class="sp-tooltip-a" target="_blank" href="http://www.hag.co.il/%d7%a7%d7%a8%d7%a0%d7%95%d7%aa-%d7%a4%d7%a0%d7%a1%d7%99%d7%94/%d7%a7%d7%a8%d7%a0%d7%95%d7%aa-%d7%94%d7%a4%d7%a0%d7%a1%d7%99%d7%94-%d7%a9%d7%9c%d7%a0%d7%95/%d7%94%d7%9c%d7%9e%d7%9f-%d7%90%d7%9c%d7%93%d7%95%d7%91%d7%99-%d7%a7%d7%a8%d7%9f-%d7%a4%d7%a0%d7%a1%d7%99%d7%94-%d7%9e%d7%a7%d7%99%d7%a4%d7%94/%d7%9e%d7%a1%d7%9c%d7%95%d7%9c%d7%99-%d7%a7%d7%a8%d7%9f-%d7%a4%d7%a0%d7%a1%d7%99%d7%94-%d7%9e%d7%a7%d7%99%d7%a4%d7%94/">לחצ/י כאן ללמידה על מסלולי קרן פנסיה מקיפה</a>'
  });
  
  $('#memberStatusTooltip').tooltip({
    delay: {
      show: 300,
      hide: 4000
    },
    placement: 'auto left',
    title: 'עמית פעיל  - עמית שבחשבונו הפקדה בחצי שנה האחרונה'
  });
  
  
  /* jQuery Validation */
  jQuery.validator.addMethod('exactLength', function(value, element, param) {
    return this.optional(element) || value.length == param;
  });
  
  jQuery.validator.addMethod("validId", function(value, element, param) {
    return this.optional(element) || isIdValid(value) === param;
  });
  
  jQuery.validator.addMethod("totalPercentage100", function(value, element, param) {
    return this.optional(element) || isTotalPercentage100(element) === param;
  });
      
  jQuery.extend(jQuery.validator.messages, {
    email: 'כתובת מייל לא חוקית',
    exactLength: 'השדה צריך להיות בעל {0} תווים',
    maxlength: 'השדה צריך להיות עד  {0} תווים',
    minlength: 'השדה צריך להיות בעל יותר מ- {0} תווים',
    number: 'השדה יכול להכיל רק מספרים',
    required: 'נא למלא את השדה',
    validId: 'ת.ז. שהוזנה אינה תקינה',
    totalPercentage100: 'סך אחוז המוטב/ים צריך להיות שווה ל- 100'
  });
  
  
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
  };
  
  
  /**
   * Validate opposite percentageBenficiary field if value of the other is empty.
   */
  $('[name^="percentageBeneficiary"]').keyup(function() {
    
    if ('' === $(this).val()) {
      if ($(this).attr('name') === 'percentageBeneficiary1') {
        $('[name="percentageBeneficiary2"]').valid();
      } else {
        $('[name="percentageBeneficiary1"]').valid();
      }
      
      // Remove success class.
      $(this)
        .closest('.form-group')
        .removeClass('has-success has-feedback')
        .find('.form-control-feedback').removeClass('glyphicon-ok')
        .nextAll('.help-block').remove();
        
    }
  });
  
  
  /**
   * Returns true if the total beneficiaries percentage fields equals 100.
   */
  function isTotalPercentage100(element) {
    var isTotalPercentage100 = false;
    var totalPercentage = 0;
    
    $('[name^="percentageBeneficiary"]:visible').each(function() {
      totalPercentage += parseInt($(this).val());
    });
    
    
    if (100 === totalPercentage) {
      isTotalPercentage100 = true;
    }
        
    if ($('[name^="percentageBeneficiary"]:visible').length === 2) {
    
      if (! beneficiariesPercentageValidationFlag) {
        beneficiariesPercentageValidationFlag = true;
        
        if ($(element).attr('name') === 'percentageBeneficiary1') {
          $('[name="percentageBeneficiary2"]').valid();
        } else {
          $('[name="percentageBeneficiary1"]').valid();
        }
      } else {
        beneficiariesPercentageValidationFlag = false;
      }
    }
             
    return isTotalPercentage100;
  };
  
  
  /* Date Picker */
  $('#datetimepicker1, #datetimepicker2').datetimepicker({
    allowInputToggle: true,
    format: 'DD/MM/YYYY',
    icons: {
      date: "fa fa-calendar"
    },
    locale: 'he',
    viewMode: 'years'
  });
  
  $('#datetimepicker1').on('dp.show', function() {
    $('#datetimepicker1').data("DateTimePicker").maxDate(moment().subtract(18, 'years'));
    $('#datetimepicker1').data("DateTimePicker").minDate(moment().subtract(55, 'years').add(1, 'days'));
  });
  
  
  /* Signature Pad */
  var isSignaturePadClear = true;
  var canvas = document.querySelector('canvas');
  var signaturePad = new SignaturePad(canvas, {
    onEnd: function() {
      isSignaturePadClear = false;
      sendFormButton();
    }
  });
  
  $('#hag-signature--clear').click(function() {
    signaturePad.clear();
    isSignaturePadClear = true;
    sendFormButton();
  });
  
  function sendFormButton() {
    if ($('#is-confirm-statements').is(':checked') && ! signaturePad.isEmpty() && ! isSignaturePadClear) {
      $('.sp-next-section').prop('disabled', false);
    } else {
      $('.sp-next-section').prop('disabled', true);
    }
  };

  function moveNextSection() {
    sectionId++;
    setSectionView();
  }

  /* Save Entries */
  function saveEntries() {
    switch (sectionId) {
      case 0:
        payload = {
          join_key: $('#join-key').val(),
          email: $('#email-init').val(),
          first_name: $('#first-name-init').val(),
          id_num: $('#id-init').val(),
          last_name: $('#last-name-init').val(),
          phoneInit: $('#phone-operator-code-init').val() + '-' + $('#phone-number-init').val()
        }
        
        payload['date'] = getCurrentDate(); 
        
        // HA WebMerge.
        sendWebMerge('https://www.webmerge.me/merge/82651/98sjf8', payload);
        
        sendZapier('https://hooks.zapier.com/hooks/catch/674313/h2y8on/', payload);
        
        sendSlidePiper('HALMAN_ALDUBI_COMPLETED_INITIAL_SECTION');

        moveNextSection();
        break;
        
      case 1:
        payload['bdate'] = $('#birth-date').val();
        payload['city'] = $('#city [value="' + $('#city').val() + '"]').text();
        payload['email'] = $('#email').val();
        payload['first_name'] = $('#first-name').val();
        payload['house_num'] = $('#house-number').val();
        payload['id_num'] = $('#id').val();
        payload['last_name'] = $('#last-name').val();
        payload['street'] = $('#street [value="' + $('#street').val() + '"]').text();
        payload['zip'] = $('#zip-code').val();
        
        var zip = '';
        if ('' !== payload['zip']) {
          zip = ', ' + payload['zip'];
        }
        transferFundPayload['address'] = payload['street'] + ' ' + payload['house_num'] + ', ' +  payload['city'] + zip;
        transferFundPayload['first_name'] = $('#first-name').val();
        transferFundPayload['id_num'] = $('#id').val();
        transferFundPayload['last_name'] = $('#last-name').val();
        
        if (null !== $('#family-status').val()) {
          payload['status'] = $('#family-status').val();
        }
        
        if ('' !== $('#phone-mobile-number').val()) {
          payload['phone'] = $('#phone-mobile-operator-code').val() + '-' + $('#phone-mobile-number').val();
        }
        
        if ('' !== $('#phone-home-number').val()) {
          payload['phone_home'] = $('#phone-home-operator-code').val() + '-' + $('#phone-home-number').val();
        }
        
        if ('male' === $('[name="gender"]:checked').val()) {
          payload['gender'] = 'זכר';
        } else if ('female' === $('[name="gender"]:checked').val()) {
          payload['gender'] = 'נקבה';
        }
        
        if ($('#beneficiaries-new').is(':checked')) {
          payload['id_num_Mutav'] = $('#id-beneficiary-1').val();
          payload['last_name_Mutav'] = $('#last-name-beneficiary-1').val();
          payload['first_name_Mutav'] = $('#first-name-beneficiary-1').val();
          payload['Kirva _Mutav'] = $('#closeness-beneficiary-1').val();
          payload['percent'] = $('#percentage-beneficiary-1').val();
          payload['address_motav'] = $('#address-beneficiary-1').val();
          payload['id_num_Mutav2'] = $('#id-beneficiary-2').val();
          payload['last_name_Mutav2'] = $('#first-name-beneficiary-2').val();
          payload['first_name_Mutav2'] = $('#last-name-beneficiary-2').val();
          payload['Kirva _Mutav2'] = $('#closeness-beneficiary-2').val();
          payload['percent2'] = $('#percentage-beneficiary-2').val();
          payload['address_motav2'] = $('#address-beneficiary-2').val()
        } else {
          payload['id_num_Mutav'] = '';
          payload['last_name_Mutav'] = '';
          payload['first_name_Mutav'] = '';
          payload['Kirva _Mutav'] = '';
          payload['percent'] = '';
          payload['address_motav'] = '';
          payload['id_num_Mutav2'] = '';
          payload['last_name_Mutav2'] = '';
          payload['first_name_Mutav2'] = '';
          payload['Kirva _Mutav2'] = '';
          payload['percent2'] = '';
          payload['address_motav2'] = '';
        }
        
        if ($('#is-has-partner-no').is(':checked')) {
          if ($('#is-has-kids-no').is(':checked')) {
            if ($('#partner-no-kids-no').is(':checked')) {
              payload['vitor1'] = 'X';
              payload['vitor2'] = '';
            }
          } else if ($('#is-has-kids-yes').is(':checked')) {
            if ($('#partner-no-kids-yes').is(':checked')) {
              payload['vitor1'] = '';
              payload['vitor2'] = 'X';
            }
            
            if ($('#kids-insurance-increased').is(':checked')) {
              payload['child1'] = '';
              payload['child2'] = 'X';
            } else {
              payload['child1'] = 'X';
              payload['child2'] = '';
            }
          }

          payload['bdate_zug'] = '';
          payload['first_name_zug'] = '';
          payload['id_num_zug'] = '';
        } else {
          payload['bdate_zug'] = $('#birth-date-partner').val();
          payload['first_name_zug'] = $('#first-name-partner').val();
          payload['id_num_zug'] = $('#id-partner').val();
        }

        moveNextSection();
        break;
        
      case 2:
        $('[name="pensionPlan"]').each(function(index) {
          if ($(this).is(':checked')) {
            payload['t' + (index + 1).toString()] = 'X';
          } else {
            payload['t' + (index + 1).toString()] = '';
          }
        });
        
        var investmentPlans = ['by age', 'm50-', 'm50-60', 'm60'];
        $('[name="investmentPlan"]').each(function(index) {
          if ($(this).is(':checked')) {
            payload[investmentPlans[index]] = 'X';
          } else {
            payload[investmentPlans[index]] = '';
          }
        });
        
        payload['g60'] = '';
        payload['g64'] = '';
        payload['g67'] = '';
        if ('male' === $('[name="gender"]:checked').val()) {
          payload[$('[name="retirementAgeMale"]:checked').val()] = 'X';
        } else if ('female' === $('[name="gender"]:checked').val()) {
          payload[$('[name="retirementAgeFemale"]:checked').val()] = 'X';
        }

        moveNextSection();
        break;
        
      case 3:
        if ($('#career-employment').is(':checked')) {
          if (isNaN($('#employer-name').val()))  {
            payload['name_m'] = $('#employer-name').val();
          } else if ('' === $('#employer-name [value="' + $('#employer-name').val() + '"]').text()) {
            payload['name_m'] = $('#employer-name').val();
          } else {
            payload['name_m'] = $('#employer-name [value="' + $('#employer-name').val() + '"]').text();
          }
          
          payload['num_m'] = $('#employer-hp').val();
          payload['address_m'] = $('#employer-address').val();
          payload['phone_m'] = $('#employer-phone').val();
          payload['contact'] = $('#employer-contact').val();
          payload['email _m'] = $('#employer-email').val();
          
          payload['sum_hafkada'] = '';
          
          transferFundPayload['employee'] = 'X';
          transferFundPayload['independent'] = '';
        } else {
          payload['name_m'] = '';
          payload['num_m'] = '';
          payload['address_m'] = '';
          payload['phone_m'] = '';
          payload['contact'] = '';
          payload['email _m'] = '';
          
          payload['sum_hafkada'] = $('#independent-deposit').val();
          transferFundPayload['employee'] = '';
          transferFundPayload['independent'] = 'X';
        }

        moveNextSection();
        break;
        
      case 4:
        payload['full_name'] = $('#first-name').val() + ' ' + $('#last-name').val();
        payload['height'] = $('#height').val();
        payload['weight'] = $('#weight').val();
        payload['doctor'] = $('#doctor-name').val();
        payload['hmo'] = $('#medical-organization').val();
        
        if ($('#smoking-no').is(':checked')) {
          payload['smoking_no'] = 'X';
          payload['smoking_yes'] = '';
          payload['count'] = '';
          payload['when_ss'] = $('#smoking-when-stopped').val();
        } else if ($('#smoking-yes').is(':checked')) {
          payload['smoking_no'] = '';
          payload['smoking_yes'] = 'X';
          payload['count'] = $('#smoking-amount').val();
          payload['when_ss'] = '';
        }
        
        if ($('#alcohol-no').is(':checked')) {
          payload['alcohol_no'] = 'X';
          payload['alcohol_yes'] = '';
        } else if ($('#alcohol-yes').is(':checked')) {
          payload['alcohol_no'] = '';
          payload['alcohol_yes'] = 'X';
        }
        payload['when_sa'] = $('#alcohol-when-stopped').val();
        payload['gmilaa'] = $('#alcohol-is-tapering').val();
        payload['when'] = $('#alcohol-when-tapering').val();
        
        if ($('#drugs-no').is(':checked')) {
          payload['drugs_no'] = 'X';
          payload['drugs_yes'] = '';
        } else if ($('#drugs-yes').is(':checked')) {
          payload['drugs_no'] = '';
          payload['drugs_yes'] = 'X';
        }
        payload['type'] = $('#drugs-type-duration').val();
        payload['when_sd'] = $('#drugs-when-stopped').val();
        
        for (var i = 1; i <= 14; i++) {
          if ($('#medical-questionnaire-1-' + i + '-no').is(':checked')) {
            payload['no1' + i] = 'X';
            payload['yes1' + i] = '';
          } else if ($('#medical-questionnaire-1-' + i + '-yes').is(':checked')) {
            payload['no1' + i] = '';
            payload['yes1' + i] = 'X';
          }
        }
        
        for (var i = 2; i <= 6; i++) {
          if ($('#medical-questionnaire-' + i + '-no').is(':checked')) {
            payload[i + 'no'] = 'X';
            payload[i + 'yes'] = '';
            payload['details' + i] = '';
          } else if ($('#medical-questionnaire-' + i + '-yes').is(':checked')) {
            payload[i + 'no'] = '';
            payload[i + 'yes'] = 'X';
            payload['details' + i] = $('#medical-questionnaire-' + i + '-yes-details').val();
          }
        }

        moveNextSection();
        break;
        
      case 5:
        if ($('#is-transfer-funds-yes').is(':checked')) {
          var fundCode = '';
          if (parseInt($('#fund-name-1').val()) > 0) {
            fundCode = $('#fund-name-1').val();
            transferFundPayload['account'] = '';
          } else {
            fundCode = '';
            transferFundPayload['account'] = $('#account-number-1').val();
          }
          var fundName = $('#fund-name-1 [value="' + $('#fund-name-1').val() + '"]').text();
          transferFundPayload['kupa_m'] = fundName;
          transferFundPayload['otzar_m'] = fundCode;
          
          transferFundPayload['kupa_otzar_m'] = fundName;
          if ('' !== fundCode) {
          	transferFundPayload['kupa_otzar_m'] += ' - ' + fundCode;
          }
          
          if ($('#active-member-1').is(':checked')) {
            transferFundPayload['active'] = 'X';
            transferFundPayload['no_active'] = '';
            transferFundPayload['active3'] = 'X';
          } else {
            transferFundPayload['active'] = '';
            transferFundPayload['no_active'] = 'X';
            transferFundPayload['active3'] = '';
          }
          
          if ($('#transfer-fund-statement-6').is(':checked')) {
            transferFundPayload['active0'] = 'X';
          } else {
            transferFundPayload['active0'] = '';
          }
          
          if ($('#transferFundStatement7Option1').is(':checked')) {
            transferFundPayload['active1'] = 'X';
            transferFundPayload['active2'] = '';
          } else if ($('#transferFundStatement7Option2').is(':checked')) {
            transferFundPayload['active1'] = '';
            transferFundPayload['active2'] = 'X';
          }
        }

        moveNextSection();
        break;
        
      case 6:
        // Create attachmentLink.
        var attachmentLink = document.referrer;
        
        if (typeof getParameterByName('a', document.referrer) === 'undefined') {
          attachmentLink += '&a=1';
        }
        
        if (typeof getParameterByName('ci', document.referrer) === 'undefined' && $('#career-independent').is(':checked')) {
          attachmentLink += '&ci=1';
        }
        
        if (typeof getParameterByName('mqy', document.referrer) === 'undefined' && $('.medical-questionnaire-yes').is(':checked')) {
          attachmentLink += '&mqy=1';
        }
        
        if (typeof getParameterByName('itfy', document.referrer) === 'undefined' && $('#is-transfer-funds-yes').is(':checked')) {
          attachmentLink += '&itfy=1';
        }
        payload['attachmentLink'] = attachmentLink;
        sendSms(attachmentLink);
        
        payload['signatureBase64'] = signaturePad.toDataURL();
        sendWebMerge('https://www.webmerge.me/merge/78047/g33bvk', payload);
        
        // Send to Zapier.
        sendZapier('https://hooks.zapier.com/hooks/catch/674313/tzyyht/', payload);
        
        if ($('#is-transfer-funds-yes').is(':checked')) {
          transferFundPayload['date'] = payload['date'];
          transferFundPayload['email'] = payload['email'];
          transferFundPayload['signatureBase64'] = payload['signatureBase64'];
          sendWebMerge('https://www.webmerge.me/merge/79990/1qdska', transferFundPayload);
          
          // Send to Zapier.
          sendZapier('https://hooks.zapier.com/hooks/catch/674313/ta34dm/', transferFundPayload);
        }
        
        sendSlidePiper('HALMAN_ALDUBI_SENT_FORM');
        
        dataLayer.push({
          'event': 'digital_join',
          'stage': 'completed'
        });

        moveNextSection();
        break;
        
        case 7:
        if (typeof payload['id_num'] === 'undefined') {
          payload['id_num'] = $('[data-section-name=add-attachemtns] [name=id]').val(); 
        }
        payload['dateTime'] = getCurrentDateTime();
        uploadFiles();

        // moveNextSection() is inside uploadFiles().
        break;
    }

    function getCurrentDate() {
      var date = new Date();
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();

      if (day < 10) {
        day = '0' + day;
      } 

      if (month < 10) {
        month = '0' + month;
      } 
      
      return day + '/' + month + '/' + year;
    }
    
    function getCurrentDateTime() {
      var date = new Date();
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();

      if (day < 10) {
        day = '0' + day;
      }

      if (month < 10) {
        month = '0' + month;
      }
      
      if (hours < 10) {
        hours = '0' + hours;
      }
      
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      
      if (seconds < 10) {
        seconds = '0' + seconds;
      }
      
      return day + '-' + month + '-' + year + '_' + hours + '-' + minutes + '-' + seconds;
    }
  };
  
  
  function sendWebMerge(url, payload) {

    // Send to WebMerge.
    $.ajax({
      contentType: 'application/json',
      method: 'POST',
      url: url,
      data: JSON.stringify(payload)
    });
  };
  
  
  function sendZapier(url, payload) {
    $.ajax({
      method: 'POST',
      url: url,
      data: JSON.stringify(payload)
    });
  };
  
  /**
   * Send Data to SlidePiper.
   * 
   * @param eventName The event name.
   */
  function sendSlidePiper(eventName, arg1) {
    if (typeof arg1 === 'undefined') {
      arg1 = '';
    }
    
    var sessionId = '';
    if (typeof parent.sessionid !== 'undefined') {
      sessionId = parent.sessionid;
    }
    
    var data = {
      action: 'setCustomerEvent',
      data: {
        eventName: eventName,
        linkHash: getParameterByName('f', document.referrer),
        param_1_varchar: document.location.href,
        param_2_varchar: document.referrer,
        param_3_varchar: arg1.toString(),
        sessionId: sessionId
      }
    };
    
    $.ajax({
      method: 'POST',
      url: parent.SP.API_URL + '/ManagementServlet',
      data: JSON.stringify(data),
      xhrFields: {
        withCredentials: true
      }
    });
  };
  
  function sendSms(url) {
    if (typeof payload['phone'] !== 'undefined') {
      phoneNumber = '972' + payload['phone'].replace(/^0/, '').replace(/-/g, '');
      
      var request = new XMLHttpRequest();
      request.open('POST', parent.SP.API_URL + '/utils/widgets/sms');
      request.setRequestHeader('Content-Type', 'application/json');
      request.send(JSON.stringify({channelName: channelName, url: url, phoneNumber: phoneNumber}));
    }
  }
  
  function uploadFiles() {
    var $fileTypes = $('[data-section-id="7"] input[type=file]:visible');
    var beforeUploadFileCounter = 0;
    $fileTypes.each(function(i, file) {
        beforeUploadFileCounter += file.files.length;
    });

    if (beforeUploadFileCounter > 0) {
        var afterUploadFileCounter = 0;
        var isFileUploadFailed = false;
        $fileTypes.each(function(i, file) {
            if (file.files.length > 0) {

                $('.sp-next-section').text('שולח צרופות... נא לא לסגור את החלון').prop('disabled', true);

                var formData = new FormData();
                $.each(file.files, function (i) {
                    formData.append('files[]', file.files[i]);
                });

                var dataFileType = file.getAttribute('data-file-type');
                if (null !== dataFileType) {
                    var fileNamePrefix = payload['id_num'] + '_' + payload['dateTime'] + '_file-type-' + dataFileType;
                }
                formData.append('data', new Blob(
                    [JSON.stringify({channelName: channelName, fileNamePrefix: fileNamePrefix})],
                    {type: 'application/json'}));

                // Create XMLHttpRequest.
                var request = new XMLHttpRequest();

                request.onload = function() {
                    if (request.status === 200) {
                        afterUploadFileCounter += file.files.length;
                        if (beforeUploadFileCounter === afterUploadFileCounter
                                && !isFileUploadFailed) {
                            sendSlidePiper('HALMAN_ALDUBI_SENT_FILES', dataFileType);
                            $('.sp-next-section').hide();
                            moveNextSection();
                        }
                    } else {
                        isFileUploadFailed = true;
                        sendSlidePiper('HALMAN_ALDUBI_FAILED_SENDING_FILES', dataFileType);
                        $('.sp-next-section').text('חלה שגיאה בהעלאת צרופות');
                    }
                }

                request.onerror = function() {
                    isFileUploadFailed = true;
                    sendSlidePiper('HALMAN_ALDUBI_FAILED_SENDING_FILES', dataFileType);
                    $('.sp-next-section').text('חלה שגיאה בהעלאת צרופות');
                }

                request.open("POST", parent.SP.API_URL + '/utils/widgets/ftp');
                request.send(formData);
            }
        });
    } else {
        $('.sp-next-section').hide();
        moveNextSection();
    }
  }
});
