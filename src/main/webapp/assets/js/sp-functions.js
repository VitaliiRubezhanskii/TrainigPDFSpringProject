$(document).ready(function() {
	
	/**
	 * Add a salesman to the DB.
	 */
	$('form').submit(function(event) {
		
		var formData = {action: 'add-salesman'};
		 $('input:not([type=submit]), select').each(function(index){
			 formData[$(this).attr('id')] = this.value;
		 });
		
		$.ajax({
			async: false,
			type: 'POST',
			url: 'ManagementServlet',
			contentType : 'application/json; charset=utf-8',
			dataType: 'json',
			data: JSON.stringify(formData),
		}).done(function(data) {
			switch (data.statusCode) {
				case 200:
					alert('The user was added successfuly.');
					$('input:not([type=submit])').val('');
					$('select').val('gmail');
					break;

				case 100:
					alert('The user ' + formData.email + ' already exist.');
					break;
					
				case 101:
					alert('The user was not added. Magic inccorect.');
					break;
					
				default:
					alert('The user was not added. Error code: ' + data.statusCode + ".");
			}
		}).fail(function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);
		});
		
		event.preventDefault();
    });
});