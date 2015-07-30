// *******************************************************************************************

// make checkbox item
function makeCb(id, text, classname) {
	//displays string twice. runs twice maybe.
	return '<input name="' + id + '"  class="jqmcheckbox ' + classname
			+ '" id="' + id + '" type="checkbox" value="' + text
			+ '"> <label for="' + id + '">' + text + '</label>';
	
	// not helpful. twice string problem is because it runs twice.
//	return '<input name="' + id + '"  class="jqmcheckbox ' + classname
//	+ '" id="' + id + '" type="checkbox"> <label for="' + id + '">' + text + '</label>';
}

function makeCustomerCb(id, text, classname, email) {
	return '<input name="' + id + '"  data-email="' + email
			+ '" class="jqmcheckbox ' + classname + '" id="' + id
			+ '" type="checkbox" value="' + text + '"> <label for="' + id
			+ '">' + text + '</label>';
}

// *******************************************************************************************
