

// *******************************************************************************************
// *******************************************************************************************
// go to management screen, fill all needed fields.
function managementScreen() {
	console.log("going to mgmt");
	// alert("going to mgmt");
	// $("#usernamefield").val("sivan@gmail.com");
	changepage('#manage');
	
	// Show 2 seconds after page loads. 
	// It will be hidden after everything is fully loaded.
	// needed only for mgmt screen.
	//setTimeout(showWaitMsg, 2000);
	// data will be updated in page when it loads in pagecontainershow event,
	// see above.

	// alert("changed page");
}
