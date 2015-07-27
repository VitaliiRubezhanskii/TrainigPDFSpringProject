
//send address
function send_email_address()
{
			emailaddr =  $("#emailaddr").val();
			console.log("Email address is: " + emailaddr);
			send_text_event("WEB", "SUBSCRIBE", emailaddr);			
			alert("Thanks for subscribing!");
}
