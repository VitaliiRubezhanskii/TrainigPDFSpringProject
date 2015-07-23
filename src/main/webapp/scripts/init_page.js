// *******************************************************************************************
function initPage() {	
	//alert("init page");
	$(
			"#fromTemplate, #clear2, #fromTemplate2,"
					+ " #addCampaign, #removeCampaign, #editCampaign,"
					+ " #addPres2, #removePres2, #editPres2, #send_email_to_campaign,"
					+ " #history, #editCustomerButton").bind("click",
			function(event, ui) {
				send_salesman_event("BUTTON_CLICK", '0', '0', this.id);
				swal("Not yet", "This feature is coming soon (" + this.id + "). ");
			});

	$("#salesman_email").val(getCookie("SalesmanEmail"));
	
	console.log("initPage check logged in");
	// if already logged in
	if (getCookie("SalesmanEmail") != "") {
		// set username field.
		console.log("initPage check logged in - YES - cookie is set");
		loggedin = true;
		$("#usernamefield").val(getCookie("SalesmanEmail"));
		// go to mgmt screen after waiting for all callbacks and refreshes.
	  setTimeout(function() {managementScreen();}, 0);
	}
	else
		{
				loggedin = false; //also default
		}
}



//run init on event.
$(document).on("pageinit", initPage());

//load data after page show.
//needs to be run only for manage page, so it checks.
$(document).on("pagecontainershow", function() {
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
	var activePageId = activePage[0].id;
	switch (activePageId) {
	case 'main':
		if (getCookie("SalesmanEmail") != "") // already logged in.
		{
			console.log("already logged in. going to mgmt");
			// set username field.
			$("#usernamefield").val(getCookie("SalesmanEmail"));
			// go to mgmt screen after waiting for all callbacks and refreshes.
			setTimeout(function() {
				managementScreen();
			}, 0);
		}
		break;
	case 'manage':
		// alert("filling lists");
		console.log("in mgmt screen. filling. ");
		showWaitMsg();
		fillCustomersAndPresentations();
		fillAlerts();
		break;

	default:
		swal("Error: page id not in case. " + activePageId);
	}
});


