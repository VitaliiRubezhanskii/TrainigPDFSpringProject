
// this script must be included after 
// defining fillCustomersAndPres... and fillAlerts

function showWaitMsg()
{
			$.mobile.loading( "show", {
			text: "Please wait...",
			textVisible: true,
			theme: "b",
			html: ""
			});
			
			// ANYWAY, hide after 20sec.
			setTimeout(hideWaitMsg, 20000);			
}

function hideWaitMsg()
{
			$.mobile.loading( "hide");
}

//finished loading?
function isEverythingLoaded()
{
	// no alerts
		return (customersloaded && 
				presentationsloaded);
}


function hideLoadingMsgIfFullyLoaded()
{
	console.log("checking if all loaded: "+ 			 			
			" customers " + customersloaded + 
			" pres " + presentationsloaded);
	
			if (isEverythingLoaded())
				{
						console.log("hiding hourglass");
						hideWaitMsg();
				}
}

/// runs after some seconds after refresh, 
// makes sure loaded, if not reloads some.
function	 verifyLoaded()
{
			if (loggedin == true)
			{
					console.log("Verifying loading of data from DB. stack=" + Error().stack);
					console.log(" customers " + customersloaded + 
							" pres " + presentationsloaded);
					
					if ((customersloaded==false) || (presentationsloaded==false))
						{
								fillCustomersAndPresentations();
								swal("Error", "Error loading your data.", "error");
						}
					
					if (isEverythingLoaded() == false) //reschedule loading
						{	
								console.log("not all loaded on verify. rescheduling check.");
								//setTimeout(verifyLoaded, 45000);
						}
					hideLoadingMsgIfFullyLoaded();
			}
}


