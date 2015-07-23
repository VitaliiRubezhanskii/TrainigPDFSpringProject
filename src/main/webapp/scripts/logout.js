

// *******************************************************************************************

$("#logout").bind("click", function(event, ui) {
	console.log("logout");
	// this logs me off.
	setCookie("SalesmanEmail", "", 2);
	swal("Logged out.\n Thanks for using SlidePiper!");

	// reloads page with the redirect (with #)
	window.location = window.location.pathname;
});




//*******************************************************************************************
//automatic login for local testing.
//this is OBSOLETE - I now login automatically if cookie exists.
//for now, start at manage.
//if (document.location.hostname == "localhost")
//{
//setTimeout(
//function()
//{
//setCookie("SalesmanEmail", "david.salesmaster@gmail.com", 2);
//$("#usernamefield").val("david.salesmaster@gmail.com");
//managementScreen();
//}, 1500
//);
//}

