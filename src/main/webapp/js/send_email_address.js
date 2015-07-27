
//send address
function send_email_address()
{
			emailaddr =  $("#emailaddr").val();
			send_text_event("WEB", "SUBSCRIBE", emailaddr);
}
