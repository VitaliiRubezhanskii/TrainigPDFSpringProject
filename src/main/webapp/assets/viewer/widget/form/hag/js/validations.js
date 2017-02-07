$(function() {
  var highlight = function(element) {
    $(element).closest('.form-group')
      .addClass('has-error has-feedback').removeClass('has-success')
      .find('.form-control-feedback').addClass('glyphicon-remove').removeClass('glyphicon-ok');
  };
  var errorElement = 'span';
  var errorClass = 'help-block';
  var errorPlacement = function(error, element) {
    element.closest('.form-group').append(error);
  };
  var success = function(element) {
    
    // Remove error.
    $(element).closest('.form-group')
        .removeClass('has-error')
        .find('.form-control-feedback').removeClass('glyphicon-remove');
    
    if (! (($(element).prevAll('input').attr('name') === 'percentageBeneficiary1' 
        || $(element).prevAll('input').attr('name') === 'percentageBeneficiary2') 
        && '' === $(element).prevAll('input').val())) {
     
      // Add success.
      $(element).closest('.form-group')
          .addClass('has-success has-feedback')
          .find('.form-control-feedback').addClass('glyphicon-ok');
    }
   
    
    if ($(element).closest('section').find('.has-error').length === 0) {
      $('#form-not-valid').remove();
    }
  };
  
  $('#form-0').validate({
    rules: {
      email: {
        email: true,
        required: true
      },
      firstName: {
        minlength: 2,
        required: true
      },
      id: {
        exactLength: 9,
        number:true,
        required: true,
        validId: true
      },
      lastName: {
        minlength: 2,
        required: true
      },
      phoneNumber: {
        exactLength: 7,
        number:true,
        required: true
      }
    },
    messages: {
    },
    highlight: highlight,
    errorElement: errorElement,
    errorClass: errorClass,
    errorPlacement: errorPlacement,
    success: success
  });
  
   
  $('#form-1').validate({
    rules: {
      beneficiaries: {
        required: true
      },
      city: {
        required: true
      },
      closeness: {
        required: true
      },
      birthDate: {
        required: true
      },
      birthDatePartner: {
        required: true
      },
      email: {
        email: true,
        required: true
      },
      gender: {
        required: true
      },
      id: {
        exactLength: 9,
        number: true,
        required: true,
        validId: true
      },
      idPartner: {
        exactLength: 9,
        number: true,
        required: true,
        validId: true
      },
      idBeneficiary1: {
        exactLength: 9,
        number: true,
        required: true,
        validId: true
      },
      idBeneficiary2: {
        exactLength: 9,
        number: true,
        required: true,
        validId: true
      },
      familyStatus: {
        required: true
      },
      firstName: {
        minlength: 2,
        required: true
      },
      firstNamePartner: {
        minlength: 2,
        required: true
      },
      firstNameBeneficiary1: {
        minlength: 2,
        required: true
      },
      firstNameBeneficiary2: {
        minlength: 2,
        required: true
      },
      houseNumber: {
        required: true
      },
      isHasKids: {
        required: true
      },
      isHasPartner: {
        required: true
      },
      lastName: {
        minlength: 2,
        required: true
      },
      lastNameBeneficiary1: {
        minlength: 2,
        required: true
      },
      lastNameBeneficiary2: {
        minlength: 2,
        required: true
      },
      partnerNoKidsNo: {
        required: true
      },
      partnerNoKidsYes: {
        required: true
      },
      percentageBeneficiary1: {
        number: true,
        totalPercentage100: true
      },
      percentageBeneficiary2: {
        number: true,
        totalPercentage100: true
      },
      street: {
        required: true
      }
    },
    messages: {
      partnerNoKidsNo: {
        required: 'לא ניתן לעבור למסך הבא ללא סימון הסעיף שלעיל'
      },
      partnerNoKidsYes: {
        required: 'לא ניתן לעבור למסך הבא ללא סימון הסעיף שלעיל'
      }
    },
    highlight: highlight,
    errorElement: errorElement,
    errorClass: errorClass,
    errorPlacement: errorPlacement,
    success: success
  });
  
  
  $('#form-2').validate({
    rules: {
      investmentPlan: {
        required: true
      },
      pensionPlan: {
        required: true
      },
      retirementAgeMale: {
        required: true
      },
      retirementAgeFemale: {
        required: true
      }
    },
    messages: {
    },
    highlight: highlight,
    errorElement: errorElement,
    errorClass: errorClass,
    errorPlacement: errorPlacement,
    success: success
  });
  
  
  $('#form-3').validate({
    rules: {
      employerContact: {
        required: true
      },
      employerEmail: {
        email: true
      },
      employerName: {
        required: true
      },
      employerPhone: {
        required: true
      },
      isNotInsured: {
        required: true
      }
    },
    messages: {
      isNotInsured: {
        required: 'לא ניתן לעבור למסך הבא ללא סימון הסעיף שלעיל'
      }
    },
    highlight: highlight,
    errorElement: errorElement,
    errorClass: errorClass,
    errorPlacement: errorPlacement,
    success: success
  });
  
  
  $('#form-4').validate({
    rules: {
      alcohol: {
        required: true
      },
      height: {
        required: true
      },
      isHealthConfirmed: {
        required: true
      },
      'medical-questionnaire-1-1': {
        required: true
      },
      'medical-questionnaire-1-2': {
        required: true
      },
      'medical-questionnaire-1-3': {
        required: true
      },
      'medical-questionnaire-1-4': {
        required: true
      },
      'medical-questionnaire-1-5': {
        required: true
      },
      'medical-questionnaire-1-6': {
        required: true
      },
      'medical-questionnaire-1-7': {
        required: true
      },
      'medical-questionnaire-1-8': {
        required: true
      },
      'medical-questionnaire-1-9': {
        required: true
      },
      'medical-questionnaire-1-10': {
        required: true
      },
      'medical-questionnaire-1-11': {
        required: true
      },
      'medical-questionnaire-1-12': {
        required: true
      },
      'medical-questionnaire-1-13': {
        required: true
      },
      'medical-questionnaire-1-14': {
        required: true
      },
      'medical-questionnaire-2': {
        required: true
      },
      'medical-questionnaire-3': {
        required: true
      },
      'medical-questionnaire-4': {
        required: true
      },
      'medical-questionnaire-5': {
        required: true
      },
      'medical-questionnaire-6': {
        required: true
      },
      'medical-questionnaire-2-yes-details': {
        required: true
      },
      'medical-questionnaire-3-yes-details': {
        required: true
      },
      'medical-questionnaire-4-yes-details': {
        required: true
      },
      'medical-questionnaire-5-yes-details': {
        required: true
      },
      'medical-questionnaire-6-yes-details': {
        required: true
      },
      smoking: {
        required: true
      },
      weight: {
        required: true
      }
    },
    messages: {
      isHealthConfirmed: {
        required: 'לא ניתן לעבור למסך הבא ללא סימון הצהרת העמית'
      }
    },
    highlight: highlight,
    errorElement: errorElement,
    errorClass: errorClass,
    errorPlacement: errorPlacement,
    success: success
  });
  
  
  $('#form-5').validate({
    rules: {
      accountNumber1: {
        required: true
      },
      fundName1: {
        required: true
      },
      isTransferFunds: {
        required: true
      },
      memberStatus1: {
        required: true
      },
      transferFundStatement7: {
        required: true
      }
    },
    messages: {
    },
    highlight: highlight,
    errorElement: errorElement,
    errorClass: errorClass,
    errorPlacement: errorPlacement,
    success: success
  });
  
  
  $('#form-6').validate({
    rules: {
      isConfirmStatements: {
        required: true
      }
    },
    messages: {
    },
    highlight: highlight,
    errorElement: errorElement,
    errorClass: errorClass,
    errorPlacement: errorPlacement,
    success: success
  });
  
  $('#form-7').validate({
    rules: {
      id: {
        exactLength: 9,
        number: true,
        required: true,
        validId: true
      }
    },
    highlight: highlight,
    errorElement: errorElement,
    errorClass: errorClass,
    errorPlacement: errorPlacement,
    success: success
  });
});