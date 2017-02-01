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
    $(element).closest('.form-group').removeClass('has-error');
  
    // Add success.
    $(element).closest('.form-group').addClass('has-success has-feedback');
  };
  
  $('#form-1').validate({
  	rules: {
  		firstName: {
  			required: true
  		},
  		lastName: {
  			required: true
  		},
  		phoneNumber: {
  			required: true
  		},
  		emailAddress: {
  			email: true,
  			required: true
  		}
  	},
  	messages: {
  		firstName: 'Please enter your first name',
  		lastName: 'Please enter your last name',
  		phoneNumber: 'Please enter your phone number',
  		emailAddress: 'Please enter a valid email address',
    },
    highlight: highlight,
    errorElement: errorElement,
    errorClass: errorClass,
    errorPlacement: errorPlacement,
    success: success,
  });
  
  $('#form-4').validate({
  	rules: {
  		isConfirm: {
  			required: true
  		},
  	},
  	messages: {
			isConfirm: 'Please confirm that you agree with the terms'
		},
		highlight: highlight,
    errorElement: errorElement,
    errorClass: errorClass,
    errorPlacement: errorPlacement,
    success: success,
  });
});