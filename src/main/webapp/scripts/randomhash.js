

//
// *******************************************************************************************
// make random hash of 6 characters, for retrieving presentations, msgs, etc.
function randomHash() {
	var text = "";
	var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 6; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}
