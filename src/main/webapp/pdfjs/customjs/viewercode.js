

socketconnected=0; // will be set to 1 in chatwindow

// this runs ONCE for each page refresh - 
// and this will make ONE report entry in the smart alerts.
thisSessionId = Math.random().toString();

function keepalive_event(estimatedTimeViewed_param, slideNum_param) {
	urlval = "../KeepAliveServlet";
	// if (document.location.hostname == "localhost")
	// {
	// urlval = "/SlidePiper/CustomerDataServlet";
	// }

	paramJSON = {
		"action" : "keepAlive",
		"msgId" : msgid,
		"sessionId" : thisSessionId,
		"slideNum" : slideNum_param,
		"estimatedTimeViewed" : estimatedTimeViewed_param,
		"timezone_offset_min" : tz_offset_min
	};

	$.ajax({
		type : "POST",
		url : urlval,
		data : JSON.stringify(paramJSON),
		success : function(res) {
			// alert(res); // display response as alert.
		},
		fail : function() {
			alert("error in ajax of keepalive");
		}
	});
}

function send_event(ename, eparam1, eparam2, eparam3) {
	urlval = "../CustomerDataServlet";

	$.ajax({
		type : "POST",
		url : urlval,
		data : {
			id : msgid,
			event_name : ename,
			param1 : eparam1,
			param2 : eparam2,
			param3 : eparam3,
			sessionId : thisSessionId,
			"timezone_offset_min" : tz_offset_min
		},
		success : function(res) {
			// alert(res); // display response as alert.
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
	// alert("Cursor at: " + cursorX + ", " + cursorY);
}

ipaddr = "1.2.3.4";
prev_slide = $("#pageNumber").val();

prev_datetime = new Date(); // immediately make this global var.

// hide after 5sec.
setTimeout(function() {
	// alert("hiding");
	$("#logoMessage")[0].style.display = "none";
	$("#logoMessage")[0].style.visibility = "hidden";
}, 5000);

// initial value for leaving page - time. (sometimes
// onBlur is not called before onFocus).
left_datetime = new Date();

// code for leaving and returning to browser - detecting this.
is_in_browser = 1; // start by default, in browser (true).

// booleans for initializations, make sure I initialize once.
preInitDone = false;
initDone = false;

function onBlur() { // leaving window
	if (initDone==true)
		{
				left_datetime = new Date();
				send_event("LEFT_WINDOW", "0", "0", ipaddr);
				is_in_browser = 0;
		}
};
function onFocus() { // refocusing on window
	if (initDone==true)
	{
			focus_datetime = new Date();
		
			// calc seconds
			var left_win_seconds = (focus_datetime - left_datetime) / 1000;
			send_event("REFOCUSED_WINDOW", "0", left_win_seconds, ipaddr);
		
			is_in_browser = 1;
	}
};

// compatibility with IE
if (/* @cc_on!@ */false) { // check for Internet Explorer
	document.onfocusin = onFocus;
	document.onfocusout = onBlur;
} else {
	window.onfocus = onFocus;
	window.onblur = onBlur;
}

// data for this msg id - 
// cust name, salesman name, role. 
function getSalesmanData() {

	jsondata = '{"msgid":"' + msgid + '" }';

	// alert("json msg " + jsondata);
	console.log("get salesman email ajax");
	$.ajax({
		type : "POST",
		url : "../GetMessageDataServlet",
		data : jsondata,
		contentType : "application/json; charset=utf-8",
		processData : false,
		error : function(XmlHttpRequest, status, error) {
			alert('get sm email from msgid error from returned json' + error);
		},
		success : function(msg) {
			salesman_email = msg.salesman_email;
			customername = msg.customername;
			salesman = msg.salesman;
			console.log("rcvd salesman data: smemail " + salesman_email + " custname: "+ customername +" sm name:"+ salesman);
			
			// I need this loaded data for the chat window.
			loadChatWindow();
		}
	}); // end of ajax call
}




// runs BEFORE everything is loaded.
function preInitView()
{
	if (preInitDone == false)
		{
				getSessionParams();
				
				msgid = getURLParameter("file"); // format /file/123456
				msgid = msgid.substr(msgid.length - 6); // last 6 chars
				console.log("msgid is " + msgid);	
				// immediately send event and message to salesman.
				
				browser_data = "Browser name: " + navigator.appName + " " + navigator.appVersion 
				+ "<BR>Platform: " + navigator.platform + "<BR>";
				
				send_event("OPEN_SLIDES", prev_slide, "0", browser_data);									
				preInitDone = true;
		}
}

// run immediately.
preInitView();

// initialize everything
function initView() {
	
	if (initDone == false)
	{
		// immediately set to true, to prevent it from running again.
			initDone = true;
			console.log("init view");
		
			preInitView(); //make sure executed.
			
			prev_datetime = new Date();
			// immediately make this global var.
			// change it now that it's loaded so that I don't count time until loading
			// first slide in its view time.
		
			// alert("file: "+ getURLParameter("file"));
			
			// load salesman data, and afterwards in callback,
			// load the chat window.
			getSalesmanData();
			
			send_event("INIT_SLIDES", "0", "0", ipaddr);			
				
			console.log("binding sendmsg click");
			$("#sendq").unbind(); // first unbind all.
			$("#sendq").bind(
					"click",
					function(event, ui) {
						// event of clicking on button.
						send_event("CUSTOMER_QUESTION_CLICKED", "0", "0", "");
		
						var q = window.prompt("Please enter your question.", "");
						if (q != null)
							//
							// salesman_email = getCookie("salesman_email");
							mailtourl = "mailto:" + salesman_email
									+ "?Subject=Message from customer " +
									// $("#cust_email").text() +
									"&body=" + q;
						// mailtourl = "mailto:david.salesmaster@gmail.com"
						send_event("CUSTOMER_QUESTION", "0", "0", "[slide "
								+ $("#pageNumber").val() + "]: " + q);
						// alert("Sending message for q " + $("#cust_question").val());
						setTimeout(function() {
							// location.href = mailtourl;
						}, 2000);
					});
			console.log("binding sendmsg click - DONE OK");
		
			// request pagefit after 1 sec
			/*setTimeout(function() {
				$("#scaleSelectContainer").value = "page-fit";
				$("#scaleSelectContainer").selectedIndex = 2; // pagefit option
			}, 1000);*/
			// every 1/3 sec check for updates in slide num.
		
			// for now, use the current page, not necessarily 1.
			currentPageIndex = $("#pageNumber").val();
			cur_slide = currentPageIndex;
			prev_slide = cur_slide; // for first slide, make it same.
		
			window.setInterval(function() {
				cursorX = 5;
				cursorY = 99;
		
				var now_datetime = new Date();
		
				// PDFViewerApplication.page = 1;
				cur_slide = $("#pageNumber").val();
				if (is_in_browser == 0) // browser not in focus?
				{
					cur_slide = -1; // -1 signifies we're outside of the browser.
				}
		
				// new slide. if outside of browser slide is -1 and it ends the current
				// view event.
				// make sure no extra spaces make these 2 slides "different".x				
				if (cur_slide.toString().trim() != prev_slide.toString().trim()) {
		
					// changed slide - immediately hide privacy message.
					// alert("aahiding privacy msg" + cur_slide + " " + prev_slide);
		
					// calc seconds viewed
					var seconds_viewed = (now_datetime - prev_datetime) / 1000;
		
					// make POST req
					send_event("VIEW_SLIDE", prev_slide, seconds_viewed, "1.2.3.4");

					function isFunction(possibleFunction) {
						  return typeof(possibleFunction) === typeof(Function);
						}
					// send the current slide num to others in chat.
					if (socketconnected ==1) // only if set to 1 in chatwindow
						{					
								sendSlideNum();
						}
		
					// update prev variables.
					prev_slide = cur_slide;
					prev_datetime = now_datetime;
				}
			}, 200); // 3 times in sec.
		
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
		
			// this.close();
		
			//console.log("init view done");
			//send_event("INIT_SLIDES_DONE", "0", "0", ipaddr);
			
			// this is done here, but continues in getSalesmanData
				// and its callback to load chat window, and 
			// in the end set initialized to true.
	}
}

// set parameters from url, if given.
// if not, it's a customer session and it's initialized
// in getSalesmanData
function getSessionParams()
{
	// if we have parameters in url (meaning it's salesman session).
	if (getURLParameter("customername")!=null)
		{
				sessionid=getURLParameter("sessionid");
				
				// erase current session id, put the given parameter id.
				thisSessionId = sessionid; 
				
				customername=getURLParameter("customername");
				salesman=getURLParameter("salesman");
				role=getURLParameter("role"); // salesman - 1
				console.log("New salesman session. customer=" + customername + " salesman=" + salesman + " role="+role);				 
		}
	else
		{ 	// no params in url
				// variables should have already been initialized
				// 	in getSalesmanData
				sessionid = thisSessionId;
				role="0"; // just make the role 0 - customer.
				
				// this is customer, using full mode - of course he's 
				// viewing the pdf.				
		}
	
	// we're in this file - it's not quickchat.
	quickchatmode = 0;
	//encodeuricomponent replaces the spaces with %20 and other required stuff for uri.
}

// runs at the end, after everything has been initialized. 
function loadChatWindow()
{
	// load chat window into chatdiv.
	chatDiv = $("#chatDiv")[0];
	
//	alert("get url for cust name is " + getURLParameter("customername"));
	// returns null if there's no parameter with that name.
	
	//getParams = "sessionid="+sessionid+"&salesman="+encodeURIComponent(salesman.trim())+"&customername="+encodeURIComponent(customername.trim())+"&role="+role;	
	loadurl = "chatwindow.html"; //+"?"+getParams;
	// the params are not needed and not used.
	// in full chat mode they are received from getSalesmanDataServlet
	
	console.log("jquery load url " + loadurl);
			
	//$("#chatDiv").load(loadurl,
	//		//function to run after loading chat window
//			function()
//			{
				// no loading, it's inside viewer.html now.
	
						// run after 2 seconds, maybe the chat window 
						// 	will stabilize its position.
						// 	the timeout screws up the UI...
						//setTimeout(function() {							
							console.log("finished loading chat html");
							// final callback on finishing to load chat window.
							//load completed.								
							maxY = window.innerHeight;								
							chatDivHeight = chatDiv.offsetHeight;
							chatDiv.style.top = (maxY - chatDivHeight)+"px";
							
							maxX = window.innerWidth;
							chatDivWidth = chatDiv.offsetHeight;								
							chatDiv.style.left = (maxX - chatDivWidth)+"px";
							//finally, show it.
							chatDiv.style.visibility = "visible";							
						//},  2000);
	//		});
	

	// last thing: display privacy msg.
	privacyDiv = $("#privacyMessage")[0];
	maxY = window.innerHeight;
	divHeight = privacyDiv.offsetHeight;
	privacyDiv.style.top = (maxY - divHeight)+"px";
	privacyDiv.style.visibility = "visible";
	
	// now blur and focus will work:
	initDone = true;				
}

 //document.addEventListener("pagerendered", function(e) {
		//initView(); //runs whhen pdf is visible, after it's loaded from server.
		//alert("rendered");
//initView is exec in viewer.js, look for it. run after pdf is rendered!
 //});

// initView(); // just run ONCE - no duplicates (hopefully).
