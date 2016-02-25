// fill data from DB
function fillCustomersAndPresentations() {
	//console.log("fillCustAndPres");
	// alert("filling custs & pres");
	// ClearLists();
	var email = getCookie("SalesmanEmail");
	//console.log("getSalesmanData ajax");
	{
		$.ajax({
			type : "POST",
			url : "ManagementServlet",
			data : '{"action":"getSalesmanData", "email":"'
					+ email.toLowerCase() + '"}',
			contentType : "application/json; charset=utf-8",
			processData : false,
			error : function(XmlHttpRequest, status, error) {
				alert('error from returned json getSalesmanData' + error);
			},
			success : function(msg) {
				
				//console.log("getSalesmanData ajax returned");
				var size = msg.myCustomers.length;
				// var myCustomers = "";
				console.log("Loaded customers. # of customers: " + msg.myCustomers.length);
				custCheckboxes = '<fieldset data-role="controlgroup">';
				if (size > 0) {
					for (var i = 0; i < msg.myCustomers.length; i++) {
						// console.log("adding customer " +
						// msg.myCustomers[i].name);
						
					  if (sp.config.email.defaultCustomerEmail != msg.myCustomers[i].email) {
					    custCheckboxes += makeCustomerCb('cust' + i,
					        msg.myCustomers[i].name, 'customers',
					        msg.myCustomers[i].email);
					  }

						// alert('cust email ' + msg.myCustomers[i].email);
					}
					custCheckboxes += '</fieldset>';
					$("#customersDiv").hide().html(custCheckboxes).fadeIn('fast');
				}
				
				console.log("------------------------------Customers loaded successfully");
				
				// $(".customerSelect").html(myCustomers);
				var presentations = "";
				pres1Checkboxes = '<fieldset data-role="controlgroup">';
				//pres2Checkboxes = '<fieldset data-role="controlgroup">';
				for (var i = 0; i < msg.presentations.length; i++) {
					// console.log("adding pres " + msg.presentations[i].name +
					// " with id " + msg.presentations[i].id);
					// $("#presentations1").append(makeCb('slides'+i,msg.presentations[i].name));//.trigger(
					// "create" );
					// $("#presentations2").append(makeCb('slides'+i,msg.presentations[i].name));//.trigger(
					// "create" );
					// presentations += "<option value='" +
					// msg.presentations[i].name + "'>" +
					// msg.presentations[i].name + "</option>";
					// presentations += msg.presentations[i].name;

					// need to remove the @1 @2 when using the id, leave only
					// capital letters, that's what I allow.
					pres1Checkboxes += makeCb(msg.presentations[i].id + "@1",
							msg.presentations[i].name, 'pres1');
					//pres2Checkboxes += makeCb(msg.presentations[i].id + "@2",
					//		msg.presentations[i].name, 'pres2');
				}
				pres1Checkboxes += '</fieldset>';
				//pres2Checkboxes += '</fieldset>';
				//alert(pres1Checkboxes);
				$("#pres1Div").hide().html(pres1Checkboxes).fadeIn('fast');
				//$("#pres2Div").hide().html(pres2Checkboxes).fadeIn('fast');
				
				console.log("----------------------------Presentations loaded successfully");
				// refreshLists();
				// refreshPage();
				// setTimeout(function() { changepage('#manage');} , 400);
				// $(".presentationSelect").html(presentations);
				// $.mobile.activePage.trigger("pagecreate");
				// alert("loaded cust" + custCheckboxes + " pres " +
				// pres1Checkboxes);

				// refresh each element in returned list - should be all
				// checkboxes.
				// refresh as in
				// http://www.gajotres.net/uncaught-error-cannot-call-methods-on-prior-to-initialization-attempted-to-call-method-refresh/
				setTimeout(function() {
					$('.jqmcheckbox').checkboxradio().checkboxradio("refresh");
					
					customersloaded=true;
					presentationsloaded=true;
					// after the refreshes, it's all fully loaded.
										
					hideLoadingMsgIfFullyLoaded();
					
					
	                /**
	                 * Add file hash placeholder representation.
	                 * 
	                 * Considering UI, perhaps it is better to remove this section.
	                 */
					        /*
	                $('label.ui-btn:not([for^=cust])').each(function() {
	                  var fileHash = $(this).attr('for').substr(0, $(this).attr('for').length - 2);
	                  var div = $(this).closest('div');
	                  var divHeight = div.css('height');
	                  
	                  div.after('<div class="sp-file-hash-placeholder">Placeholder: |file='
	                      + fileHash + '|</div>');
	                  $('.sp-file-hash-placeholder').css({'height': divHeight, 'line-height': divHeight});
	                });
					        */
	                
	                
				}, 2000); // put at end of event queue, after rending checkboxes.
				// alert("fill cust & pres done");
			}
		});
	}

	//console.log("fillcustAndPres done");
}




//*******************************************************************************************
