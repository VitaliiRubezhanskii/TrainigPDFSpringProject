$(function() {
  var highlight = function(element) {
    $(element).closest('.form-group')
      .addClass('has-error has-feedback').removeClass('has-success')
      .find('.form-control-feedback').addClass('glyphicon-remove').removeClass('glyphicon-ok');
  }
  var errorElement = 'span';
  var errorClass = 'help-block';
  var errorPlacement = function(error, element) {
    element.closest('.form-group').append(error);
  }
  var success = function(element) {
    $(element).closest('.form-group')
      .addClass('has-success has-feedback').removeClass('has-error')
      .find('.form-control-feedback').addClass('glyphicon-ok').removeClass('glyphicon-remove');
  }
  
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
        required: true
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
        required: true
      },
      idPartner: {
        exactLength: 9,
        number: true,
        required: true
      },
      idBeneficiary1: {
        exactLength: 9,
        number: true,
        required: true
      },
      idBeneficiary2: {
        exactLength: 9,
        number: true,
        required: true
      },
      idBeneficiary3: {
        exactLength: 9,
        number: true,
        required: true
      },
      idBeneficiary4: {
        exactLength: 9,
        number: true,
        required: true
      },
      idBeneficiary5: {
        exactLength: 9,
        number: true,
        required: true
      },
      idBeneficiary6: {
        exactLength: 9,
        number: true,
        required: true
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
      firstNameBeneficiary3: {
        minlength: 2,
        required: true
      },
      firstNameBeneficiary4: {
        minlength: 2,
        required: true
      },
      firstNameBeneficiary5: {
        minlength: 2,
        required: true
      },
      firstNameBeneficiary6: {
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
      lastNamePartner: {
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
      lastNameBeneficiary3: {
        minlength: 2,
        required: true
      },
      lastNameBeneficiary4: {
        minlength: 2,
        required: true
      },
      lastNameBeneficiary5: {
        minlength: 2,
        required: true
      },
      lastNameBeneficiary6: {
        minlength: 2,
        required: true
      },
      partnerNoKidsNo: {
        required: true
      },
      partnerNoKidsYes: {
        required: true
      },
      percentage: {
        number: true,
        //isTotal100: true
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
      employerName: {
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