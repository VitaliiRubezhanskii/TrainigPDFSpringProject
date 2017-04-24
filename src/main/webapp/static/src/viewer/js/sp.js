// --- Start cookies.js
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
    		+ 20000 //20sec ls
    		
    		// 1 minute
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

// --- Start clientutils.js
//useful stuff for the javascript client

// for internet explorer - shut off console errors
// but we'd still have no console messages.
if (typeof console == "undefined") {
    this.console = { log: function (msg)
    {
        //alert(msg);
    }
    };
}

// Attaching our method to the String Object
String.prototype.cleanup = function() {
    return this.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-");
}
//# Using our new .cleanup() method
//var clean = "Hello World".cleanup(); // hello-world


/* This code section hid the underlying reason for execution failures.
 window.onerror = function(msg, url, linenumber) {
 //alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
 errmsg = 'Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber + "\n";

 var err = new Error();
 errmsg += ("Stack trace: \n" + err.stack);

 if(typeof(swal) == "function")
 {
 swal("Error", errmsg, "error");
 }
 else
 {
 alert("Error: " + errmsg);
 }
 return true;
 };
 */

// placeholder for current page, will change when changepage is called.
// This way I can know if I should update things on page
currentpage = "";

function changepage(newpage)
{
    //if (currentpage != newpage) // if need to change page
    // do it anyway. otherwise makes problems.
    {
        //apply random transition.
        transitionNum = Math.floor(Math.random() * 9);
        transitionText="slide";
        if (transitionNum==1) transitionText ="slideup";
        if (transitionNum==2) transitionText ="slidedown";
        if (transitionNum==3) transitionText ="pop";
        if (transitionNum==4) transitionText ="fade";
        if (transitionNum==5) transitionText ="flip";
        if (transitionNum==6) transitionText ="turn";
        if (transitionNum==7) transitionText ="flow";
        if (transitionNum==8) transitionText ="slidefade";
        if (transitionNum==9) transitionText ="flip";

        //$.mobile.changePage( $(newpage), { transition: transitionText, changeHash: false} );
        //
        // this one is up-to date, not deprecated.
        //$.mobile.pageContainer.pagecontainer("change", newpage, { transition: transitionText, changeHash: false});
        $.mobile.pageContainer.pagecontainer("change", newpage, { transition: transitionText});
        //changeHash MUST BE FALSE!! default is true. I don't want new entry.
        // it allows user to go back to pages. I don't want.
        // FIX: Removing changeHash. otherwise popups return to login page.

        lastpage = currentpage;
        currentpage = newpage;
    }

}

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}


//get value of parameter key from the url - works well.
function getQuerystring(key, default_){
    if (default_==null)
        default_="";
    key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if(qs == null)
        return default_;
    else
        return qs[1];
}


// get value of parameter val from the url
function parse(val) {
    var result = "Not found",
        tmp = [];
    location.search
    //.replace ( "?", "" )
    // this is better, there might be a question mark inside
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function isFunction(possibleFunction) {
    return typeof(possibleFunction) === typeof(Function);
}

window.mobilecheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

// --- Start timezone.js
// get the offset in min. used everywhere when I call ajax to
// send events to server.
tz_offset_min = new Date().getTimezoneOffset();

//alert("tz 	offset is " + tz_offset_min);
