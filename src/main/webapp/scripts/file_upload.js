

$('#uploadform').submit(function() {
	  showWaitMsg(); //show it for a few seconds. I don't hide it, 
	  // it will disappear after X sec, or when submission leads to a new page.
	  return true; //true means should do the submit action.
	});


$("#file").change(function(){ //on selecting file put name in presentation name box
    	//alert("file selected: " + $("#file").val());
    	var fullPath = $("#file").val();
    	var filename = fullPath.replace(/^.*[\\\/]/, ''); //clear path
    	filename = filename.substr(0, filename.lastIndexOf('.'));
    	$("#newpresname").val(filename);
});
