
/*************************************************************************/

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
	// get sessions for this msgid, then get their data and fill it in the html.
	function loadDataForMessage(msgid)
	{
		showWaitMsg();
		//alert("loading for msgid " + msgid)
		$("#questions_"+msgid).html("");
		$("#barcharts_"+msgid).html("");
		
		//console.log("Loading more data for history");
		
		$.ajax({
			type : "POST",
			url : "ReportsServlet",
			data : '{"action":"getSessionsByMsgId", "msgid":"' + msgid
					+ '"}',
			contentType : "application/json; charset=utf-8",
			currentMsgId : msgid,
			processData : false,
			error : 
				function(XmlHttpRequest, status, error) {
				swal("Error",'error from returned json.... ReportsServlet getSessionsForMsgId' + error,"error");
				},
			success : 
				function(msg) {						
							console.log("Found num sessions " + msg.sessions.length + " for msgid " + this.currentMsgId); 
							fillQuestions_InHistory(msg.sessions, this.currentMsgId);
							fillBarCharts_InHistory(msg.sessions, this.currentMsgId)
								//alert("found session " + msg.sessions[i] + " msgid " + msgid);
			//				console.log("Started filling q's and barcharts");							
				} 				
			});
				
//		console.log("history q's barcharts etc loaded successfully");//(without q's and barcharts)		
		hideWaitMsg();
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
							moreDataElement = '<div id="questions_'+msgid+'"></div>' +
									'<div id="barcharts_'+msgid+'"></div>';
													
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
		
	/**********************************************************************************/
	function fillBarCharts_InHistory(session_ids, msgid) {
		console.log("filling barcharts");
		
		// now we finished refreshing, we can add all the bar charts:
		
		if (session_ids.length == 0)
			{
					hideWaitMsg();
			}
		
		for (var i = 0; i < session_ids.length; i++) {
			curSessId = session_ids[i];
			// each has an ajax event to get the data:
			$
					.ajax({
						// / VERY important trick - this allows me to access the
						// index
						// inside the anonymous functions.
						curIndex : i, // can be accessed in success() using
										// this.curIndex
						currentMsgId : msgid,
						type : "POST",
						url : "ReportsServlet",
						data : '{"action":"getSlideViews", "sessionId":"'
								+ curSessId + '"}',
						contentType : "application/json; charset=utf-8",
						processData : false,
						error : function(XmlHttpRequest, status, error) {
							hideWaitMsg();
							alert('error from returned json.... ReportsServlet getSlideViews'
									+ error);
						},
						success : function(msg) {
							//console.log("fillBarCharts: getslideviews event returned "
			//								+ msg);
							// received slide views array.
							var jsonTable = [];
							for (var j = 0; j < msg.slideviews.length; j++) {
								slideNumStr = msg.slideviews[j].slideNum.toString();

								// check if this slide num is already in the json
								// table
								// if so - add space to the name so it will show in
								// the bar chart separately.
								for (var t = 0; t < jsonTable.length; t++) {
									if (jsonTable[t].slide == slideNumStr) {
										slideNumStr = slideNumStr + " "; // add
																			// space
																			// to
																			// avoid
																			// duplicate
																			// slide#.
									}
								}

								var time_viewed = msg.slideviews[j].timeViewed;
								// put cutoff of 180 of view time.
								if (time_viewed > 60) {
									time_viewed = 60;
								}

								jsonItem = {
									"slide" : slideNumStr,
									"time" : time_viewed
								};

								jsonTable.push(jsonItem);
							}
							
							//console.log("jsonTable:" + jsonTable);
							// alert("json table: " + JSON.stringify(jsonTable));
							// alert("adding bar chart number " + curIndex + " data
							// is " + JSON.stringify(jsonTable));
							addAlertBarChart("#barcharts_" + this.currentMsgId,
									jsonTable); // by class name.							
							hideWaitMsg();
						} // success func
					});
		}	
	}
	
	/**********************************************************************************/

	function fillQuestions_InHistory(session_ids, msgid) {
		//console.log("filling qs");
		// now we finished refreshing, we can add all the questions (i any)
		
		if (session_ids.length == 0)
		{							
		}
		
		for (var i = 0; i < session_ids.length; i++) {
			curSessId = session_ids[i];
			// each has an ajax event to get the data:
//			console.log("calling getquestions event");
			showWaitMsg();
			$
					.ajax({
						// / VERY important trick - this allows me to access the
						// index
						// inside the anonymous functions.
						curIndex : i, // can be accessed in success() using
										// this.curIndex
						currentMsgId : msgid,
						type : "POST",
						url : "ReportsServlet",
						data : '{"action":"getQuestions", "sessionId":"'
								+ curSessId + '"}',
						contentType : "application/json; charset=utf-8",
						processData : false,
						error : function(XmlHttpRequest, status, error) {
							hideWaitMsg();
							alert('error from returned json.... ReportsServlet getQuestions '
									+ error);
						},
						success : function(msg) {
							if (msg.questions.length > 0) {
								var qmessage = "<BR>The customer asked these questions: <BR>"
										+ '<ul style="list-style-type:disc">';
								for (var j = 0; j < msg.questions.length; j++) {
									var q = msg.questions[j];
									qmessage += "<li>" + q + "</li>";
								}
								qmessage += "</ul>";
								
								var oldqs =$("#questions_" + this.currentMsgId).html();
								console.log("q's: " + oldqs + qmessage);
								
								$("#questions_" + this.currentMsgId).hide().html(oldqs + qmessage).fadeIn('fast');
								// alert(qmessage);
							}							
							console.log("Question loaded successfully for history.");							
						} // success func
					});
		}
	}

	/**********************************************************************************/