//*******************************************************************************************

// logged events of salesman. logged to db.
function send_salesman_event(ename, eparam1, eparam2, eparam3) {
	var urlval = "SalesmanDataServlet";
	console.log("SalesmanLog: " + ename + " " + eparam1 + " " + eparam2 + " " + eparam3);
	$.ajax({
		type : "POST",
		url : urlval,
		data : {
			email : getCookie("SalesmanEmail").toLowerCase(),
			event_name : ename,
			param1 : eparam1,
			param2 : eparam2,
			param3 : eparam3,
			timezone_offset_min : tz_offset_min
		// sessionId : thisSessionId
		},
		success : function(res) {
			console.log("log servlet returned " + res);
			// alert(res); // display response as alert.
		},
		fail : function() {
			swal("error ajax salesman data servlet");
		}
	});
}
