
	console.log(" binding history");
	$("#history").bind(
			"click",
			function(event, ui) {
				console.log("showing history screen");
				changepage('#history_page');
			} // click function in gotoManage
	); // end of bind gotoManage

	
	$("#historyBack").bind(
			"click",
			function(event, ui) {
				console.log("back from history - showing mgmt screen");
				managementScreen();
			} // click function in gotoManage
	); // end of bind gotoManage

	


	//*********************************************************************

	function makeGridItemTop(blockletter, content, heightpx)
	{
		return '<div class="ui-block-' + blockletter + '">'+
		'<div class="ui-bar ui-bar-a" style="height:' + heightpx +'px">'+content+'</div></div>';
	}

	function makeGridItemBody(blockletter, content, heightpx)
	{
		return '<div class="ui-block-' + blockletter + '">'+
		'<div class="ui-body ui-body-d" style="height:' + heightpx +'px">'+content+'</div></div>';
	}

	//*******************************************************************************************


	// load questions and barcharts for all sessions for this msgid
	function loadDataForMessage(msgid)
	{
		//alert("loading for msgid " + msgid);
		$("#"+msgid).html("Loading more data. Please wait.");
		$("#"+msgid).html(""); //for now, not loading anything more.
		console.log("Loading more data for history");
		hideWaitMsg();
		console.log("history q's barcharts etc loaded successfully");//(without q's and barcharts)
	}

	//*******************************************************************************************

	function fillHistory() {
		console.log("fillHistory");
		var email = getCookie("SalesmanEmail");
		//alert("email before get history:" + email);
		showWaitMsg();
		$
				.ajax({
					type : "POST",
					url : "ReportsServlet",
					data : '{"action":"getHistory", "email":"' + email.toLowerCase()
							+ '"}',
					contentType : "application/json; charset=utf-8",
					processData : false,
					error : function(XmlHttpRequest, status, error) {
						swal("Error",'error from returned json.... ReportsServlet getHistory' + error,"error");
					},
					success : function(msg) {
						//console.log("fillAlerts ajax returned");
						historyHTML = '';
						// show some of the data, for testing.
						// init sessionIds array, all session id's for all alerts.
						history_msg_ids = [];

						for (var i = 0; i < msg.history.length; i++) 
						{
							history_msg_ids[i] = msg.history[i].msgId;
							customername = msg.history[i].customerName;
							customeremail = msg.history[i].customerEmail;
							messagetext=msg.history[i].messageText;
							msgid=msg.history[i].msgId;
							slidesname=msg.history[i].slidesName;
							send_time=msg.history[i].timestamp;
							
							historyHTML += "<div class='ui-grid-b'>";
							historyHTML += makeGridItemTop("a","<h3>Customer Name</h3>",40);					
							historyHTML += makeGridItemTop("b","<h3>Presentation</h3>",40);
							historyHTML += makeGridItemBody("a",customername,40);											
							historyHTML += makeGridItemBody("b",slidesname,40);
							historyHTML += '</div>';
														
							messageElement = "<div class='ui-grid-b'>" +messagetext+ "</div>"; 
							
							// element for q's and barcharts
							moreDataElement = '<div id='+msgid+'>Please wait for more data to load here...</div>';
													
							historyHTML += '<div><p><BR><b>Message:</b>'+messageElement +'<BR>' + moreDataElement + '</p></div>';
							historyHTML += 
									"<div><p>" +
									"Sent to " + customeremail + " at " + send_time + 
									"</p></div>";
						}

						// update history data
						for (var i = 0; i < history_msg_ids.length; i++) 
						{							 					
								setTimeout(
											loadDataForMessage, 300, history_msg_ids[i]); // put at end of event queue, after evt queue
						}

											
						// alert(alertsHTML);
						$("#historyDiv").hide().html(historyHTML).fadeIn('fast');
						console.log("fillHistory ajax returned updated history");
																						 
						console.log("fillHistory ajax returned done.");
											
					} // success func
				});
		
		console.log("fillHistory all done");
	}
