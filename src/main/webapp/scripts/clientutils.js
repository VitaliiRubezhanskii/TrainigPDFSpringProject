//useful stuff for the javascript client

window.onerror = function(msg, url, linenumber) {
    alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    return true;
}

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