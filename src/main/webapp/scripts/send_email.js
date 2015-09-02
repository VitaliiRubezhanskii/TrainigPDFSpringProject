	$("#send_email_to_customers")
			.bind(
					"click",
					function(event) {
						
						// keywords for making the hash for the docid
						var hashkeywords = [];
						
						console.log("sendemail");
						// alert('sending email');
						var customers = [];
						var customeremails = [];
						// checkboxes from the customers list
						$('.customers').each(
								function() {
									if ($(this).is(":checked")) {
										customers.push(this.getAttribute("value"));

										// this should work fine
										// in html5 it should be possible to use
										// this.dataset.email, but it doesn't
										// work for
										// some reason (maybe old Firefox).
										customeremails.push(this
												.getAttribute("data-email"));
										
										
										//custemail = this.getAttribute("data-email");
										//splitted = custemail.split("@");
										//custemail = splitted[0]; // only before @.
										//splitted = custemail.split(" ");
										//var aa;
										//for(aa=0; aa<splitted.length; aa++)
										//	{
										//			//hashkeywords.push(splitted[aa]);	
										//	}
										// I will not use it.
										// customer email is too intrusive.
										
									}
								});
						// ("customers selected: " + customers);

						var pres1 = [];
						// checkboxes from the pres1 list
						$('.pres1').each(
								function() {
									if ($(this).is(":checked")) {
										// without last @1 or @2:
										slidesid = this.id.substring(0,
												this.id.length - 2);
										console.log("Taking slides with id "
												+ slidesid);
										pres1.push(slidesid);
										
										presname = this.getAttribute("value");
										splitted = presname.split(" ");
										var aa;
										for(aa=0; aa<splitted.length; aa++)
											{
													hashkeywords.push(splitted[aa]);	
											}
									}
								});						
						
						//alert("hash keywords: " + hashkeywords);
						
						msgtext = $("#msgtext1").val();
						msgsubj = $("#subject1").val();
						
						// problem with " quotation marks
						
						msgtext = msgtext.replace("\"", "");
						msgsubj = msgsubj.replace("\"", "");
																		
						// grashim  -- '  are ok (tested).
						
						msgtext = encodeURIComponent(msgtext);
						msgsubj = encodeURIComponent(msgsubj);											

						// first make some validations on the input.
						if (!((customers.length == 1) && (pres1.length == 1))) {
							swal("Can't do it.", "The system currently supports sending only one presentation to one customer.","error");
						} else if (msgtext == "") {
							swal("Error","Please fill in the message text.","error");
						} else if (msgsubj == "") {
							swal("Error","Please fill in the message subject.","error");
						} else { // everything is fine, send msg
							
							//docid = randomHash();
							docid="";
							
							emailval = $("#usernamefield").val();
							smname = emailval.toLowerCase();
							smname = smname.split("@"); 
							smname = smname[0];
							
							for( var i=0; i<2; i++)
								{
										if(Math.random() >0.5)
										{
											// 	0 to length-1
											var num = Math.floor(Math.random() * hashkeywords.length); 
											docid = docid + hashkeywords[num];
											docid = docid + "_";
										}									
										
										if(Math.random() >0.5)
										{
																	// salesman start of email.
											docid = docid + smname;
											docid = docid + "_";
										}
										
										
										if(Math.random() >0.5)
											{
													docid = docid + "_";
											}
										
										for (twice=0; twice<2; twice++)
											{
													if(Math.random() >0.5)
													{
															if(Math.random() >0.5)
															{
																	docid = docid + "_";
															}
															zeroToNine = Math.floor(Math.random() * 10);
															docid = docid + zeroToNine;
															
															if(Math.random() >0.5)
															{
																	docid = docid + "_";
															}
													}
											}
										
										docid += randomLetter();
										
									
								}							
							
							docid = docid.cleanup();
							
							//alert(docid);

							// replace newlines with <br>
							//msgtext = msgtext.replace(/(?:\r\n|\r|\n)/g,
								//	'<br />');

							/*
							 * // if RTL, make it RTL: if
							 * ($("#rtl").is(":checked")) { alert("making rtl");
							 * msgtext = '<p dir="rtl">' + msgtext + '</p>'; }
							 */

							emailval = $("#usernamefield").val();

							jsondata = '{"action":"sendPresentationToCustomer",'
									+ '"salesman_email":"'
									+ emailval.toLowerCase()
									+ '",'
									+ '"slides_ids":"'
									+ pres1
									+ '",'
									+ '"customers":"'
									+ customers
									+ '",'
									+ '"customeremails":"'
									+ customeremails
									+ '",'
									+ '"msgsubj":"'
									+ msgsubj
									+ '",'
									+ '"msgtext":"'
									+ msgtext
									+ '",'
									+ '"timezone_offset_min":"'
									+ tz_offset_min
									+ '",'									
									+ '"docid":"' + docid 
									+ '"'
									+ '}';
							
							//alert(jsondata);
																					
							send_salesman_event("SEND_EMAIL", '0', '0', jsondata);
														
							showWaitMsg();
							// alert("json msg " + jsondata);
							console.log("sendemail ajax");
							$.ajax({
										type : "POST",
										url : "ManagementServlet",
										data : jsondata,
										contentType : "application/json; charset=utf-8",
										processData : false,
										error : function(XmlHttpRequest,
												status, error) {
											swal('sendCustomerMessage error from returned json'
													+ error);
										},
										success : function(msg) {
											JSONobj = JSON.parse(jsondata);
											if (msg.succeeded == 1) {
												console
														.log("message registered on server. loading client for " + msg.mailtype);
												// alert("link is " + msg.link);

												var mailtypemsg = "mailtype: " + msg.mailtype;
												send_salesman_event("REGISTERED_EMAIL", '0', '0', mailtypemsg);																													

												switch (msg.mailtype)
												{
													case "mailto" : 														
														mailtourl = "mailto:"
															+ JSONobj.customeremails
															+ "?Subject="
															+ JSONobj.msgsubj
															+ "" +
															// $("#cust_email").text()
															// +
															"&body="
															+ JSONobj.msgtext + "%0D%0A" + "%0D%0A" //linebreaks
															+ msg.link + "%0D%0A";
														break;
													case "gmail" :
														mailtourl =	"https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=" 
															+ JSONobj.customeremails + 
															"&su=" + 
															JSONobj.msgsubj + 
															"&body=" +
															JSONobj.msgtext + "%0D%0A" + "%0D%0A" + //linebreaks
															msg.link + "%0D%0A";														
														break;														
														default: swal("Cannot send email.", "Mailtype is not defined correctly - " + msg.mailtype, "error");
													}
												
												send_salesman_event("OPEN_EMAIL_CLIENT", '0', '0', mailtourl.toString());
												
												//alert(mailtourl);
//												alert(JSONobj.toString());
	//											alert(JSONobj.msgtext);
		//										alert(JSONobj.msgsubj);
			//									alert(this.data.toString());
												
												mailtourl = mailtourl.replace(" ", "%20");
												mailtourl = mailtourl.replace("\r\n", "%0D%0A");
												
												// someone used this and it was helpful:
												/*
												body = body.replaceAll("\\\\", "%5C");
												body = body.replaceAll(" ", "%20");
												body = body.replaceAll("\r", "%0D");
												body = body.replaceAll("\n", "%0A");
												body = body.replaceAll("\t", "%09");
												*/																								
												
												//alert("mailto is " + mailtourl);

												// open gmail in 2 seconds, to allow logs to update
												// with messages above. Otherwise the log is not
												// updated. 
												//  However this disallows me to open a popup window
												// because it's not on click.	
												// need to fix sometime.
												setTimeout(function() {
													hideWaitMsg();
													
													switch (msg.mailtype)
													{
														case "mailto" :
															location.href = mailtourl;
															break;
														case "gmail" :
															window.open(mailtourl); // 
															// will not open window because it's not on a click.
															break;
													}
												}, 2000);
																						
												// setCookie("SalesmanEmail",
												// emailval, 2);
												// alert("Message registered and
												// sent!");
												// managementScreen();
												console
														.log("send message done. (opened mailto)");
											} else {
												swal("Error sending message (error in writing to database)");
											}
										} // success func
									}); // end of ajax call
						}

					});
	console.log(" binding sendemail");
