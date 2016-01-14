/* global DEFAULT_URL */
DEFAULT_URL = ''; 

var sp = sp || {};
sp.viewer = {
  linkHash: getParameterByName('f')
};

if ('' != sp.viewer.linkHash) {
  PDFViewerApplication.open(sp.config.appUrl + '/file/' + sp.viewer.linkHash);
}

$(document).prop('title', 'SlidePiper Viewer');


/**
 * The function returns the value of a URL query string parameter.
 * 
 * @param String name Query string key.
 * @see http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 * 
 * @return The URL query string parameter's value.
 */
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
