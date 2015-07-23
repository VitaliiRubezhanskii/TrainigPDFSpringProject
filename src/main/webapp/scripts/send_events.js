//*******************************************************************************************

// logged events of salesman. logged to db.
function send_salesman_event(ename, eparam1, eparam2, eparam3) {
	urlval = "SalesmanDataServlet";
	$.ajax({
		type : "POST",
		url : urlval,
		data : {
			email : getCookie("SalesmanEmail"),
			event_name : ename,
			param1 : eparam1,
			param2 : eparam2,
			param3 : eparam3,
		// sessionId : thisSessionId
		},
		success : function(res) {
			console.log("salesman event returned " + res);
			// alert(res); // display response as alert.
		},
		fail : function() {
			swal("error ajax salesman data servlet");
		}
	});
}

