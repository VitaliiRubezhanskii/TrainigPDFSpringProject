
// *******************************************************************************************

$("#removePresentationButton")
		.bind(
				"click",
				function(event, ui) {
					console.log("removing pres");
					var r = confirm("Are you sure? You may break the link for this presentation.");
					if (r == true) {
						x = "You pressed OK!";

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

						if (pres1.length != 1) {
							alert("The system currently supports removing one presentation at a time.");
						} else {
							// get email
							var salesmanEmail = getCookie("SalesmanEmail");
							datajson = '{"action":"deletePresentation", "salesman_email":"'
									+ salesmanEmail
									+ '", "presentation":"'
									+ pres1 + '"}';
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
											alert('error from returned json remove cust'
													+ error);
										},
										success : function(msg) {						
											console
													.log("remove pres ajax returned successfully");
											fillCustomersAndPresentations();
											// fill cust and pres will set it to true and remove waiting widget.
											presentationsloaded=false;
										}
									});
						}

					} else {
						x = "You pressed Cancel!";
					}
				});