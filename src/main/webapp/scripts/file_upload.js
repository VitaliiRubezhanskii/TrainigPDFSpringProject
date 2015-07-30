

$('#uploadform').submit(function() {
	send_salesman_event("UPLOADING_FILE", '0', '0', $("#newpresname").val());
	if ($("#newpresname").val() == "") 
	{
		swal("Error",'Empty filename field.',"error");
		return false; // don't submit.
	}
	
	
	if ($("#file").val() == "") 
	{
		swal("Error",'No file selected.',"error");
		return false; // don't submit.
	}
	
	// otherwise: wait msg and submit:
	
	  showWaitMsg(); //show it for a few seconds. I don't hide it, 
	  // it will disappear after X sec, or when submission leads to a new page.
	  
	  //make sure text field is filled with salesman email (not visible)
	  $("#salesman_email").val(getCookie("SalesmanEmail").toLowerCase());
	  return true; //true means should do the submit action.
	});


$("#file").change(function(){ //on selecting file put name in presentation name box
    	//alert("file selected: " + $("#file").val());
    	var fullPath = $("#file").val();
    	var filename = fullPath.replace(/^.*[\\\/]/, ''); //clear path
    	filename = filename.substr(0, filename.lastIndexOf('.'));
    	$("#newpresname").val(filename);
});
