
	console.log(" binding gotoManage");
	$("#gotoManage").bind(
			"click",
			function(event, ui) {
				emailval = $("#usernamefield").val();
				passwordval = $("#passwordfield").val();

				// alert("email is " + emailval);

				emailval = $("#usernamefield").val();

				// alert("emailval is " + emailval);
				console.log("login servlet ajax");
				showWaitMsg();
				$				
						.ajax({
							// THIS is IMPORTANT, allows me to to access
							// this.localemailval
							// from anonymous function success()
							local_emailval : emailval,
							type : "POST",
							url : "ManagementServlet",
							data : '{"action":"salesmanLogin", "email":"'
									+ emailval.toLowerCase()
									+ '", "password":"'
									+ passwordval.toLowerCase() + '"}',
							contentType : "application/json; charset=utf-8",
							processData : false,
							error : function(XmlHttpRequest, status, error) {
								alert('salesmanLogin error from returned json'
										+ error);
							},
							success : function(msg) {
								if (msg.salesman == 1) {
									setCookie("SalesmanEmail",
											this.local_emailval, 2);
									// alert("set cookie emailsales to "
									// +this.local_emailval );
									// this looks OK
									console.log("set cookie SalesmanEmail to "
											+ this.local_emailval);
									//hideWaitMsg();
									alert("Welcome to Slidepiper!");
									loggedin=true;
									managementScreen();
								} else {
									alert("Wrong credentials for email "
											+ this.local_emailval
											+ ". Please try again.");
								}
							} // success func
						}); // end of ajax call

			} // click function in gotoManage
	); // end of bind gotoManage