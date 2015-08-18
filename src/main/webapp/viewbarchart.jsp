<!DOCTYPE html>
<html>
<!--  How to use? call this with parameter: viewbarchart.jsp?session_id=0.52352... -->
    
    <!-- *************************************** head ********************************** -->
<head>
	<!--  <meta charset="utf-8"> -->
	 <meta http-equiv='Content-Type' content='text/html;charset=ISO 8859-8' >
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Bar Chart of slide views</title>
	<link rel="shortcut icon" href="../favicon.ico">
  <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:300,400,700">
	<link rel="stylesheet" href="jqm/jquery.mobile-1.4.5.css">
	<link rel="stylesheet" href="themes/blue-header.min.css" />
	<link rel="stylesheet" href="themes/jquery.mobile.icons.min.css" />	
	<script src="jqm/jquery.js"></script>
	<script src="jqm/jquery.mobile-1.4.5.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js"></script>
			    
    <style type="text/css">
    		.ui-content,.no-padding-class
    			{
        	padding-bottom:0px;
        	padding-left:0px;
        	padding-right:0px;
        	padding-top:0px;
        		}	
           
					body {
					    /*background: url(img/background.jpg);*/
					    background-repeat:repeat-y;
					    background-position:center center;
					    background-attachment:scroll;
					    background-size:100% 100%;
					}
					.ui-page {
					    background: transparent;
					}
					.ui-content{
					    background: transparent;
					}
										
					/* style for barchart*/
  				.bar {
						  fill: steelblue;
						}
						.bar:hover {
						  fill: brown;
						}
						.axis {
						  font: 10px sans-serif;
						}
						.axis path,
						.axis line {
						  fill: none;
						  stroke: #000;
						  shape-rendering: crispEdges;
						}
						.x.axis path {
						  display: none;
						}																		
		</style>
		
		<!--this is the Google analytics tracking code-->
		<script>
		  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

		  ga('create', 'UA-64949615-2', 'auto');
		  ga('send', 'pageview');

		</script>
</head>

    <!-- *************************************** body ********************************** -->
<body>
        
        <!-- *************************************** barchart  ********************************** -->
<div data-role="page" id="main" data-quicklinks="true" data-theme="b">
    <!--  ****************************************************************** -->
 <div role="main" class="ui-content jqm-content" data-theme="b">            
           	            <div id="barchartDiv"></div>
 </div>    
 
 <!--  ****************************************************************** -->           
</div><!-- /page -->

    <!-- *************************************** END OF PAGE ********************************** -->

    
        <!-- *************************************** INCLUDE SCRIPTS ********************************** -->
<script type="text/javascript" src="scripts/globalvars.js"></script>
<script type="text/javascript" src="scripts/timezone.js"></script>                                 
<script type="text/javascript" src="scripts/cookies.js"></script>
<script type="text/javascript" src="scripts/clientutils.js"></script>
<script type="text/javascript" src="scripts/waitmessage.js"></script>
<script type="text/javascript" src="scripts/makecheckboxes.js"></script>
<script type="text/javascript" src="scripts/load_mgmt_screen.js"></script>
<script type="text/javascript" src="scripts/d3utils.js"></script>
<script type="text/javascript" src="scripts/done_button.js"></script>
<script type="text/javascript" src="scripts/filldata.js"></script>
<script type="text/javascript" src="scripts/init_page.js"></script>
<!-- - from here loading from DB should start, meanwhile
              the other js files are being loaded sequentially.
              So I don't suffer so much from not using requirejs. -->
<script type="text/javascript" src="scripts/send_events.js"></script>
<script type="text/javascript" src="scripts/login.js"></script>
<script type="text/javascript" src="scripts/randomhash.js"></script>
<script type="text/javascript" src="scripts/logout.js"></script>
<script type="text/javascript" src="scripts/file_upload.js"></script>
<script type="text/javascript" src="scripts/remove_customer.js"></script>
<script type="text/javascript" src="scripts/remove_presentation.js"></script>
<script type="text/javascript" src="scripts/send_email.js"></script>
<script type="text/javascript" src="scripts/add_customer.js"></script>
<script type="text/javascript" src="scripts/history.js"></script> 
<script type="text/javascript" src="scripts/account.js"></script>



<SCRIPT>

//*******************************************************************************************

function fillBarChart() {
	console.log("filling barchart");
	
	// get parameter for URL
	session_id = <%= request.getParameter("session_id") %>;
		$.ajax({
					// / VERY important trick - this allows me to access the
					// parameter
					// inside the anonymous functions.
					  mySessionId : session_id, // use in success with this.mySessionId
					type : "POST",
					url : "ReportsServlet",
					data : '{"action":"getSlideViews", "sessionId":"'
							+ session_id + '"}',
					contentType : "application/json; charset=utf-8",
					processData : false,
					error : function(XmlHttpRequest, status, error) {
						hideWaitMsg();
						alert('viewbarchart: error from returned json.... ReportsServlet getSlideViews'
								+ error);
					},
					success : function(msg) {
						//console.log("fillBarChart: getslideviews event returned "
		//								+ msg);
						// received slide views array.
						var jsonTable = [];
						for (var j = 0; j < msg.slideviews.length; j++) {
									slideNumStr = msg.slideviews[j].slideNum.toString();
									if (slideNumStr == "-1") slideNumStr = "X";		
									// check if this slide num is already in the json
									// table
									// if so - add space to the name so it will show in
									// the bar chart separately.
									for (var t = 0; t < jsonTable.length; t++) {
										if (jsonTable[t].slide == slideNumStr) {
											slideNumStr = slideNumStr + " "; 
											// add space to avoid duplicate slide#. 
								      //adds extra space for each occurrence.
										}
									}
		
									var time_viewed = msg.slideviews[j].timeViewed;
									// put cutoff of 90 of view time.
									if (time_viewed > 90) {	time_viewed = 90;}																		
									jsonItem = {"slide" : slideNumStr,"time" : time_viewed};		
									jsonTable.push(jsonItem);								
						}
						
		
						if (msg.slideviews.length <4) //1-2-3 slide views
						{
							//padding to make barchart narrower if only 1/2 bars.
								emptyJsonItem = { "slide" : "",	"time" : 0};								
								jsonTable.push(emptyJsonItem);jsonTable.push(emptyJsonItem);
								jsonTable.push(emptyJsonItem);jsonTable.push(emptyJsonItem);
						}
						
						// alert("json table: " + JSON.stringify(jsonTable));
						// alert("adding bar chart number " + curIndex + " data
						// is " + JSON.stringify(jsonTable));
						addAlertBarChart("#barchartDiv",jsonTable); // by id
						console.log("Barchart loaded successfully");																		
					} // success func
				} // of ajax json
			);
	}	

// do it:
fillBarChart();

</SCRIPT>
</body>
</html>

