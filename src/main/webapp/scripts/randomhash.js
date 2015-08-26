
HASH_LENGTH = 6;

// long hash
//HASH_LENGTH = 10;


//
// *******************************************************************************************
// make random hash of HASH_LENGTH characters, for retrieving presentations, msgs, etc.
function randomHash() {
	var text = "";
	//var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
	
	var possible = "abcdefghijklmnopqrstuvwxyz"; //numbers make a problem in the link.

	for (var i = 0; i < HASH_LENGTH; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

