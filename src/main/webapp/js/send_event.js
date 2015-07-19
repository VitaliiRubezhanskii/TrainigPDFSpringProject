

		
		// this runs ONCE for each page refresh - 
		// sets a unique id for this user, for his events.
	    thisSessionId = Math.random().toString();	


// send event, add to database table customer_events
// Important note: params have different types
// param1 - int
// param2 - float
// param 3 - text
// for text messages, use only param3.
		function send_event(sourceid, ename, eparam1, eparam2, eparam3) {
			urlval= "CustomerDataServlet";

			$.ajax({
				type : "POST",
				url : urlval,
				data : {
					id : sourceid,
					event_name : ename,					
					param1 : eparam1,
					param2 : eparam2,
					param3 : eparam3,
					sessionId : thisSessionId
				},
				success : function(res) {
					//   alert(res); // display response as alert.
					console.log("logged successfully. " +res);
					// nothing happens on success of logging.
					// in case of problems, remove the comment above
					// to check.
				},
				fail : function() {
					alert("Error in sending event AJAX");
				}
			});
		}

// send text-only event. ignore the number parameters, put zero.
		function send_text_event(sourceid, ename, textval) 
		{
				send_event(sourceid, ename, "0", "0", textval);		
		}
