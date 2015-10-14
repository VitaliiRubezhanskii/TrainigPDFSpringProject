// ******************************************************************************************
$('#uploadupdatedpresentationform').submit(function() {
	
	//alert("submitting updated file");
	//make sure text field is filled with salesman email (not visible)
	  $("#salesman_email").val(getCookie("SalesmanEmail").toLowerCase());
	  
	  // put pres name in field:
		var pres1 = [];
		// checkboxes from the pres1 list
		$('.pres1').each(
				function() {
					if ($(this).is(":checked")) {
						// without last @1 or @2:
						slidesid = this.id.substring(0,
								this.id.length - 2);
						console.log("Taking slides with id "
								+ slidesid);
						pres1.push(slidesid);
					}
				});

		if (pres1.length != 1) {
			swal("Can't do it", "Please select one presentation.", "error");
		} else 
		{	  					  
			$("#presentation_id").val(pres1);
					  // send alert
					send_salesman_event("UPLOADING_NEWPRES_FILE", '0', '0', pres1 + " " + getCookie("SalesmanEmail").toLowerCase());
					
		//			alert("submitting updated file. sent alert");
				/*	if ($("#oldpresname").val() == "") 
					{
						swal("Error",'Empty filename field.',"error");
						return false; // don't submit.
					}*/	
					
					if ($("#updatedfile").val() == "") 
					{
						swal("Error",'No PDF file selected.',"error");
						return false; // don't submit.
					}
					
			//		alert("submitting updated file. input ok.");
					
					// otherwise: wait msg and submit:
					  showWaitMsg(); //show it for a few seconds. I don't hide it, 
					  // it will disappear after X sec, or when submission leads to a new page.
					  					 
				//	  alert("not submitting updated file. now doing submit");
					  return true; //true means should do the submit action.
		} 

		//alert("not submitting updated file");
		return false; //don't submit.		
	});
