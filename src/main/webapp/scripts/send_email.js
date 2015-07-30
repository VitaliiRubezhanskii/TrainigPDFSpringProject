	$("#send_email_to_customers")
			.bind(
					"click",
					function(event) {						
						console.log("sendemail");
						// alert('sending email');
						var customers = [];
						var customeremails = [];
						// checkboxes from the customers list
						$('.customers').each(
								function() {
									if ($(this).is(":checked")) {
										customers.push(this.value);

										// this should work fine
										// in html5 it should be possible to use
										// this.dataset.email, but it doesn't
										// work for
										// some reason (maybe old Firefox).
										customeremails.push(this
												.getAttribute("data-email"));
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
									}
								});
						msgtext = $("#msgtext1").val();
						msgsubj = $("#subject1").val();

						// first make some validations on the input.
						if (!((customers.length == 1) && (pres1.length == 1))) {
							swal("Can't do it.", "The system currently supports sending only one presentation to one customer.","error");
						} else if (msgtext == "") {
							swal("Error","Please fill in the message text.","error");
						} else if (msgsubj == "") {
							swal("Error","Please fill in the message subject.","error");
						} else { // everything is fine, send msg
							docid = randomHash();

							// replace newlines with <br>
							msgtext = msgtext.replace(/(?:\r\n|\r|\n)/g,
									'<br />');

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
							$
									.ajax({
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
														.log("message registered on server.");
												// alert("link is " + msg.link);

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
												
												mailtourl = mailtourl.replace(" ", "%20");
												mailtourl = mailtourl.replace("\r\n", "%0D%0A");
												
												hideWaitMsg();
												
												//alert("mailto is " + mailtourl);

												location.href = mailtourl;
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
