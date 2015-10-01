

// templates 1,2,3 for now.
$("#template1")
		.bind(
				"click",
				function(event, ui) {
					  $("#msgtext1").val("Hello, I'm template 1!");
					  $( "#popupTemplates" ).popup( "close" );
				}
	    );

$("#template2")
.bind(
		"click",
		function(event, ui) {
			  $("#msgtext1").val("Hello, I'm template 2!.....like it?");
			  $( "#popupTemplates" ).popup( "close" );
		}
);


$("#template3")
.bind(
		"click",
		function(event, ui) {
			  $("#msgtext1").val("Hello, I'm template 3!  .... alright");
			  $( "#popupTemplates" ).popup( "close" );
		}
);
