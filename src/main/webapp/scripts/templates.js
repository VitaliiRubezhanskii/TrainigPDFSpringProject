

// templates 1,2,3 for now.
$("#template1")
		.bind(
				"click",
				function(event, ui) {
					  $("#msgtext1").val(
							  "Hi [Customer]\n"
							  +"I hope you are well.\n"
							  +"Following our conversation I am sending you our presentation in the following link:\n"	  
					  );
					  $( "#popupTemplates" ).popup( "close" );
				}
	    );

$("#template2")
.bind(
		"click",
		function(event, ui) {
			  $("#msgtext1").val(
					  "Hi [Customer],\n"
					  +"My name is [Salesman].\n"
					  +"I wanted to know if your company would be interested in our services.\n"
					  +"We specialize in [what your company does]\n"
					  +"Here is a link to our portfolio presentation:\n"						  			 
			  );
			  $( "#popupTemplates" ).popup( "close" );
		}
);


$("#template3")
.bind(
		"click",
		function(event, ui) {
			  $("#msgtext1").val(
					  "Hi [Customer],\n"
					  +"How are you?\n"
					  +"We are meeting at {meeting time}.\n"
					  +"I am sending you a presentation beforehand, it would be great if you could glance through it.\n"
					  +"See you soon.\n"
					  +"Link:\n"
					  );
			  $( "#popupTemplates" ).popup( "close" );
		}
);


$("#template4")
.bind(
		"click",
		function(event, ui) {
			  $("#msgtext1").val(
					  "Hi [Customer],\n"
					  +"I hope you are well.\n" 
					  +"I am sending you the information you requested in the following link:\n"
					  );
			  $( "#popupTemplates" ).popup( "close" );
		}
);


$("#template5")
.bind(
		"click",
		function(event, ui) {
			  $("#msgtext1").val(
					  "I hope this note finds you well.\n"
					  +"I’ve been working for a company called [my company] that specializes in [what my company does]\n"
					  +"Thinking about your role at [company], I thought there might be a good fit for your group.\n"
					  +"Our [product name] is getting a lot of attention in the marketplace and I think it’s something\n" 
					  +"that your organization might see immediate value in.\n"
					  +"Can you help me get in contact with the right decision-maker?\n"
					  +"Here is a link to our executive summary:\n"
					  );
			  $( "#popupTemplates" ).popup( "close" );
		}
);


$("#template6")
.bind(
		"click",
		function(event, ui) {
			  $("#msgtext1").val(
					  "Hi [Customer Name]\n"
					  +"It was great meeting you and I hope you are well.\n"
					  +"We spoke about [my company name] that does [what my company does].\n"
					  +"Could you please refer me to your colleague [colleague name], you mentioned he would\n" 
					  +"probably be interested.\n"
					  +"Here is a link to our executive summary:\n"
					  );
			  $( "#popupTemplates" ).popup( "close" );
		}
);

