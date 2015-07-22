// add customer

$("#addCustButton")
		.bind(
				"click",
				function(event, ui) {
					console.log("adding customer");
					var salesmanEmail = getCookie("SalesmanEmail");
					var customerName = $("#newcustname").val();
					var customerCompany = $("#newcustcompany").val();
					var customerEmail = $("#newcustemail").val();
					console.log("adding customer ajax");
					showWaitMsg();
					$
							.ajax({
								type : "POST",
								url : "ManagementServlet",
								data : '{"action":"addNewCustomer", "salesmanEmail":"'
										+ salesmanEmail
										+ '", "customerName":"'
										+ customerName
										+ '", "customerCompany":"'
										+ customerCompany
										+ '", "customerEmail":"'
										+ customerEmail + '"}',
								contentType : "application/json; charset=utf-8",
								processData : false,
								error : function(XmlHttpRequest, status, error) {
									hideWaitMsg();
									alert('error from returned json add new cust'
											+ error);
								},
								success : function(msg) {
									hideWaitMsg();
									console
											.log("adding customer ajax returned");
									if (msg.newCustomer == 1) {
										alert('New customer -->' + customerName
												+ "<-- was added successfully.");
										$("#newcustname").val("");
										$("#newcustcompany").val("");
										$("#newcustemail").val("");
										$("#popupAddCustomer").popup("close");

										// restart mgmt screen
										// first wait for actions to complete,
										// put at end of event queue.
										// setTimeout(function() {
										// managementScreen(); }, 0);
										// reload lists.
										fillCustomersAndPresentations();

									} else {
										
										alert("Problem with customer details. Cannot add Customer.");
									}
								}
							});
				});
