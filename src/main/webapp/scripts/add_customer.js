
$("#addCustButton")  // add customer
		.bind(
				"click",
				function(event, ui) {
					console.log("adding customer");
					var salesmanEmail = getCookie("SalesmanEmail");
					salesmanEmail = salesmanEmail.toLowerCase();
					var customerFirstName = $("#newcustfirstname").val();
					var customerLastName = $("#newcustlastname").val();
					var customerCompany = $("#newcustcompany").val();
					var customerEmail = $("#newcustemail").val();
					customerEmail = customerEmail.toLowerCase();
					//console.log("adding customer ajax: name " + customerName + " company " + customerCompany + " email " + customerEmail );
					showWaitMsg();
					
					jsondata='{"action":"addNewCustomer", "salesmanEmail":"'
						+ salesmanEmail
						+ '", "customerFirstName":"'
						+ customerFirstName
						+ '", "customerLastName":"'
            + customerLastName
						+ '", "customerCompany":"'
						+ customerCompany
						+ '", "customerEmail":"'
						+ customerEmail + '"}';
					
					$
							.ajax({
								type : "POST",
								url : "ManagementServlet",
								data : jsondata,
								contentType : "application/json; charset=utf-8",
								processData : false,
								error : function(XmlHttpRequest, status, error) {
									hideWaitMsg();
									swal('error from returned json add new cust'
											+ error);
								},
								success : function(msg) {
									hideWaitMsg();
									console
											.log("adding customer ajax returned");
									if (msg.newCustomer == 1) {
										swal(" New Customer ", customerFirstName + " " + customerLastName + "  was created! ", "success");
										//alert('New customer -->' + customerName
										//		+ "<-- was added successfully.");
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
										
										swal("Problem with customer details. Cannot add Customer.");
									}
								}
							});
				});
