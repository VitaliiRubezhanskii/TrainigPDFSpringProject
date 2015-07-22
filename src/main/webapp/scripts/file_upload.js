

$('#uploadform').submit(function() {
	  showWaitMsg(); //show it for a few seconds. I don't hide it, 
	  // it will disappear after X sec, or when submission leads to a new page.
	  return true; //true means should do the submit action.
	});
