
$("#removeCustButton")
		.bind(
				"click",
				function(event, ui) {
					console.log("removing customer");
					var r = confirm("Are you sure? You may lose customer tracking.");
					if (r == true) {
						x = "You pressed OK!";

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

						if (customers.length != 1) {
							swal("Can't do it.", "The system currently supports removing one customer at a time.","error");
						} else {
							// get emails:
							var salesmanEmail = getCookie("SalesmanEmail");
							var customerEmail = customeremails; // should be
																// only one.
							datajson = '{"action":"deleteCustomer", "salesman_email":"'
									+ salesmanEmail
									+ '", "customer_email":"'
									+ customerEmail + '"}';
							console.log("removing cust datajson=" + datajson);
							showWaitMsg();
							$
									.ajax({
										type : "POST",
										url : "ManagementServlet",
										data : datajson,
										contentType : "application/json; charset=utf-8",
										processData : false,
										error : function(XmlHttpRequest,
												status, error) {
											swal('error from returned json remove cust'
													+ error);
										},
										success : function(msg) {
											swal("It's been done.", "Customer deleted!", "success" );
											console
													.log("remove customer ajax returned successfully");
											fillCustomersAndPresentations();
											// fill customers will set it to true and remove loading msg.
											customersloaded = false;
										}
									});
						}

					} else {
						x = "You pressed Cancel!";
						// do nothing on cancel.
					}
				});
