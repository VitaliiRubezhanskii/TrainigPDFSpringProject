// fill data from DB
function fillCustomersAndPresentations() {
	//console.log("fillCustAndPres");
	// alert("filling custs & pres");
	// ClearLists();
	var email = getCookie("SalesmanEmail");
	//console.log("getSalesmanData ajax");
	{
		$.ajax({
			type : "POST",
			url : "ManagementServlet",
			data : '{"action":"getSalesmanData", "email":"'
					+ email.toLowerCase() + '"}',
			contentType : "application/json; charset=utf-8",
			processData : false,
			error : function(XmlHttpRequest, status, error) {
				alert('error from returned json getSalesmanData' + error);
			},
			success : function(msg) {
				
				//console.log("getSalesmanData ajax returned");
				var size = msg.myCustomers.length;
				// var myCustomers = "";
				//console.log("# of customers: " + msg.myCustomers.length);
				custCheckboxes = '<fieldset data-role="controlgroup">';
				if (size > 0) {
					for (var i = 0; i < msg.myCustomers.length; i++) {
						// console.log("adding customer " +
						// msg.myCustomers[i].name);
						custCheckboxes += makeCustomerCb('cust' + i,
								msg.myCustomers[i].name, 'customers',
								msg.myCustomers[i].email);

						// alert('cust email ' + msg.myCustomers[i].email);
					}
					custCheckboxes += '</fieldset>';
					$("#customersDiv").html(custCheckboxes);
				}
				
				console.log("Customers loaded successfully");
				// $(".customerSelect").html(myCustomers);
				var presentations = "";
				pres1Checkboxes = '<fieldset data-role="controlgroup">';
				pres2Checkboxes = '<fieldset data-role="controlgroup">';
				for (var i = 0; i < msg.presentations.length; i++) {
					// console.log("adding pres " + msg.presentations[i].name +
					// " with id " + msg.presentations[i].id);
					// $("#presentations1").append(makeCb('slides'+i,msg.presentations[i].name));//.trigger(
					// "create" );
					// $("#presentations2").append(makeCb('slides'+i,msg.presentations[i].name));//.trigger(
					// "create" );
					// presentations += "<option value='" +
					// msg.presentations[i].name + "'>" +
					// msg.presentations[i].name + "</option>";
					// presentations += msg.presentations[i].name;

					// need to remove the @1 @2 when using the id, leave only
					// capital letters, that's what I allow.
					pres1Checkboxes += makeCb(msg.presentations[i].id + "@1",
							msg.presentations[i].name, 'pres1');
					pres2Checkboxes += makeCb(msg.presentations[i].id + "@2",
							msg.presentations[i].name, 'pres2');
				}
				pres1Checkboxes += '</fieldset>';
				pres2Checkboxes += '</fieldset>';
				$("#pres1Div").html(pres1Checkboxes);
				$("#pres2Div").html(pres2Checkboxes);
				
				console.log("Presentations loaded successfully");
				// refreshLists();
				// refreshPage();
				// setTimeout(function() { changepage('#manage');} , 400);
				// $(".presentationSelect").html(presentations);
				// $.mobile.activePage.trigger("pagecreate");
				// alert("loaded cust" + custCheckboxes + " pres " +
				// pres1Checkboxes);

				// refresh each element in returned list - should be all
				// checkboxes.
				// refresh as in
				// http://www.gajotres.net/uncaught-error-cannot-call-methods-on-prior-to-initialization-attempted-to-call-method-refresh/
				setTimeout(function() {
					$('.jqmcheckbox').checkboxradio().checkboxradio("refresh");
					
					customersloaded=true;
					presentationsloaded=true;
					// after the refreshes, it's all fully loaded.
										
					hideLoadingMsgIfFullyLoaded();
				}, 0); // put at end of event queue, after rending checkboxes.
				// alert("fill cust & pres done");
			}
		});
	}

	//console.log("fillcustAndPres done");
}



