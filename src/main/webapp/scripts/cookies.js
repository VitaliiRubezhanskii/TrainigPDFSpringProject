
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}


//   short time cookie - 1min. 
function setShortTimeCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() 
    		+ 60000 // 1 minute
    	//	(exdays*24*60*60*1000) //this is milliseconds
    		);
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
            setCookie("username", user, 365);
        }
    }
}




// initialize random cookie if needed.
var user = getCookie("myPersistentid");
if (user != "") {
	// alert("Welcome again " + user);
	// already there - don't do anything.
} else {
	// user = prompt("Please enter your name:", "");
	// if (user != "" && user != null) {
	// setCookie("username", user, 365);
	randomToken = Math.random().toString();
	setCookie("myPersistentid", randomToken, 365);
}


//now we can take it to global var.
myPersistentid = getCookie("myPersistentid");

