
                if(window.ActiveXObject || "ActiveXObject" in window){
                    // Always true if browser is Internet Explorer
                        //alert("This website does not support Internet Explorer. Please switch to a different browser.");
                }


function keepalive_event(estimatedTimeViewed_param, slideNum_param) {
    urlval = SP.API_URL + "/KeepAliveServlet";
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
        xhrFields: {
          withCredentials: true
        },
        success : function(res) {
            // alert(res); // display response as alert.
        },
        fail : function() {
            alert("error in ajax of keepalive");
        }
    });
    
    // renew cookie in keepalive event, so that if I refresh the window
    // and reload I'll have the same sessid.
    setShortTimeCookie("mySessionId", thisSessionId);
}

function send_event(ename, eparam1, eparam2, eparam3, eparam11) {
    urlval = SP.API_URL + "/CustomerDataServlet";

    $.ajax({
        type : "POST",
        url : urlval,
        data : {
            id : msgid,
            event_name : ename,
            param1 : eparam1,
            param2 : eparam2,
            param3 : eparam3,
            param11: eparam11,
            sessionId : thisSessionId,
            "timezone_offset_min" : tz_offset_min
        },
        xhrFields: {
          withCredentials: true
        },
        success : function(res) {
            // alert(res); // display response as alert.
            // nothing happens on success of logging.
            // in case of problems, remove the comment above
            // to check.
        	if (ename === 'OPEN_SLIDES') {
        		$(document).trigger('spOpenSlidesEventSent');
        	}
        },
        fail : function() {
            // Commented this out.
            // alert("Error in sending event AJAX");
        }
    });
}

ipaddr = "1.2.3.4";
prev_slide = $("#pageNumber").val();

prev_datetime = new Date(); // immediately make this global var.

