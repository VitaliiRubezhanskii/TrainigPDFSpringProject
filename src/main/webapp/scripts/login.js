
//	console.log(" binding gotoManage");
	$("#gotoManage").bind(
			"click",
			function(event, ui) {
								
				if (navigator.cookieEnabled==false)
					{
						swal("Login Error", "You must enable cookies in your browser to use the system.", "error");								
					}
				
				emailval = $("#usernamefield").val().toLowerCase();
				passwordval = $("#passwordfield").val();

				// alert("email is " + emailval);

				emailval = $("#usernamefield").val().toLowerCase();

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
								swal('salesmanLogin error from returned json'
										+ error);
							},
							success : function(msg) {
								if (msg.salesman == 1) {
									setCookie("SalesmanEmail",
											this.local_emailval, 120);
									// alert("set cookie emailsales to "
									// +this.local_emailval );
									// this looks OK
									console.log("set cookie SalesmanEmail to "
											+ this.local_emailval);
									//hideWaitMsg();
									//swal("SlidePiper Login", "Welcome to SlidePiper!", "success");
									//alert("Welcome to Slidepiper!");
									loggedin=true;
									managementScreen();
								} else {
									swal("Login Error", "Wrong credentials for email "
											+ this.local_emailval
											+ ". Please try again.", "error");
									hideWaitMsg();
								}
							} // success func
						}); // end of ajax call

			} // click function in gotoManage
	); // end of bind gotoManage
