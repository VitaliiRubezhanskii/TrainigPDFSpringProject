
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
}

function hideWaitMsg()
{
			$.mobile.loading( "hide");
}

//finished loading?
function isEverythingLoaded()
{
		return (alertsloaded && customersloaded && 
				presentationsloaded && questionsloaded && 
				barchartsloaded);
}


function hideLoadingMsgIfFullyLoaded()
{
	console.log("checking if all loaded: alerts " + alertsloaded + 
			" barcharts " + barchartsloaded + 
			" questions " + questionsloaded +
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
					console.log("alerts " + alertsloaded + 
							" barcharts " + barchartsloaded + 
							" questions " + questionsloaded +
							" customers " + customersloaded + 
							" pres " + presentationsloaded);
					
					if ((alertsloaded==false)||(barchartsloaded==false)||(questionsloaded==false))
						{
								fillAlerts();
						}
					if ((customersloaded==false) || (presentationsloaded==false))
						{
								fillCustomersAndPresentations();				
						}
					
					if (isEverythingLoaded() == false) //reschedule loading
						{	
								console.log("not all loaded on verify. rescheduling check.");
								setTimeout(verifyLoaded, 15000);
						}
					hideLoadingMsgIfFullyLoaded();
			}
}


