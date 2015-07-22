// *******************************************************************************************

// make checkbox item
function makeCb(id, text, classname) {
	return '<input name="' + id + '"  class="jqmcheckbox ' + classname
			+ '" id="' + id + '" type="checkbox" value="' + text
			+ '"> <label for="' + id + '">' + text + '</label>';
}

function makeCustomerCb(id, text, classname, email) {
	return '<input name="' + id + '"  data-email="' + email
			+ '" class="jqmcheckbox ' + classname + '" id="' + id
			+ '" type="checkbox" value="' + text + '"> <label for="' + id
			+ '">' + text + '</label>';
}

// *******************************************************************************************