//*******************************************************************************************

function fillAlerts() {
	//console.log("fillAlerts");
	var email = getCookie("SalesmanEmail");
	// alert("email before get alerts:" + email);
	//console.log("fillAlerts ajax");
	$
			.ajax({
				type : "POST",
				url : "ReportsServlet",
				data : '{"action":"getAlerts", "email":"' + email.toLowerCase()
						+ '"}',
				contentType : "application/json; charset=utf-8",
				processData : false,
				error : function(XmlHttpRequest, status, error) {
					alert('error from returned json.... ReportsServlet' + error);
				},
				success : function(msg) {
					//console.log("fillAlerts ajax returned");
					alertsHTML = '';
					// show some of the data, for testing.
					// init sessionIds array, all session id's for all alerts.
					alerts_session_ids = [];
					for (var i = 0; i < msg.alerts.length; i++) {
						alerts_session_ids[i] = msg.alerts[i].session_id;
						datetimealert = msg.alerts[i].open_time;
						emailmailto = '<a style="color:white" href="mailto:'
								+ msg.alerts[i].customer_email
								+ '?Subject=Followup to our last email.">'
								+ msg.alerts[i].customer_email + '</a>';
						recommendation_text = '<div class="recommendation' + i
								+ '">' + msg.alerts[i].customer_name + ' ('
								+ emailmailto + ')' + '</div>';
						alertsHTML += '<li data-role="list-divider">'
								+ recommendation_text + ' </li>';

						description_text = "Viewed presentation: \""
								+ msg.alerts[i].slides_name + "\"";
						clicked_text = "Opened at " + msg.alerts[i].open_time;
						// + " (message sent at " + msg.alerts[i].send_time +
						// ").";
						// + "<BR><BR> Original Message: <BR>" +
						// msg.alerts[i].msg_text;
						alertsHTML += '<li>';
						alertsHTML += '<div class="ui-grid-b ui-responsive">';

						// I put sessionId inside a div inside the button
						// because
						// that's the only way I found I can access this
						// property from the
						// click event.
						alertsHTML += '<div class="ui-block-a">' 
								//+ '<h2>'
								+ description_text								
								//+ '</h2>'
								+ '<BR>'
								//+ '<p>' 
								//+ '<strong>'
								+ clicked_text
								//+ '</strong>' 
								//+ '</p>'
								+ '<div  class="questions'
								+ i
								+ '"></div>'
								+ '<a href="" sessId="'
								+ msg.alerts[i].session_id
								+ '"'
								+ ' class="doneButton'
								+ i
								+ ' ui-btn ui-shadow ui-btn-inline ui-mini ui-icon-check ui-btn-icon-left" data-inline="true" data-mini="true">'
								+ '<div sessId="' + msg.alerts[i].session_id
								+ '" id="' + msg.alerts[i].session_id
								+ '">Done</div></a>' + '</div>' + // of
																	// ui-block-a
								'<div class="ui-block-b">'
								+ '<div class="d3barchart' + i + '"></div>'
								+ '</div>';
						// close main responsive div, and listitem element.
						alertsHTML += '</div></li>';
					}

					// alert(alertsHTML);
					$("#smartalerts").html(alertsHTML);
					console.log("fillAlerts ajax returned updated alerts");

					// alert("filled alerts");

					// refresh each element in returned list.
					// refresh as in
					// http://www.gajotres.net/uncaught-error-cannot-call-methods-on-prior-to-initialization-attempted-to-call-method-refresh/
					setTimeout(
							function() // pass the return parameters to this
										// anonymous func
							{
							//	console
								//		.log("fillAlerts ajax returned done - timeout func - refreshing");
								// alert("refreshing...");
								$('#smartalerts').listview("refresh");

								//console
									//	.log("fillAlerts ajax returned done - refresh listview");

								// alert("filling stuff");
								fillBarCharts(alerts_session_ids);
								fillQuestions(alerts_session_ids);
								// alert("done filling stuff");
								bindDoneButtons(alerts_session_ids);
								// alert("done bind stuff");

								//console
									//	.log("fillAlerts ajax returned done - done barcharts, q's, done btns");
								// wait for callbacks to finish before updating
								// done button.
								// alert("yoyo");
								// setTimeout(BindDoneButtons(), 1000);

							}, 1000); // put at end of event queue, after
									// rendering checkboxes.
									// small delay, may help with listview refresh. 
					console.log("fillAlerts ajax returned done.");
					
					
					alertsloaded = true;
					console.log("Alerts loaded successfully");//(without q's and barcharts)										 
				} // success func

			});
	console.log("fillAlerts all done");
}

