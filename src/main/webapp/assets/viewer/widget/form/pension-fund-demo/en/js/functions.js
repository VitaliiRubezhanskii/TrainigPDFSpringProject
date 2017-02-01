(function() {
	var progressBarWidth = 25;
	var sectionNumber = 1;
	
	var canvas = document.querySelector('canvas');
  var signaturePad = new SignaturePad(canvas);
  
  $('#hag-signature--clear').click(function() {
    signaturePad.clear();
  });
  
  $('[name="investmentAmount"]').on('input', function() {
		$(this).next('p').text('Value: ' + '$' + $(this).val());
	});
	
	$(function() {
	  $('.pagination li').click(function() {
	  	if ($('#form-1').valid()) {
	  		toggleSection($(this).attr('id'));
	  	}
	  });
	});

	function submitForm() {
		var payload = {
			fullName: $('[name="firstName"]').val() + ' ' + $('[name="lastName"]').val(),
	    emailFromAddress: 'notifications@slidepiper.com',
	    emailToAddress: $('[name="emailAddress"]').val(),
	    emailSubject: 'Response has been received',
	    emailBody: 'This is a demo email response, thank you for trying our product.',
	    smsMessage: 'Dear ' + $('[name="firstName"]').val() + ', this is a demo SMS, thank you for trying our product.',
	    phoneNumber: $('[data-countrycode]:checked').attr('data-value') + $('[name="phoneNumber"]').val(),
	    senderId: 'SlidePiper'
	  }
		
		$.ajax({
			type: 'post',
			url: 'https://www.slidepiper.com/v1/customer-message/',
			contentType: 'application/json',
			data: JSON.stringify(payload)
		});
	}
	
	function toggleSection(sectionId) {
		var isTermsAccepted = true;
		
		switch (sectionId) {
      case 'pagination-previous':
    	  if (sectionNumber > 1) {
    	    sectionNumber--;
    	  }
    	  break;
      
      case 'pagination-1':
    	  sectionNumber = 1;
    	  break;
      	  
    	case 'pagination-2':
    	  sectionNumber = 2;
    	  break;
    	  
    	case 'pagination-3':
    	  sectionNumber = 3;
    	  break;
    	  
    	case 'pagination-4':
    	  sectionNumber = 4;
    	  break;
    	  
      case 'pagination-next':
    	  if (sectionNumber < 5) {
    	    sectionNumber++;
    	  }
    	  
    	  if ($('#pagination-next a').hasClass('submit-form')) {
	    	  if ($('#form-4').valid()) {
	    	  	submitForm();
	    	  	isTermsAccepted = true;
	    	  } else {
	    	  	sectionNumber = 4;
	    	  	isTermsAccepted = false;
	    	  }
    	  }
    	  break;
    }
  
		if (isTermsAccepted) {
			$('section').hide();
	    $('.progress-bar').css('width', (progressBarWidth * sectionNumber).toString() + '%');
	    $('#section-' + sectionNumber).show();
	    $('.pagination li').removeClass('active');
	    $('#pagination-' + sectionNumber).addClass('active');
	    
	    if (sectionNumber === 4) {
	    	$('#pagination-next a')
	    		.addClass('submit-form')
	    		.text('Submit');
	    } else {
	    	$('#pagination-next a')
	    		.removeClass('submit-form')
	    		.text('Next');
	    }
	    
	    if (sectionNumber === 5) {
	    	$('.pagination-container').hide();
	    }
		}
	}
})();
