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
      phoneMobileNumber: {
        exactLength: 7,
        number:true,
        required: true
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
      isTransferFunds: {
        required: true
      },
      fundName1: {
        required: true
      },
      fundCode1: {
        required: true
      },
      fundName2: {
        required: true
      },
      fundCode2: {
        required: true
      },
      fundName3: {
        required: true
      },
      fundCode3: {
        required: true
      },
      fundName4: {
        required: true
      },
      fundCode4: {
        required: true
      },
      fundName5: {
        required: true
      },
      fundCode5: {
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
});