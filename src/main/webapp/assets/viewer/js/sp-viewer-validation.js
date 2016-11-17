var sp = sp || {};

sp.validate = sp.validate || {};
sp.validate.controller = {
	init: $(function() {
	  var highlight = function(element) {
	    $(element).closest('.form-group')
	      .addClass('has-error has-feedback').removeClass('has-success');
	  };
	  var errorElement = 'span';
	  var errorClass = 'sp-validation__error-message';
	  var errorPlacement = function(error, element) {
	    element.closest('.form-group').append(error);
	  };
	  var success = function(element) {
	    
	    // Remove error.
	    $(element).closest('.form-group').removeClass('has-error');
	  
      // Add success.
      $(element).closest('.form-group').addClass('has-success has-feedback');
	  };
	  
	  // Widget 3.
		$('#widget3-form').validate({
	    rules: {
	    	widget3Email: {
	        email: true,
	        required: true,
	      },
	    },
	    messages: {
	    	widget3Email: sp.validate.errorMessage
	    },
	    highlight: highlight,
	    errorElement: errorElement,
	    errorClass: errorClass,
	    errorPlacement: errorPlacement,
	    success: success,
		});
	}),
};