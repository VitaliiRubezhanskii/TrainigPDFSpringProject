
function doneClick(sessId) // i is index of done button
{
	console.log("clicked done for sessid " + sessId);
	// alert('clicked for session id ' + sessId + ' this is :' +this);

	// sessId = $(this).attr("sessionId");
	// alert("done button::: sessionId " + sessId);
	// alert("done button" + this.closest('button').attr('id'));
	// alert("1 is " + event.target.id);
	// alert("8obj2 tostr is " + event.target.sessionId);

	// call servlet for done button with this session id
	alertsloaded=false;
	questionsloaded=false;
	barchartsloaded=false;
	showWaitMsg();
	console.log("done ajax");
	$.ajax({
		type : "POST",
		url : "ReportsServlet",
		data : '{"action":"setDone", "sessionId":"' + sessId + '"}',
		contentType : "application/json; charset=utf-8",
		processData : false,
		error : function(XmlHttpRequest, status, error) {
			alert('error from setdone ' + error);
		},
		success : function(msg) {
			// done set. need to refresh the list.
			console.log("done ajax event returned " + msg);
			fillAlerts();			
		}
	});
}

function bindDoneButtons(alerts_session_ids) {
	console.log("bind done buttons");
	// alert("binding done btns");

	for (var i = 0; i < alerts_session_ids.length; i++) {
		curSessId = alerts_session_ids[i];

		$(".doneButton" + i).bind("click", function(event) {
			// works - html
			// alert($(event.target).html());
			// undefined:
			// alert($(event.target).id);

			// works - real id - session id
			// alert($(event.target).attr("id"));
			doneSessionId = $(event.target).attr("id");
			console.log("DONE for session: " + doneSessionId);

			doneClick(doneSessionId);

			// all useless:
			// alert(event.target);
			// alert(event.target.id);
			// alert(event.target.sessId);
			// alert($(event.target));
			// alert($(event.target).id);
			// alert($(event.target).sessId);
			// alert($(event.target).attr("sessId"));
			// alert($(event.target)[0].parentNode.html());
			// alert($(event.target)[0].parentNode.sessId);
			// alert($(event.target)[0].parentNode.attr("sessId"));
			// alert(event.target);
			// alert("sessid1: " + this.attr("sessId").text());
			// alert("sessid2: " + this.attr("sessId").text());
			// alert("sessid3: " + $());
			// alert("sessid4: " + this.sessId);
			// alert("sessid5: " + this.attr("sessId"));
			// alert("sessid6: " + this.attr("sessId").text());
		});

		// each has an ajax event to get the data:
		// inject dynamic code. maybe also possible with eval().
		// $(".doneButton"+i).onClick = "doneClick( " + curSessId + ");";

		/*
		 * function() { console.log("Now in doneButton click for session " ) //
		 * evaluate this code and run it. // this allows me to dynamically
		 * create it with different //sessionid each time. eval("doneClick( " +
		 * curSessId + ");" ); } );
		 */
	}
	console.log("binding done btns done");
}

