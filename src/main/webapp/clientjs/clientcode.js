  //*******************************************************************************************

// logged events of salesman. logged to db.
		function send_salesman_event(ename, eparam1, eparam2, eparam3) {
			urlval= "SalesmanDataServlet";
			//if (document.location.hostname == "localhost")
			//	{
			//			urlval = "/SlidePiper/CustomerDataServlet";
			//	}							
			$.ajax({
				type : "POST",
				url : urlval,
				data : {
					email : getCookie("SalesmanEmail"),
					event_name : ename,
					param1 : eparam1,
					param2 : eparam2,
					param3 : eparam3,
			//		sessionId : thisSessionId
				},
				success : function(res) {
						console.log("salesman event returned " + res);
					   //alert(res); // display response as alert.                     
				},
				fail : function() {
					alert("error ajax salesman data servlet");
				}
			});
		}


// initialize random cookie if needed.    
    var user = getCookie("myPersistentid");
    if (user != "") {
        //alert("Welcome again " + user);
        // already there - don't do anything.
    } else {
        //user = prompt("Please enter your name:", "");
        //if (user != "" && user != null) {
          //  setCookie("username", user, 365);
          randomToken = Math.random().toString();
          setCookie("myPersistentid",randomToken,365);
    }
    
    
    // now we can take it to global var.
    myPersistentid = getCookie("myPersistentid");
    
	//
    //*******************************************************************************************
    // make random hash of 6 characters, for retrieving presentations, msgs, etc.
    function randomHash()
    {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 6; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    //*******************************************************************************************
  function initPage()
    {
	  console.log("initPage binding non-available features");
	  	//alert("init page");
  	$("#fromTemplate, #clear2, #fromTemplate2,"+
  			" #addCampaign, #removeCampaign, #editCampaign,"+
  			" #addPres2, #removePres2, #editPres2, #send_email_to_campaign," +
  			" #history, #editCustomerButton")
  			.bind( "click", 
      		function(event, ui)
      			{
  						send_salesman_event("BUTTON_CLICK", '0','0', this.id);
  						alert("This feature is coming soon ("+ this.id + "). ");
      			});

	  	console.log("initPage binding sendemail");
       
    	$("#send_email_to_customers").bind( "click", 
      		function(event) 
      		   		{			    						
    						console.log("sendemail");
    						//alert('sending email');
    						var customers = [];
    						var customeremails = [];
    						// checkboxes from the customers list    				
    						$('.customers').each(function() {
    										if ($(this).is(":checked"))
    											{
    												customers.push(this.value);
    												
    												// this should work fine
    												// in html5 it should be possible to use
    												// this.dataset.email, but it doesn't work for
    												// some reason (maybe old Firefox).
    												customeremails.push(this.getAttribute("data-email"));    												
    											}    										
    					        });
    						//alert("customers selected: " + customers);
    						
    						var pres1 = [];
    						// checkboxes from the pres1 list    				
    						$('.pres1').each(function() {
    										if ($(this).is(":checked"))
    											{
    											// without last @1 or @2:
    												slidesid = this.id.substring(0, this.id.length - 2);
    												console.log("Taking slides with id " + slidesid);    												    
    												pres1.push(slidesid);	
    											}    										
    					        });
    						msgtext = $("#msgtext1").val();
    						msgsubj = $("#subject1").val();
    						
    						
    						// first make some validations on the input.
    						if (!((customers.length==1)&&(pres1.length==1)))
    							{
    									alert("The system currently supports sending only one presentation to one customer.")
    							}
    						else
    						if (msgtext=="")
    							{
    										alert("Please fill in the message text.");
    							}
    						else    					
        			  if (msgsubj=="")
    							{
    										alert("Please fill in the message subject.");
    							}
        			  else
        				{ //everything is fine, send msg		    					
		    						docid = randomHash();
		    						
		    						//replace newlines with <br>
		    						msgtext = msgtext.replace(/(?:\r\n|\r|\n)/g, '<br />');
		    						
/*		    							// if RTL, make it RTL:		    								    							
		    						if ($("#rtl").is(":checked"))
										{
		    							alert("making rtl");
											msgtext = 
													'<p dir="rtl">' + msgtext + '</p>';
										}*/
		    						
		    						emailval = $("#usernamefield").val();
		    						
		    						
		    						jsondata = '{"action":"sendPresentationToCustomer",'
			    	   					+ '"salesman_email":"' +	emailval.toLowerCase() + '",'
			    	   					+ '"slides_ids":"' + pres1 + '",'
			    	   					+ '"customers":"' + customers + '",'
			    	   					+ '"customeremails":"' + customeremails + '",'
			    	   					+ '"msgsubj":"' + msgsubj + '",'
			    	   					+ '"msgtext":"' + msgtext + '",'
			    	   					+ '"docid":"' + docid + '"'    	    	   					    	    	   				
			    	   								+'}';
		    						
		    						//alert("json msg " + jsondata);
		    						console.log("sendemail ajax");
		 		    	   		 $.ajax({
		    	    	   					type : "POST",
		    	    	   					url : "MainServlet",
		    	    	   					data : jsondata,
		    	    	   					contentType : "application/json; charset=utf-8",
		    	    	   					processData : false,
		    	    	   					error : function(XmlHttpRequest, status, error) {
		    	    	   						alert('sendCustomerMessage error from returned json' + error);
		    	    	   					},
		    	    	   					success : function(msg) {
		    	    	   					  JSONobj=JSON.parse(jsondata);
		    	    	   						if(msg.succeeded == 1){
		    	    	   							console.log("message registered on server.");
		    	    	   								//alert("link is " + msg.link);
		    	    	   								
		    	    	   								mailtourl = "mailto:" + JSONobj.customeremails
		    	    	   								+ "?Subject=\"" + JSONobj.msgsubj + "\"" + 		    	    								
		    	    	   								//$("#cust_email").text() + 
		    	    	   								"&body=\"" + JSONobj.msgtext + " " +  msg.link + "\"";
		    	    	   								
		    	    	   								alert("mailto is " + mailtourl);
		    	    	   								
		    	    										location.href = mailtourl;		    	    											    	    												    	    									
		    	    	   							//setCookie("SalesmanEmail", emailval, 2);
		    	    	   							//alert("Message registered and sent!");
		    	    	   							//managementScreen();
		    	    	   							 console.log("send message done. (opened mailto)");
		    	    	   						}else{
		    	    	   							alert("Error sending message (error in writing to database)");
		    	    	   						}
		    	    	   			} //success func
		    	    	   	}); // end of ajax call		
    							}
    						
      		   		});
    	
    	console.log("initPage binding gotoManage");
       $("#gotoManage").bind( "click", 
    		  function(event, ui) 
    		   		{
    	   			  emailval = $("#usernamefield").val();
    	   				passwordval = $("#passwordfield").val(); 
    	   				
    	   				//alert("email is " + emailval);
    	   				
    	   		 emailval = $("#usernamefield").val();    	   		
    	   		 
    	   		 //alert("emailval is " + emailval);
    	   		console.log("login servlet ajax");
    	   		 $.ajax({
    	   			 		// THIS is IMPORTANT, allows me to to access this.localemailval
    	   			    // from anonymous function success()
    	   			    local_emailval : emailval,
    	   					type : "POST",
    	   					url : "MainServlet",
    	   					data : '{"action":"salesmanLogin", "email":"' + emailval.toLowerCase() + '", "password":"' + passwordval.toLowerCase() + '"}',
    	   					contentType : "application/json; charset=utf-8",
    	   					processData : false,
    	   					error : function(XmlHttpRequest, status, error) {
    	   						alert('salesmanLogin error from returned json' + error);
    	   					},
    	   					success : function(msg) {
    	   						if(msg.salesman == 1){
    	   							setCookie("SalesmanEmail", this.local_emailval, 2);    	   							
    	   					//		alert("set cookie emailsales to " +this.local_emailval );
    	   							// this looks OK    	   							
    	   							console.log("set cookie SalesmanEmail to " + this.local_emailval);
    	   							alert("Welcome to Slidepiper!");
    	   							managementScreen();
    	   						}else{
    	   							alert("Wrong credentials for email " + this.local_emailval + ". Please try again.");
    	   						}
    	   			} //success func
    	   	}); // end of ajax call
				    						    		    	   			 
 	   			} //click function in gotoManage  
         ); // end of bind gotoManage
       
       // for now, start at manage.
       //changepage('#manage');
              
       $("#campaigns").append(makeCb('camp1','Test Campaign','campaigns'));
       $("#campaigns").append(makeCb('camp2','Good Campaign','campaigns'));
             
       
       console.log("initPage put email in upload form");
       //update email in upload form
       $("#salesman_email").val(getCookie("SalesmanEmail"));
       
   		//alert("init page done");
       
       console.log("initPage check logged in");
       // if already logged in
       if (getCookie("SalesmanEmail") != "")
    	   	 {
    	   				// set username field.
    	   			console.log("initPage check logged in - YES - set cookie");
    	   			$("#usernamefield").val(getCookie("SalesmanEmail"));
    	   			// go to mgmt screen after waiting for all callbacks and refreshes.
    	   			//setTimeout(function() {managementScreen();}, 0);
    	  	 }       
    }
  
  //*******************************************************************************************
    
    // make checkbox item
    function makeCb(id,text,classname)
    {                            	
       return '<input name="'+ id +'"  class="jqmcheckbox ' +classname+'" id="'+id+'" type="checkbox" value="' +text+ '"> <label for="'+id+'">'+text+'</label>';
    }
    
    function makeCustomerCb(id,text,classname, email)
    {                            	
       return '<input name="'+ id +'"  data-email="' + email + '" class="jqmcheckbox ' +classname+'" id="'+id+'" type="checkbox" value="' +text+ '"> <label for="'+id+'">'+text+'</label>';
    }
    
    //*******************************************************************************************
    
  // fill data from DB
  function fillCustomersAndPresentations()
    {
	  console.log("fillCustAndPres");
		//alert("filling custs & pres");
	    //ClearLists();
		var email = getCookie("SalesmanEmail");
		console.log("getSalesmanData ajax");
		{
			$.ajax({
				type : "POST",
				url : "MainServlet",
				data : '{"action":"getSalesmanData", "email":"' + email.toLowerCase() + '"}',
				contentType : "application/json; charset=utf-8",
				processData : false,
				error : function(XmlHttpRequest, status, error) {
					alert('error from returned json getSalesmanData' + error);
				},
				success : function(msg) {
					console.log("getSalesmanData ajax returned");
					var size = msg.myCustomers.length;
				//	var myCustomers = "";
					console.log("# of customers: " + msg.myCustomers.length);
					custCheckboxes='<fieldset data-role="controlgroup">';       					
					if(size > 0){
						for(var i = 0; i < msg.myCustomers.length; i++){
								//console.log("adding customer " + msg.myCustomers[i].name);						 
								custCheckboxes += makeCustomerCb('cust'+i, msg.myCustomers[i].name, 
										'customers', 
										msg.myCustomers[i].email);
								
								//alert('cust email ' + msg.myCustomers[i].email);
						}
						custCheckboxes+='</fieldset>';												
						$("#customersDiv").html(custCheckboxes);												
					}
					//$(".customerSelect").html(myCustomers);
					var presentations = "";
					pres1Checkboxes='<fieldset data-role="controlgroup">';
					pres2Checkboxes='<fieldset data-role="controlgroup">';
					for(var i = 0; i< msg.presentations.length; i++){
						//console.log("adding pres " + msg.presentations[i].name + " with id " + msg.presentations[i].id);
						//$("#presentations1").append(makeCb('slides'+i,msg.presentations[i].name));//.trigger( "create" );
						//$("#presentations2").append(makeCb('slides'+i,msg.presentations[i].name));//.trigger( "create" );
						//presentations += "<option value='" + msg.presentations[i].name + "'>" + msg.presentations[i].name + "</option>";
						//presentations += msg.presentations[i].name;
						
						// need to remove the @1 @2 when using the id, leave only
						// capital letters, that's what I allow.
						pres1Checkboxes += makeCb(msg.presentations[i].id + "@1",msg.presentations[i].name,'pres1');										
						pres2Checkboxes += makeCb(msg.presentations[i].id + "@2",msg.presentations[i].name,'pres2');						
					}
					pres1Checkboxes+='</fieldset>';
					pres2Checkboxes+='</fieldset>';					
					$("#pres1Div").html(pres1Checkboxes);
					$("#pres2Div").html(pres2Checkboxes);
					
					
					//refreshLists();
					//refreshPage();
					//setTimeout(function() { changepage('#manage');} , 400);					
					//$(".presentationSelect").html(presentations);					
					//$.mobile.activePage.trigger("pagecreate");
					//alert("loaded cust" + custCheckboxes + " pres " + pres1Checkboxes);
					
					// refresh each element in returned list - should be all checkboxes.
					//refresh as in http://www.gajotres.net/uncaught-error-cannot-call-methods-on-prior-to-initialization-attempted-to-call-method-refresh/
					setTimeout(function() { $('.jqmcheckbox').checkboxradio().checkboxradio("refresh"); }, 0); // put at end of event queue, after rending checkboxes.
					//alert("fill cust & pres done");	
				}
			});
		}	
		
		console.log("fillcustAndPres done");
    }
  

  //*******************************************************************************************
  
  $("#logout").bind( "click", 
		  function(event, ui) 		   	
		  	{
	  				console.log("logout");
	  				// this logs me off.
						setCookie("SalesmanEmail", "", 2);
						alert("Logged out.\n Thanks for using SlidePiper!");
						
						// reloads page with the redirect (with #)
	  				window.location = window.location.pathname;	  
		  	});	
  
  //*******************************************************************************************
  
  $("#removeCustButton").bind( "click", 
		  function(event, ui) 		   			  
		  	{  
	  		console.log("removing customer");
	  		var r = confirm("Are you sure? You may lose customer tracking.");
	  		if (r == true) {
	  		    x = "You pressed OK!";
	  		    
				var customers = [];
				var customeremails = [];
				// checkboxes from the customers list    				
				$('.customers').each(function() {
								if ($(this).is(":checked"))
									{
										customers.push(this.value);
										
										// this should work fine
										// in html5 it should be possible to use
										// this.dataset.email, but it doesn't work for
										// some reason (maybe old Firefox).
										customeremails.push(this.getAttribute("data-email"));    												
									}    										
			        });
				
				
					if (customers.length != 1)
					{
							alert("The system currently supports removing one customer at a time.");
					}
					else
					{
						//get emails:
						var salesmanEmail = getCookie("SalesmanEmail");
							var customerEmail = customeremails; // should be only one.
							datajson = '{"action":"deleteCustomer", "salesman_email":"' + salesmanEmail + '", "customer_email":"' + customerEmail + '"}';
							console.log("removing cust datajson=" + datajson);
	  					$.ajax({
	  						type : "POST",
	  						url : "MainServlet",
	  						data : datajson,
	  						contentType : "application/json; charset=utf-8",
	  						processData : false,
	  						error : function(XmlHttpRequest, status, error) {
	  							alert('error from returned json remove cust' + error);
	  						},
	  						success : function(msg) {
	  							console.log("remove customer ajax returned successfully");
	  							fillCustomersAndPresentations();								
	  							} 										  					
	  						});		  	            	
					}
	  		    	  		    
	  		} else {
	  		    x = "You pressed Cancel!";
	  		    }
		  	});
		  	
	  			  		
	

  $("#removePresentationButton").bind( "click", 
		  function(event, ui) 		   			  
		  	{  
	  		console.log("removing pres");
	  		var r = confirm("Are you sure? You may break the link for this presentation.");
	  		if (r == true) {
	  		    x = "You pressed OK!";
	  		    
				var pres1 = [];
				// checkboxes from the pres1 list    				
				$('.pres1').each(function() {
								if ($(this).is(":checked"))
									{
									// without last @1 or @2:
										slidesid = this.id.substring(0, this.id.length - 2);
										console.log("Taking slides with id " + slidesid);    												    
										pres1.push(slidesid);	
									}    										
			        });
							
					if (pres1.length != 1)
					{
							alert("The system currently supports removing one presentation at a time.");
					}
					else
					{
						//	get email
							var salesmanEmail = getCookie("SalesmanEmail");							
							datajson = '{"action":"deletePresentation", "salesman_email":"' + salesmanEmail + '", "presentation":"' + pres1 + '"}';
							console.log("removing cust datajson=" + datajson);
	  					$.ajax({
	  						type : "POST",
	  						url : "MainServlet",
	  						data : datajson,
	  						contentType : "application/json; charset=utf-8",
	  						processData : false,
	  						error : function(XmlHttpRequest, status, error) {
	  							alert('error from returned json remove cust' + error);
	  						},
	  						success : function(msg) {
	  							console.log("remove pres ajax returned successfully");
	  							fillCustomersAndPresentations();								
	  							} 										  					
	  						});		  	            	
					}
	  		    	  		    
	  		} else {
	  		    x = "You pressed Cancel!";
	  		    }
		  	});
		  	
	  			  		
	
  
  

  
  
  
  
  
  $("#addCustButton").bind( "click", 
		  function(event, ui) 		   			  
		  	{  
	  		console.log("adding customer");
	  		var salesmanEmail = getCookie("SalesmanEmail");
				var customerName = $("#newcustname").val();
				var customerCompany = $("#newcustcompany").val();
				var customerEmail = $("#newcustemail").val();
				console.log("adding customer ajax");
				$.ajax({
					type : "POST",
					url : "MainServlet",
					data : '{"action":"addNewCustomer", "salesmanEmail":"' + salesmanEmail + '", "customerName":"' + customerName + '", "customerCompany":"' + customerCompany + '", "customerEmail":"' + customerEmail + '"}',
					contentType : "application/json; charset=utf-8",
					processData : false,
					error : function(XmlHttpRequest, status, error) {
						alert('error from returned json add new cust' + error);
					},
					success : function(msg) {
						console.log("adding customer ajax returned");
						if(msg.newCustomer == 1){
							alert('New customer -->' + customerName + "<-- was added successfully.");							 
								$("#newcustname").val("");
								$("#newcustcompany").val("");
								$("#newcustemail").val("");
								$( "#popupAddCustomer" ).popup( "close" );
								
								// restart mgmt screen
								// first wait for actions to complete, put at end of event queue.
								//setTimeout(function() { managementScreen(); }, 0);
								// reload lists.
								fillCustomersAndPresentations();
								
						}else{
							alert("Problem with customer details. Cannot add Customer.");
						}
					}
					});
		  	}
     );
  
  
  $("#removePresentationButton").bind( "click", 
		  function(event, ui) 		   			  
		  	{  
	  		console.log("removing pres");
	  		//alert("removing pres");
	  		var salesmanEmail = getCookie("SalesmanEmail");
				//var customerName = $("#newcustname").val();
				//var customerCompany = $("#newcustcompany").val();
				//var customerEmail = $("#newcustemail").val();
				//console.log("adding customer ajax");
		/*		$.ajax({
					type : "POST",
					url : "MainServlet",
					data : '{"action":"addNewCustomer", "salesmanEmail":"' + salesmanEmail + '", "customerName":"' + customerName + '", "customerCompany":"' + customerCompany + '", "customerEmail":"' + customerEmail + '"}',
					contentType : "application/json; charset=utf-8",
					processData : false,
					error : function(XmlHttpRequest, status, error) {
						alert('error from returned json add new cust' + error);
					},
					success : function(msg) {
						console.log("adding customer ajax returned");
						if(msg.newCustomer == 1){
							alert('New customer -->' + customerName + "<-- was added successfully.");							 
								$("#newcustname").val("");
								$("#newcustcompany").val("");
								$("#newcustemail").val("");
								$( "#popupAddCustomer" ).popup( "close" );
								
								// restart mgmt screen
								// first wait for actions to complete, put at end of event queue.
								//setTimeout(function() { managementScreen(); }, 0);
								// reload lists.
								fillCustomersAndPresentations();
								
						}else{
							alert("Problem with customer details. Cannot add Customer.");
						}
					}
					});*/
		  	}
     );
  
  
  
  function doneClick(sessId)  // i is index of done button 	   	
	{
	  console.log("clicked done for sessid " + sessId);
	  //alert('clicked for session id ' + sessId + ' this is :' +this);
	  
	  	//sessId = $(this).attr("sessionId");  		
	  //alert("done button::: sessionId " + sessId);	  		
	//alert("done button" + this.closest('button').attr('id'));
	//alert("1 is " + event.target.id);
	//alert("8obj2 tostr is " + event.target.sessionId);
	  
	  // call servlet for done button with this session id
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

  
function bindDoneButtons(alerts_session_ids)
{
	console.log("bind done buttons");
	//alert("binding done btns");
	
	for(var i = 0; i < alerts_session_ids.length; i++)
	{
		curSessId = alerts_session_ids[i];
		
		$(".doneButton"+i).bind( "click", function(event)
				{
						// works - html
						//alert($(event.target).html());
						// undefined:
						//alert($(event.target).id);
			
						// 		works - real id - session id
						//	alert($(event.target).attr("id"));
						doneSessionId = $(event.target).attr("id");
						console.log("DONE for session: " + doneSessionId);
						
						doneClick(doneSessionId);
						
						// all useless:
						//alert(event.target);
						//alert(event.target.id);
						//alert(event.target.sessId);
						//alert($(event.target));
						//alert($(event.target).id);
						//alert($(event.target).sessId);						
						//alert($(event.target).attr("sessId"));
						//alert($(event.target)[0].parentNode.html());	
						//alert($(event.target)[0].parentNode.sessId);
						//alert($(event.target)[0].parentNode.attr("sessId"));
						//alert(event.target);
						//alert("sessid1: " + this.attr("sessId").text());							
						//alert("sessid2: " + this.attr("sessId").text());
						//alert("sessid3: " + $());
						//alert("sessid4: " + this.sessId);
						//alert("sessid5: " + this.attr("sessId"));
						//alert("sessid6: " + this.attr("sessId").text());
				}
		);
		
		
		// each has an ajax event to get the data:
		// inject dynamic code. maybe also possible with eval().
		//$(".doneButton"+i).onClick =	"doneClick( " + curSessId + ");";
		
				/*function()
				{
						console.log("Now in doneButton click for session " )
						// evaluate this code and run it.
						// this allows me to dynamically create it with different
						//sessionid each time.
						eval("doneClick( " + curSessId + ");" );
				} );*/
	}
	console.log("binding done btns done");
}
  
  
  //*******************************************************************************************
  
  function fillAlerts()
  {
	  console.log("fillAlerts");
		var email = getCookie("SalesmanEmail");
//		alert("email before get alerts:" + email);
		console.log("fillAlerts ajax");
	  $.ajax({
			type : "POST",
			url : "ReportsServlet",
			data : '{"action":"getAlerts", "email":"' + email.toLowerCase() + '"}',
			contentType : "application/json; charset=utf-8",
			processData : false,
			error : function(XmlHttpRequest, status, error) {
				alert('error from returned json.... ReportsServlet' + error);
			},
			success : function(msg) {			
				console.log("fillAlerts ajax returned");
				alertsHTML = '';
					// show some of the data, for testing.
				// init sessionIds array, all session id's for all alerts.
				alerts_session_ids = [];
				for(var i = 0; i < msg.alerts.length; i++){
					alerts_session_ids[i] = msg.alerts[i].session_id;
					datetimealert = msg.alerts[i].open_time;
					emailmailto = '<a style="color:white" href="mailto:' + msg.alerts[i].customer_email + '?Subject=Followup to our last email.">'+ msg.alerts[i].customer_email+'</a>';
					recommendation_text = '<div class="recommendation' +i + '">' + msg.alerts[i].customer_name + ' (' + emailmailto + ')' + '</div>';
					alertsHTML += '<li data-role="list-divider">'+ recommendation_text +' </li>';					
					
					description_text = "Viewed presentation: \"" + msg.alerts[i].slides_name + "\"";				 
					clicked_text = "Opened at " +msg.alerts[i].open_time;
					//+ " (message sent at " + msg.alerts[i].send_time + ").";
//					+ "<BR><BR> Original Message: <BR>" + msg.alerts[i].msg_text; 
					alertsHTML += '<li>';					
					alertsHTML += '<div class="ui-grid-b ui-responsive">';
					
					// I put sessionId inside a div inside the button because
					// that's the only way I found I can access this property from the 
					// click event.
					alertsHTML+='<div class="ui-block-a">'+					
					'<h2>'+description_text+'</h2><p><strong>'+clicked_text+'</strong></p>'+
					'<div  class="questions'+i+'"></div>'+
					'<a href="" sessionId="'+ msg.alerts[i].session_id +'"' +
					' class="doneButton'+i+' ui-btn ui-shadow ui-btn-inline ui-mini ui-icon-check ui-btn-icon-left" data-inline="true">'+
					'<div sessId="' + msg.alerts[i].session_id + '" id="' + msg.alerts[i].session_id + '">Done</div></a>'+																		
					'</div>' + // of ui-block-a
					'<div class="ui-block-b">'+
					'<div class="d3barchart'+i+'"></div>'+
					'</div>';					  
					// close main responsive div, and listitem element.
					alertsHTML +=  '</div></li>';										
				}
								
				//alert(alertsHTML);
				$("#smartalerts").html(alertsHTML);
				console.log("fillAlerts ajax returned updated html");
				
//				alert("filled alerts");
								
				// refresh each element in returned list.
				//refresh as in http://www.gajotres.net/uncaught-error-cannot-call-methods-on-prior-to-initialization-attempted-to-call-method-refresh/
				setTimeout(function() //pass the return parameters to this anonymous func 
						{ 					
								console.log("fillAlerts ajax returned done - timeout func - refreshing");
	//							alert("refreshing...");
								$('#smartalerts').listview("refresh");
								
								console.log("fillAlerts ajax returned done - refresh listview");
								
		//						alert("filling stuff");
								fillBarCharts(alerts_session_ids);
								fillQuestions(alerts_session_ids);
			//					alert("done filling stuff");
								bindDoneButtons(alerts_session_ids);
				//				alert("done bind stuff");
								
								console.log("fillAlerts ajax returned done - done barcharts, q's, done btns");
								// wait for callbacks to finish before updating done button.								
								//alert("yoyo");
								//setTimeout(BindDoneButtons(), 1000);
																
								
						}, 0); // put at end of event queue, after rendering checkboxes.
				console.log("fillAlerts ajax returned done.");
			} //  success func
			
		});
	  console.log("fillAlerts all done");
  }
  
  function fillBarCharts(alerts_session_ids)
  {
	  console.log("filling barcharts");
		// now we finished refreshing, we can add all the bar charts:
		for(var i = 0; i < alerts_session_ids.length; i++)
		{
			curSessId = alerts_session_ids[i];
			// each has an ajax event to get the data:
			
			      console.log("fillBarCharts calling getslideviews event");
					  $.ajax({
						  /// VERY important trick - this allows me to access the index 
						  // inside the anonymous functions.
						    curIndex: i,  // can be accessed in success() using this.curIndex
							type : "POST",
							url : "ReportsServlet",
							data : '{"action":"getSlideViews", "sessionId":"' + curSessId + '"}',
							contentType : "application/json; charset=utf-8",
							processData : false,
							error : function(XmlHttpRequest, status, error) {
								alert('error from returned json.... ReportsServlet getSlideViews' + error);
							},
							success : function(msg) 
							{
								console.log("fillBarCharts: getslideviews event returned " + msg);
								// received slide views array.
								var jsonTable = [];																																										
								for(var j = 0; j < msg.slideviews.length; j++)
								{		
											slideNumStr = msg.slideviews[j].slideNum.toString();
											
											// check if this slide num is already in the json table
											// if so - add space to the name so it will show in the bar chart separately.
											for(var t=0; t<jsonTable.length; t++)
												{
														if (jsonTable[t].slide==slideNumStr)
															{
																	slideNumStr = slideNumStr + " "; // add space to avoid duplicate slide#.
															}														
												}
										
												var time_viewed = msg.slideviews[j].timeViewed;
												// put cutoff of 180 of view time.
												if (time_viewed > 180) 
													{
															time_viewed = 180;
													}
											
												jsonItem = 
												{ "slide" : slideNumStr, 
													"time" : time_viewed
												};																							
												
												jsonTable.push(jsonItem);																								
								}								
								//alert("json table: " + JSON.stringify(jsonTable));
								//alert("adding bar chart number " + curIndex + " data is " + JSON.stringify(jsonTable));
								addAlertBarChart(".d3barchart"+this.curIndex, jsonTable); // by class name.																																																									
							} //  success func
						});																																																												 																					
		}														
		console.log("filling barcharts done");
  }
  
  function fillQuestions(alerts_session_ids)
  {
	  console.log("filling qs");
		// now we finished refreshing, we can add all the questions (i any)
		for(var i = 0; i < alerts_session_ids.length; i++)
		{
			curSessId = alerts_session_ids[i];
			// each has an ajax event to get the data:
			      console.log("calling getquestions event");
					  $.ajax({
						  /// VERY important trick - this allows me to access the index 
						  // inside the anonymous functions.
						    curIndex: i,  // can be accessed in success() using this.curIndex
							type : "POST",
							url : "ReportsServlet",
							data : '{"action":"getQuestions", "sessionId":"' + curSessId + '"}',
							contentType : "application/json; charset=utf-8",
							processData : false,
							error : function(XmlHttpRequest, status, error) {
								alert('error from returned json.... ReportsServlet getQuestions ' + error);
							},
							success : function(msg) 
							{	
								console.log("getqs event returned");
								// recommendation text (email for now)
								var recom = $(".recommendation"+this.curIndex).html();
								
								if (msg.questions.length > 0)
								{
										qmessage = "The customer asked these questions: <BR>"
											+ '<ul style="list-style-type:disc">';											  
 
										for(var j = 0; j < msg.questions.length; j++)
										{					
													q = msg.questions[j];
													qmessage += "<li>" + q + "</li>";
										}
										qmessage += "</ul>";
 		
										$(".questions"+this.curIndex).html(qmessage);
										
										//alert(qmessage);
										$(".recommendation"+this.curIndex).html("Call " + recom);
								}
								else // no q's
									{
										$(".recommendation"+this.curIndex).html("Send e-mail to " + recom);
									}
							} //  success func
						});																																																												 																					
		}
		console.log("filling qs done");
  }
  
  //*******************************************************************************************

  // run init on event.
$(document).on("pageinit", initPage() );

// load data after page show.
// needs to be run only for manage page, so it checks.
$(document).on("pagecontainershow", function () {
    var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");
    var activePageId = activePage[0].id;
    switch (activePageId) {
        case 'main':
 	            if (getCookie("SalesmanEmail") != "") // already logged in. 	            	
					   	   	 {
 	            				console.log("already logged in. going to mgmt");
						   	   				// set username field.
						   	   			$("#usernamefield").val(getCookie("SalesmanEmail"));
						   	   			// go to mgmt screen after waiting for all callbacks and refreshes.
						   	   			setTimeout(function() {managementScreen();}, 0);
					   	  	 }       						       				
            break;
        case 'manage':
        			//alert("filling lists");
        			console.log("in mgmt screen. filling. ");
							fillCustomersAndPresentations();
        			fillAlerts();        			
            break;

        default: alert("Error: page id not in case. " + activePageId);
    }
});
					      
//*******************************************************************************************
// go to management screen, fill all needed fields.
function managementScreen()
{
	console.log("going to mgmt");
	//alert("going to mgmt");
//	$("#usernamefield").val("sivan@gmail.com");
	changepage('#manage');	
	// data will be updated in page when it loads in pagecontainershow event, see above.
	
	//alert("changed page");							
}

//*******************************************************************************************
//automatic login for local testing.
// this is OBSOLETE - I now login automatically if cookie exists.
// for now, start at manage.
//if (document.location.hostname == "localhost")
//	{
				//setTimeout(		
			//			function() 
		//				{ 					
	//						setCookie("SalesmanEmail", "david.salesmaster@gmail.com", 2);  $("#usernamefield").val("david.salesmaster@gmail.com"); 
	//						managementScreen();
	//					}, 1500
	//			);
//}

		
