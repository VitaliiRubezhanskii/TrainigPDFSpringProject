/* Global Variables */
var sp = sp || {};

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
						sp.email.customerEmailArray = [];
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
										sp.email.customerEmailArray = customeremails;
										
										
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
						sp.email.emailBody = msgtext;
						
						msgsubj = encodeURIComponent(msgsubj);
						sp.email.emailSubject = msgsubj;

						// first make some validations on the input.
						/* if (!((customers.length == 1) && (pres1.length == 1))) {
							swal("Can't do it.", "The system currently supports sending only one presentation to one customer.","error");
						} else */

						
												
						if (msgtext == "") {
							swal("Error","Please fill in the message text.","error");
						} else if (msgsubj == "") {
							swal("Error","Please fill in the message subject.","error");
						} else if (0 == sp.email.customerEmailArray.length) {
              alert('Please choose at least one customer for sending an email');
						} else if (50 < sp.email.customerEmailArray.length) {
              alert('Please choose no more than 50 customers for sending an email');
						} else {
							
						// everything is fine, send msg
						  
						//docid = randomHash();
							
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
							sp.email.salesmanEmail = emailval;

							
							
							//alert(jsondata);
																					
							//send_salesman_event("SEND_EMAIL", '0', '0', jsondata);
														
							//showWaitMsg();
							
							// TODO: add email client as a another property to fetch.
							$.ajax({
								async: false,
								url: 'ManagementServlet',
								dataType: 'json',
								data: {action: "getMailType", salesmanEmail: sp.email.salesmanEmail.toLowerCase()},
							}).done(function(data) {
								sp.email.salesmanEmailClient = data.mailType;
							}).fail(function(jqXHR, textStatus, errorThrown) {
								console.log(textStatus + ": " + errorThrown);
							});
							
							switch (sp.email.salesmanEmailClient) {
						    case 'gmail':
						      sp.email.gmailAuthorization(true);
						      // sp.email.sendEmail method takes place under the
						      // authorization callback function. 
						      break;
						    
						    default:
						      if (1 == sp.email.customerEmailArray.length) {
						        sp.email.sendEmail('');
						      } else {
						        alert('Please select only one customer for sending an email');
						      }
						  }
						  
					 }
});		