// hide after 5sec.
setTimeout(function() {
    // alert("hiding");  
    if (typeof $("#logoMessage")[0] !== 'undefined') {
      $("#logoMessage")[0].style.display = "none";
      $("#logoMessage")[0].style.visibility = "hidden";
    }
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
                
                if (role==0)
                    {
                            send_event("LEFT_WINDOW", "0", "0", ipaddr);
                    }
                is_in_browser = 0;
        }
};
function onFocus() { // refocusing on window
    if (initDone==true)
    {
            focus_datetime = new Date();
        
            // calc seconds
            var left_win_seconds = (focus_datetime - left_datetime) / 1000;
            if (role==0)
                {
                        send_event("REFOCUSED_WINDOW", "0", left_win_seconds, ipaddr);
                }
        
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

// runs BEFORE everything is loaded.
function preInitView()
{
    if (preInitDone == false)
        {               
                
          if ('' != sp.viewer.linkHash) {
            msgid = sp.viewer.linkHash;
          } else {
                msgid = getURLParameter("file"); // format /file/123456
                
                // now we can have more than 6
                //msgid = msgid.substr(msgid.length - 6); // last 6 chars
                
                // here I take the last element in the split
                splitted = msgid.split("/");
                msgid = splitted[splitted.length-1];
                
          }
          
                console.log("msgid is " + msgid);   
                // immediately send event and message to salesman.
                
                browser_data = "Browser name: " + navigator.appName + " " + navigator.appVersion 
                + "<BR>Platform: " + navigator.platform 
                + "<BR>Is mobile device: " + mobilecheck() + "<BR>";

                // the salesman does not control the slides.
                // If it's true, the out-of-window event is not taken care of
                // to prevent it from changing slides.
                slides_controlled = false;

                if (getCookie("mySessionId")=="") // no session id defined in this 
                                                                                    // browser for the past minute.
                    {
                                    // first session for this document. .do it.
                                    thisSessionId = Math.random().toString();                                   
                                    setShortTimeCookie("mySessionId", thisSessionId);
                                    send_open_slides_event = true; // slides were opened for
                                    setShortTimeCookie("msgid", msgid);
                    }
                else
                    {
                            // we have a cookie - is it for this session?
                            // maybe different msg id?
                    
                            if (getCookie("msgid")==msgid) //same document
                                {                                      
                                        // just get the cookie.
                                        thisSessionId = getCookie("mySessionId");
                                        send_open_slides_event = false; // don't send again                             
                                }
                            else
                                
                            // different msgid
                            {
                                // first session for this document. .do it.
                                thisSessionId = Math.random().toString();                                   
                                setShortTimeCookie("mySessionId", thisSessionId);
                                send_open_slides_event = true; // slides were opened for
                                setShortTimeCookie("msgid", msgid);
                            }                           
                    }

                // anyway, this is overwritten if parameters are given in url.

                getSessionParams();
                
                if  (role==0) //send events only for customer, not salesman
                    {
                            // send only if it's first init for this session.
                            if (send_open_slides_event==true)
                                {      
                            						if (! sp.viewer.widgets.widget10.isEnabled) {
                            						  send_event("OPEN_SLIDES", prev_slide, "0", browser_data);
                          							} else {
                          								$(document).on('spWidget10EmailAddressEntered', function() {
                          									send_event("OPEN_SLIDES", prev_slide, "0", browser_data, sp.viewer.widgets.widget10.emailAddress);
                          								});
                          							}
                                }
                    }
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
            
            // customer only
            if (role==0)
                {
            						$(document).on('spOpenSlidesEventSent', function() {
            							send_event("INIT_SLIDES", "0", "0", ipaddr);	
            						}); 
                }
                
//            console.log("binding sendmsg click");
//            $("#sendq").unbind(); // first unbind all.
//            $("#sendq").bind(
//                    "click",
//                    function(event, ui) {
//                        // event of clicking on button.
//                        send_event("CUSTOMER_QUESTION_CLICKED", "0", "0", "");
//        
//                        var q = window.prompt("Please enter your question.", "");
//                        if (q != null)
//                            //
//                            // salesman_email = getCookie("salesman_email");
//                            mailtourl = "mailto:" + salesman_email
//                                    + "?Subject=Message from customer " +
//                                    // $("#cust_email").text() +
//                                    "&body=" + q;
//                        // mailtourl = "mailto:david.salesmaster@gmail.com"
//                        send_event("CUSTOMER_QUESTION", "0", "0", "[slide "
//                                + $("#pageNumber").val() + "]: " + q);
//                        // alert("Sending message for q " + $("#cust_question").val());
//                        setTimeout(function() {
//                            // location.href = mailtourl;
//                        }, 2000);
//                    });
//            console.log("binding sendmsg click - DONE OK");
        
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
        
            // loop every 0.2 sec, check if cur slide changed.
            var timer1 = window.setInterval(function() {
                cursorX = 5;
                cursorY = 99;
        
                var now_datetime = new Date();
        
                // PDFViewerApplication.page = 1;
                cur_slide = $("#pageNumber").val();
                if ((is_in_browser == 0)&&(slides_controlled==false)) 
                // browser not in focus?
                {
                    cur_slide = -1; // -1 signifies we're outside of the browser.                                   
                }
                
                if (is_in_browser==0)
                {
                            var seconds_viewed = (now_datetime - prev_datetime) / 1000;
                            
                            if (seconds_viewed > (60*5)) // 5 min outside of browser
                                {
                                        console.log("session timed out. going to closed.html");
                                                                                
                                        clearInterval(timer1);
                                        clearInterval(timer2);
                                }
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
                    if  (role==0) //send events only for customer, not salesman
                        {
                    send_event("VIEW_SLIDE", prev_slide, seconds_viewed, "1.2.3.4");
                        }

                    function isFunction(possibleFunction) {
                          return typeof(possibleFunction) === typeof(Function);
                        }
        
                    // update prev variables.
                    prev_slide = cur_slide;
                    prev_datetime = now_datetime;
                }
            }, 200); // 3 times in sec.
        
            // send periodic keepalive event, for registering
            // last slide viewed.
            var timer2 = setInterval(function() {
                // calculate sec viewed for current slide
                var now_datetime = new Date();
                var seconds_viewed = (now_datetime - prev_datetime) / 1000;
                // get cur slide num
                var slide_viewed_now = $("#pageNumber").val();
                
                if  (role==0) //send events only for customer, not salesman
                    {
                        //  send all these in an event, every 3sec.
                        keepalive_event(seconds_viewed, slide_viewed_now);
                    }
                
                
                //renew cookies every 3sec
                setShortTimeCookie("mySessionId", thisSessionId);               
                setShortTimeCookie("msgid", msgid);
                
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
        {   // no params in url
                // variables should have already been initialized
                //  in getSalesmanData
                sessionid = thisSessionId;
                role="0"; // just make the role 0 - customer.
                
                // this is customer, using full mode - of course he's 
                // viewing the pdf.             
        }
    
    //encodeuricomponent replaces the spaces with %20 and other required stuff for uri.
}

 //document.addEventListener("pagerendered", function(e) {
        //initView(); //runs whhen pdf is visible, after it's loaded from server.
        //alert("rendered");
//initView is exec in viewer.js, look for it. run after pdf is rendered!
 //});

// initView(); // just run ONCE - no duplicates (hopefully).
