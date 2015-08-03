// *******************************************************************************************
function initPage() {
	// alert("init page");
	$(
			"#fromTemplate, #clear2, #fromTemplate2,"
					+ " #addCampaign, #removeCampaign, #editCampaign,"
					+ " #addPres2, #removePres2, #editPres2, #send_email_to_campaign,"
					+ " #editCustomerButton").bind(
			"click",
			function(event, ui) {
				send_salesman_event("BUTTON_CLICK", '0', '0', this.id);
				swal("Not yet", "This feature is coming soon (" + this.id
						+ "). ");
			});

	$("#salesman_email").val(getCookie("SalesmanEmail").toLowerCase());
	$("#myAccount").html(getCookie("SalesmanEmail").toLowerCase());
}

// run init on event.
$(document).on("pageinit", initPage());

// load data after page show.
// needs to be run only for manage page, so it checks.
$(document).on("pagecontainershow", function() {
	var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
	var activePageId = activePage[0].id;
	switch (activePageId) {
	case 'main':
		send_salesman_event("OPEN_LOGIN", '0', '0', "");
		if (getCookie("SalesmanEmail") != "") // already logged in.
		{
			console.log("already logged in. going to mgmt");
			// set username field.
			$("#usernamefield").val(getCookie("SalesmanEmail").toLowerCase());
			$("#salesman_email").val(getCookie("SalesmanEmail").toLowerCase());
			$("#myAccount").html(getCookie("SalesmanEmail").toLowerCase());
			// go to mgmt screen after waiting for all callbacks and refreshes.
			setTimeout(function() {
				managementScreen();
			}, 0);
		}
		break;
	case 'manage':
		send_salesman_event("OPEN_MANAGE", '0', '0', "");
		// alert("filling lists");
		console.log("manage check logged in");
		// if already logged in
		if (getCookie("SalesmanEmail") != "") {
			// set username field.
			console.log("initPage check logged in - YES - cookie is set");
			loggedin = true;
			$("#usernamefield").val(getCookie("SalesmanEmail").toLowerCase());
			$("#salesman_email").val(getCookie("SalesmanEmail").toLowerCase());
						
			//alert("setting to " + getCookie("SalesmanEmail").toLowerCase());						
			$("#myAccount").html(getCookie("SalesmanEmail").toLowerCase());
			
			console.log("in mgmt screen. filling. ");
			showWaitMsg();
			setTimeout(function() {
				fillCustomersAndPresentations();
				fillAlerts();
				
				if (verifyingactivated==false) //only once.
				{
						setTimeout(verifyLoaded, 18000);
						// must be very large number.
						// If I start reloading when it's still loading I'll get a 
						// bug in the presentations list, names will be displayed twice.
						verifyingactivated = true;
				}
			}, 2000);
		} else {
			console.log("Not logged in.");
			loggedin = false; // also default

			// check if we are at main screen:
			// if there's no # sign then location is same as pathname.
			// check if not equal.
			// alert("Cur loc: " + window.location.href.contains("#"));

			// if (window.location.href.contains("#")) not good
			// alert("url is: " + window.location.href);
			// if(window.location.href.indexOf("manage") > -1) {
			// console.log("your url contains #. going back.");

			swal("Not logged in.", "Redirecting to login screen.", "error");
			setTimeout(function() {
				window.location = window.location.pathname;
			}, 2000);
		}
		break;
		
		
	case 'history_page':
		send_salesman_event("OPEN_HISTORY", '0', '0', "");
		console.log("history check logged in");
		// if already logged in
		if (getCookie("SalesmanEmail") != "") {
			// set username field.
			console.log("In History: initPage check logged in - YES - cookie is set");
			loggedin = true;
			$("#usernamefield").val(getCookie("SalesmanEmail").toLowerCase());
			$("#salesman_email").val(getCookie("SalesmanEmail").toLowerCase());
			$("#myAccount").html(getCookie("SalesmanEmail").toLowerCase());
			console.log("in history screen. filling. ");
			showWaitMsg();
			setTimeout(function() {
				fillHistory();
			}, 1000);
		} else {
			console.log("History: not logged in.");
			loggedin = false; // also default
			swal("Not logged in.", "Redirecting to login screen.", "error");
			setTimeout(function() {
				window.location = window.location.pathname;
			}, 2000);
		}
		break;
	default:
		swal("Error: page id not in case. " + activePageId);
	}
});
