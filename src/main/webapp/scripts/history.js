
/*************************************************************************/

	console.log(" binding history");
	$("#history").bind(
			"click",
			function(event, ui) {
				console.log("showing history screen");
				changepage('#history_page');
			} // click function in gotoManage
	); // end of bind gotoManage

	
	$("#historyBack").bind(
			"click",
			function(event, ui) {
				console.log("back from history - showing mgmt screen");
				managementScreen();
			} // click function in gotoManage
	); // end of bind gotoManage

	


	//*********************************************************************

	function makeGridItemTop(blockletter, content, heightpx)
	{
		return '<div class="ui-block-' + blockletter + '">'+
		'<div class="ui-bar ui-bar-a" style="height:' + heightpx +'px">'+content+'</div></div>';
	}

	function makeGridItemBody(blockletter, content, heightpx)
	{
		return '<div class="ui-block-' + blockletter + '">'+
		'<div class="ui-body ui-body-d" style="height:' + heightpx +'px">'+content+'</div></div>';
	}

	//*******************************************************************************************

	//*******************************************************************************************

	function fillHistory() {
		console.log("fillHistory");
		var email = getCookie("SalesmanEmail");
		//alert("email before get history:" + email);
		showWaitMsg();
		$
				.ajax({
					type : "POST",
					url : "ReportsServlet",
					data : '{"action":"getHistory", "email":"' + email.toLowerCase()
							+ '"}',
					contentType : "application/json; charset=utf-8",
					processData : false,
					error : function(XmlHttpRequest, status, error) {
						swal("Error",'error from returned json.... ReportsServlet getHistory' + error,"error");
					},
					success : function(msg) {
						console.log("fillHistory ajax returned");
						historyHTML = msg.history;
						$("#historyDiv").hide().html(historyHTML).fadeIn('fast');
						hideWaitMsg();
					}
				});
		
		console.log("fillHistory all done");
	}
			/**********************************************************************************/