// change password button

$("#changePW")  // add customer
		.bind(
				"click",
				function(event, ui)
				{
						showWaitMsg();
						
						// hide after 10 seconds anyhow, so it doesn't hide error msgs.
						setTimeout(hideWaitMsg, 10000);
						
						oldpw = $("#passwordfieldOld").val().toLowerCase();
						pw1 = $("#passwordfieldChange").val().toLowerCase(); 
						pw2 = $("#passwordfieldChange2").val().toLowerCase();
						var emailval = getCookie("SalesmanEmail").toLowerCase();
						if (pw1==pw2) //equals, change.
							{
							
							console.log("change pw servlet ajax");
							showWaitMsg();
							$				
									.ajax({
										// THIS is IMPORTANT, allows me to to access
										// this.localemailval
										// from anonymous function success()						
										type : "POST",
										url : "ManagementServlet",
										data : 
											'{"action":"changeSalesmanPassword", "email":"'
												+ emailval.toLowerCase()
												+ '", "oldpassword":"'
												+ oldpw 
												+ '", "newpassword":"'
												+ pw1
												+ '"}',
										contentType : "application/json; charset=utf-8",
										processData : false,
										error : function(XmlHttpRequest, status, error) {
											swal('pw change error from returned json'
													+ error);
										},
										success : function(msg) {
											if (msg.success == 1) {												
												swal("Done", "Password changed successfully.", "success");
												hideWaitMsg();
												$( "#accoutPanel" ).panel( "close" );
											} else {
												swal("Error", "Error changing password. ", "error");
												hideWaitMsg();
											}
										} // success func
									}); // end of ajax call
																			
							}
						else
							{ 
									swal("Error", "Passwords do not match", "error");
							}
				});


