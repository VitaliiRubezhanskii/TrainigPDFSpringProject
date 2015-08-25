is_in_browser = 1;
  // start in browser also her.e
  // this can be changed if inside pdf view.
  
  
  socketconnected = 0;
  
  // parameter from url: session id, username role
  // if no parameter found returns null.
  function getURLParameter(name) {
	  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
	}

  //var socket;  not used. instead:
  socket=null; //global var  
  var registered = false;
  
  function connectSocket()
  	{			  
		socket = new SockJS(socketString);        
    //When the connection is opened, login.
    	socket.onopen = function() {
    				socketconnected = 1;
			      console.log("Opened socket.");
			      showChat();
			      //register the user
			      //var nickname = $("#nickname").val();
			      
			      if (window.location.toString().indexOf("viewer.html"))
			    	  {	
			    	  // we're in pdf viewer
			    	  		quickchatmode = 0;
			    	  console.log("PDF viewer mode");
			    	  
			    	  }
			      else
			    	  {
			    	  				//we're in small chat window.
			    	  			quickchatmode = 1;
			    	  			console.log("quickchat window mode");			    	  			
			    	  }
			      			    	
			    	if ( getURLParameter("customername") == null)
			    		{
			    		//this means we couldn't take the parameters from the 
			    		// url. In that case it means that it's in the pdf 
			    		// viewer and it tries to take the url of the top page.
			    		// and it has other get parameters. 
			    		// In this case, we have shared global variables with
			    		// the main page, so I can simply take these global variables:
			    			
			    			sessionid = thisSessionId;
			    					    					    						    		
			    		// other global variables are already set at customviewercode.js
			    		
			    		//alert("Error, no customer name parameter");
			    		}
			    	else //we have params in url! quickchat mode
			    		{
			    		// run this only we have params.
			    		// otherwise it erases the loaded data in
			    		// customviewercode.
			    		customername = getURLParameter("customername"); 				    	
				    	role = getURLParameter("role");
				    	salesman = getURLParameter("salesman");
				    	
				    	sessionid = getURLParameter("sessionid");				    	
			    		}
			    	if (sessionid==null) alert("Error, no sessid parameter for chat");
			    	if (role==null) alert("Error, no role parameter for chat");
			    	if (salesman==null) alert("error, no salesman parameter for chat");
			    	
			    	// customer sees chatting with salesman
			    	if (role=="0")
			    			{
			    				user = { "username" : customername,
			     		       "sessionid" : sessionid,
			     		       "role" : role
			     		                  };
			    				$("#chatWith").text("Chatting with " + salesman);
			    				username = customername;
			    			}
			    	else
			    	//salesman sees chatting with customer
			    	if (role=="1")
						{
			    			user = { "username" : salesman,
			    			       "sessionid" : sessionid,
			    			       "role" : role
			    			                  };
			    			username=salesman;
								$("#chatWith").text("Chatting with " + customername);
						}
			    	else
			    		{
			    					alert("ERROR - role is not defined.");
			    		}
			
			      socket.send(JSON.stringify(user));
    		} // onopen
                
      //When received a message, parse it and either add/remove user or post message.
      socket.onmessage = function(a) {
    		socketconnected = 1;
    		showChat();
        //process the message here
        console.log("parsing JSON message: " + a.data);
                    
        var message = JSON.parse(a.data);            
        //console.log("msg is: " + message.toString());
              
        console.log("message is " + JSON.stringify(message));
                                       
        // all messages I receive are already filtered by
        // server to sessionid so should be displayed.
        if (message.hasOwnProperty("addUser")) {        
        	console.log("addUser detected");
          var d = document.createElement('div');
          $(d).addClass("chatusername user").text(message.addUser.username).attr("data-user", message.addUser.username.toString()).appendTo("#nicknamesBox");
          			
          if (message.addUser.username != username) // it's not me
          				{	
	              // add online msg to chatbox
	              var d = document.createElement('div');
	              var sonline = document.createElement('span');                            
	              $(sonline).addClass("chatusername").text(message.addUser.username + " is online.").appendTo($(d));
	              $(d).appendTo("#chatBox");
	              $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
	              		}
          
          console.log("Added user " + message.addUser.username);
        } else if (message.hasOwnProperty("removeUser")) {
        	
            if (message.removeUser.username != username) // it's not me
  						{	
           		// add offline msg to chatbox
              var d = document.createElement('div');
              var soffline = document.createElement('span');                            
              $(soffline).addClass("chatusername").text(message.removeUser.username + " is offline.").appendTo($(d));
              $(d).appendTo("#chatBox");
              $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
  						}
              
          	console.log("removeUser detected");
          	
          	// this causes some error, so I commented it.
          	// users list is not shown anyway.
            //$(".user[data-user="+message.removeUser.username+"]").remove();
            console.log("Removed user " + message.removeUser.username);

        } else             	
        // only regular msgs are sent - 
        if (message.hasOwnProperty("message")) {        	
        	console.log("regular message detected (also slide change)");
        	//regular message - we have
        	// message JSON with message and user insude.
          var d = document.createElement('div');
          var suser = document.createElement('span');
          var smessage = document.createElement('span');              
          $(suser).addClass("chatusername").text(message.message.user.username+" : ").appendTo($(d));
          $(smessage).addClass("msgtext").text(message.message.messagetext).appendTo($(d));
          // not adding msg yet to chatbox - 
          // checking if it should be - maybe
          // slide changes should be changed and not
          // added.
          
           	if (quickchatmode==0) 
          				//not quickchat, need to change slides!
          				{
          				// change slide message
          		if (message.message.
          				messagetext.indexOf("Changed to slide #") > -1) 
          						
          					{
          					var slidenum = message.message.messagetext.substring(18);
          					console.log("changing to slide # " + slidenum);
          								// really change slide here too!
          								
          								// we're in full chat mode, so this should
          								// work - we have pdf viewer.
          					if (slidenum>0)
          								{
          								if (is_in_browser)
		          									{
          									// change page number in PDF!          									
          								    	PDFViewerApplication.page = (slidenum | 0);
          									// and in textbox:
          											$("#pageNumber").val(slidenum);
          											// to avoid having the engine
              										// read this as slide change event
              										// and send another event to others
              										// in chat, I must do these:
              									cur_slide = slidenum;
              									prev_slide = slidenum;
              									// this way there won't be a slide
              									// change event registered here.
              									
              									// this caused a bug. If I change cur_slide
              									// then in the slides detection loop it finds I'm out
              									// of browser, then cur_slide is -1 and prev_slide is set,
              									// and slide has CHANGED, every time.
		          									}          						          									          						
          								}
          					else
          								{	
	          					alert("bad slidenum " + slidenum);
          								}
          								
          								// full chat - I DON'T show slidechange 
													//messages - I just CHANGE slides.          								
          					}
          		else
          					{
          				//regular msg - display it anyway.
          				$(d).appendTo("#chatBox");          			
          					}
          				}
          	else
          				{
          						//quickchat mode -- always show messages
          						// include slide changes.
          			// append the message as real text message.
          			$(d).appendTo("#chatBox");
          				}
          	// anyway, move chatbox as needed.
            $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
            
        }      // of regular msg
        else {alert("unknown message type" + message.toString());}
		      	}
      
      
      
      socket.onclose = function() {
    	  		socketconnected = 0;
    	  		console.log("socket closed. trying to reconnect");
    	  		// retry in 20sec.
    	  		setTimeout(connectSocket, 20000);    	  		
    	  		};
    	  		
      socket.onerror = function() { alert("Error transmitting chat content"); socketconnected = 0;};
      
      $('#txtMessage').keyup(function(e){
        if (e.keyCode == 13) {
          sendMessage();
	            	}});
	      $("#btnSend").click(function() {
	          sendMessage();
	          showChat();
	          	});          
	      $("#btnClose").click(function() {
		            hideChat();
		          	});
    	}
   
  
  function startClient() {
    console.log("opening socket");
    //on http server use document.domain instead od "localhost"
    //Start the websocket client
    if (document.domain == 'localhost')
    	{
    	// on localhost
    		socketString = document.domain + ":8080/sp/chat";
    	}
    else
    	{
    	// on openshift, no sp. and port is 8000 for ws, 8443 for wss.
				socketString = document.domain + ":8000/chat";
    	}
    socketString = "http://" + socketString;    
    console.log("connecting to socket " + socketString);
    
    // timeout because I see msgs in reverse order.
    // first I see console log and then GET.
    // maybe this will help it appear in correct order.
    // AND - solve HTTP FORBIDDEN issue (only on openshift)
    // SOLVED: I just put allowedRegion=*.
    // Also I don't chat to appear immediately.
    setTimeout(connectSocket,  5000);    
  } // of startClient
  
  function sendMessage() {
    if ($("#txtMessage").val()) {
      socket.send($("#txtMessage").val());
      $("#txtMessage").val("");
    	}
    }

  // only in non-quickchat mode, exchange slides between partners.
  function sendSlideNum()
  {
	  // if in window.
	  	if (cur_slide != -1)
	  		{
    			socket.send("Changed to slide #" + $("#pageNumber").val());
	  		}
  }
  
  
  //startup
  $(document).ready(function() {
       startClient();    
    });
  
 function hideChat()
  {	 
	  $("#chatContainer")[0].style.visibility = "hidden";
  }
  
 function showChat()
  {
	  $("#chatContainer")[0].style.visibility = "visible";
  }
