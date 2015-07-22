	
	// this runs ONCE for each page refresh - 
	// and this will make ONE report entry in the smart alerts.
    thisSessionId = Math.random().toString();
    
  function keepalive_event(estimatedTimeViewed_param, slideNum_param) {
		urlval= "../KeepAliveServlet";
		//if (document.location.hostname == "localhost")
		//	{
		//			urlval = "/SlidePiper/CustomerDataServlet";
		//	}
		
		paramJSON = 
		{
			"action" : "keepAlive",
			"msgId" : getCookie("msgid"),
			"sessionId" : thisSessionId,
			"slideNum" : slideNum_param,
			"estimatedTimeViewed" : estimatedTimeViewed_param						
		};
			
		$.ajax({
			type : "POST",
			url : urlval,
			data : JSON.stringify(paramJSON),
			success : function(res) {
				//   alert(res); // display response as alert.                     
			},
			fail : function() {
				alert("error in ajax of keepalive");
			}
		});
	}

	
		function send_event(ename, eparam1, eparam2, eparam3) {
			urlval= "../CustomerDataServlet";

			$.ajax({
				type : "POST",
				url : urlval,
				data : {
					id : getCookie("msgid"),
					event_name : ename,
					param1 : eparam1,
					param2 : eparam2,
					param3 : eparam3,
					sessionId : thisSessionId
				},
				success : function(res) {
					//   alert(res); // display response as alert.
					// nothing happens on success of logging.
					// in case of problems, remove the comment above
					// to check.
				},
				fail : function() {
					alert("Error in sending event AJAX");
				}
			});
		}
		
		// get mouse positions into these variables
		var cursorX;
		var cursorY;
		document.onmousemove = function(e) {
			cursorX = e.pageX;
			cursorY = e.pageY;
		}
		
		setInterval("checkCursor()", 1000);
		function checkCursor() {
			//alert("Cursor at: " + cursorX + ", " + cursorY);
		}

		ipaddr = "1.2.3.4";
		prev_slide = $("#pageNumber").val();
		prev_datetime = new Date(); // immediately make this global var.

		// initial value for leaving page - time. (sometimes 
		// onBlur is not called before onFocus).
		left_datetime = new Date();
		function onBlur() { //leaving window
			left_datetime = new Date();
			send_event("LEFT_WINDOW", "0", "0", ipaddr);
		};
		function onFocus() { // refocusing on window
			focus_datetime = new Date();

			// calc seconds
			var left_win_seconds = (focus_datetime - left_datetime) / 1000;
			send_event("REFOCUSED_WINDOW", "0", left_win_seconds, ipaddr);
		};

		// compatibility with IE
		if (/*@cc_on!@*/false) { // check for Internet Explorer
			document.onfocusin = onFocus;
			document.onfocusout = onBlur;
		} else {
			window.onfocus = onFocus;
			window.onblur = onBlur;
		}
		
		function getSalesmanEmail()		
		{
									
			jsondata = '{"action":"getSalesmanEmail",'
				+ '"msgid":"'
				+ getCookie("msgid")
               + '" }';

				// alert("json msg " + jsondata);
				console.log("get salesman email ajax");
				  $.ajax({
							type : "POST",
							url : "../GetSalesmanEmailFromMsgIdServlet",
							data : jsondata,
							contentType : "application/json; charset=utf-8",
							processData : false,
							error : function(XmlHttpRequest,
									status, error) {
								alert('get sm email from msgid error from returned json'
										+ error);
							},
							success : function(msg) {
								//JSONobj = JSON.parse(jsondata);
								setCookie("salesman_email", msg.salesman_email, 2);
								console.log("rcvd salesman email " + msg.salesman_email);
							}					
				  }); // end of ajax call													
		}

		// initialize everything
		function initView() {
			console.log("init view");
			//alert("file: "+ getURLParameter("file")); 
			send_event("INIT_SLIDES", "0", "0", ipaddr);

			msgid = getURLParameter("file"); //format /file/123456
			msgid = msgid.substr(msgid.length - 6); // last 6 chars
			console.log("msgid is " + msgid );
			setCookie("msgid", msgid, 2);
			
			getSalesmanEmail();
			
			send_event("OPEN_SLIDES", prev_slide, "0", ipaddr);
			
			console.log("binding sendmsg click");
			$("#sendq").unbind(); //first unbind all.
			$("#sendq").bind(
					"click",
					function(event, ui) {
						//event of clicking on button.
						send_event("CUSTOMER_QUESTION_CLICKED", "0", "0", "");
						
						var q = window.prompt("Please enter your question.", "");												
						if (q!= null)							
								//salesman_email = "david.salesmaster@gmail.com";
								salesman_email = getCookie("salesman_email");
								mailtourl = "mailto:" + salesman_email
								+ "?Subject=Message from customer "
								+ 
								//$("#cust_email").text() + 
								"&body="
								+ q;
								//mailtourl = "mailto:david.salesmaster@gmail.com"
								send_event("CUSTOMER_QUESTION", "0", "0", "[slide "+ $("#pageNumber").val()+"]: "+ q);
								//	alert("Sending message for q " + $("#cust_question").val());
								setTimeout(function() {
										location.href = mailtourl;
								}, 2000);
					});
			console.log("binding sendmsg click - DONE OK");

			//$("#secondaryPresentationMode").style.visiblity = "hidden";
			//$("#openFile").style.visiblity = "hidden";
			//$("#openFile").style.display = "none";
			//$("#print").style.visiblity = "hidden";
			//$("#download").style.visiblity = "hidden";
			//$("#zoomIn").style.visiblity = "hidden";

			// request fullscreen after 1 sec
			setTimeout(function() {
				$("#scaleSelectContainer").value = "page-fit";
				$("#scaleSelectContainer").selectedIndex = 2; //pagefit option

				// THIS CANNOT WORK - USER MUST CLICK A BUTTON
				// ACTIVELY FOR THIS KIND OF REQUEST.
				//PDFViewerApplication.requestPresentationMode();
				
				// detect spacebar for next slide.
				 //$(document).keydown(function(evt) {
					 //   if (evt.keyCode == 32) {
					  //    		alert("spacebar next");
					    //        this.page++;
					   // }
					  //});
				
			}, 1000);
			
			// every 1/3 sec check for updates in slide num.
			window.setInterval(
					function() {
						cursorX = 5;
						cursorY = 99;

						var now_datetime = new Date();

						cur_slide = $("#pageNumber").val();

						// new slide.
						if (cur_slide != prev_slide) {
							// calc seconds viewed
							var seconds_viewed = (now_datetime - prev_datetime) / 1000;

							// make POST req
							send_event("VIEW_SLIDE", prev_slide,
									seconds_viewed, "1.2.3.4");

							//update prev variables. 						
							prev_slide = cur_slide;
							prev_datetime = now_datetime;
						}
					}, 333); //  3  times in sec.

			// send periodic keepalive event, for registering
			// last slide viewed.
			setInterval(function() { 
				// calculate sec viewed for current slide
				var now_datetime = new Date();
				var seconds_viewed = (now_datetime - prev_datetime) / 1000;
				// get cur slide num
				var slide_viewed_now = $("#pageNumber").val();
				// send all these in an event, every 3sec.
				keepalive_event(seconds_viewed, slide_viewed_now);				
			}, 3000);

			//this.close();
			console.log("init view done");
			send_event("INIT_SLIDES_DONE", "0", "0", ipaddr);

		}

		//document.addEventListener("pagerendered", function(e) {
	//		initView();
	//	});
		
		initView(); // just run ONCE - no duplicates (hopefully).
		