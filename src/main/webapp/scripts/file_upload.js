

$('#uploadform').submit(function() {
	
	//make sure text field is filled with salesman email (not visible)
	  $("#salesman_email").val(getCookie("SalesmanEmail").toLowerCase());
	  
	//send_salesman_event("UPLOADING_FILE", '0', '0', $("#newpresname").val() + " " + getCookie("SalesmanEmail").toLowerCase());
	if ($("#newpresname").val() == "") 
	{
		swal("Error",'Empty filename field.',"error");
		return false; // don't submit.
	}
	
	
	if ($("#file").val() == "") 
	{
		swal("Error",'No PDF file selected.',"error");
		return false; // don't submit.
	}
	
	// otherwise: wait msg and submit:
	
	  showWaitMsg(); //show it for a few seconds. I don't hide it, 
	  // it will disappear after X sec, or when submission leads to a new page.
	  
	  
	  return true; //true means should do the submit action.
	});

$('#uploadcustomersform').submit(function() {
	  //make sure text field is filled with salesman email (not visible)
	  $("#salesman_email_for_csv").val(getCookie("SalesmanEmail").toLowerCase());
	send_salesman_event("UPLOADING_CSV_FILE", '0', '0', "new CSV" + " for email " + getCookie("SalesmanEmail").toLowerCase());
	
	if ($("#filecsv").val() == "") 
	{
		swal("Error",'No CSV file selected.',"error");
		return false; // don't submit.
	}
	
	// otherwise: wait msg and submit:
	
	  showWaitMsg(); //show it for a few seconds. I don't hide it, 
	  // it will disappear after X sec, or when submission leads to a new page.
	  

	  return true; //true means should do the submit action.
	});