function fillBarCharts(alerts_session_ids) {
	console.log("filling barcharts");
	
	// now we finished refreshing, we can add all the bar charts:
	
	if (alerts_session_ids.length == 0)
		{
				barchartsloaded = true; // no barcharts.
				hideLoadingMsgIfFullyLoaded();
		}
	
	for (var i = 0; i < alerts_session_ids.length; i++) {
		curSessId = alerts_session_ids[i];
		// each has an ajax event to get the data:

		//console.log("fillBarCharts calling getslideviews event");
		$
				.ajax({
					// / VERY important trick - this allows me to access the
					// index
					// inside the anonymous functions.
					curIndex : i, // can be accessed in success() using
									// this.curIndex
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
						console
	//							.log("fillBarCharts: getslideviews event returned "
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
							if (time_viewed > 180) {
								time_viewed = 180;
							}

							jsonItem = {
								"slide" : slideNumStr,
								"time" : time_viewed
							};

							jsonTable.push(jsonItem);
						}
						// alert("json table: " + JSON.stringify(jsonTable));
						// alert("adding bar chart number " + curIndex + " data
						// is " + JSON.stringify(jsonTable));
						addAlertBarChart(".d3barchart" + this.curIndex,
								jsonTable); // by class name.
						barchartsloaded = true; //this is for ONE barchart actually,
						// but should usually mean all were loaded OK.
						console.log("Barchart loaded successfully");						
						hideLoadingMsgIfFullyLoaded();						
					} // success func
				});
	}	
}

function fillQuestions(alerts_session_ids) {
	//console.log("filling qs");
	// now we finished refreshing, we can add all the questions (i any)
	
	if (alerts_session_ids.length == 0)
	{
			questionsloaded = true; // no questions.
			hideLoadingMsgIfFullyLoaded();
	}
	
	for (var i = 0; i < alerts_session_ids.length; i++) {
		curSessId = alerts_session_ids[i];
		// each has an ajax event to get the data:
//		console.log("calling getquestions event");
		showWaitMsg();
		$
				.ajax({
					// / VERY important trick - this allows me to access the
					// index
					// inside the anonymous functions.
					curIndex : i, // can be accessed in success() using
									// this.curIndex
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
						hideWaitMsg();
						//console.log("getqs event returned");
						// recommendation text (email for now)
						var recom = $(".recommendation" + this.curIndex).html();

						if (msg.questions.length > 0) {
							qmessage = "The customer asked these questions: <BR>"
									+ '<ul style="list-style-type:disc">';

							for (var j = 0; j < msg.questions.length; j++) {
								q = msg.questions[j];
								qmessage += "<li>" + q + "</li>";
							}
							qmessage += "</ul>";

							$(".questions" + this.curIndex).html(qmessage);

							// alert(qmessage);
							$(".recommendation" + this.curIndex).html(
									"Call " + recom);
						} else // no q's
						{
							$(".recommendation" + this.curIndex).html(
									"Send e-mail to " + recom);
						}
						questionsloaded = true;
						console.log("Questions loaded successfully");
						hideLoadingMsgIfFullyLoaded();
					} // success func
				});
	}
	//console.log("filling qs done");
}
	