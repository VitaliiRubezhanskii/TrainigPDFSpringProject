/* Global Variables */
var sp = sp || {};
sp = {
  config: {},  
  
  init: (function() {
    var path = window.location.pathname.split( '/' ).splice(-2).join('/');
    var configUrl = 'config';
    if ('dashboard/index.html' == path || 'dashboard/' == path) {
      configUrl = '../' + configUrl;  
    }
    $.getJSON(configUrl, {salesmanEmail: $.cookie("SalesmanEmail")}, function(data) {
      sp.config = data;
      
      $(document).ready(function() {
        $('#send_email_to_customers').css('visibility', 'visible');
        $('#sp-salesman-full-name strong').text(sp.config.salesman.name);
        sp.table.setFilesData();
        new Clipboard('.sp-copy__button');
      });
    });
  })(),
  
  email: {
    lastFocusedSubjectOrBody: {},
    
    
    /**
     * Get the last focused subject or body email element.
     */
    getLastFocusedSubjectOrBody: function() {
      return this.lastFocusedSubjectOrBody;
    },
    
    
    /**
     * @see http://stackoverflow.com/questions/21942977/how-do-i-pass-login-hint-to-gapi-auth-authorize
     */
    gmailAuthorization: function(immediate) {
      var config = {
        authuser: -1,
        client_id: sp.config.google.clientId,
        immediate: immediate,
        login_hint: this.salesmanEmail,
        scope: sp.config.google.scopes,
      };
        
      gapi.auth.authorize(config, function() {
        var token = gapi.auth.getToken();
        if (null == token) {
          sp.email.gmailAuthorization(false);
        } else {
          console.log('SP: Gmail login complete.');
          sp.email.sendEmail(token.access_token);
        }
      });
    },
    
    
    /**
     * Send an email.
     * 
     * @param Object OAuth token.
     */
    sendEmail: function(accessToken) {
      var data = {
        action: "sendEmail",
        data: {
          accessToken: accessToken,
          customerEmailArray: sp.email.customerEmailArray,
          emailBody: sp.email.emailBody,
          emailSubject: sp.email.emailSubject,
          salesmanEmail: sp.email.salesmanEmail,
          salesmanEmailClient: sp.email.salesmanEmailClient
        }
      };
          
      $.post("ManagementServlet", JSON.stringify(data), this.sendEmailCallback, "json");
    },
    
    
    /**
     * Send an email result callback function.
     */
    // TODO: manage textStatus and jqXHR.
    sendEmailCallback: function(data, textStatus, jqXHR) {
      if (true == data.isApi) {
        alert("Successfully sent " + data.emailSent + " email(s) out of " + sp.email.customerEmailArray.length);
      } else {
        location.href =
            'mailto:' + data.customerEmail
            + '?subject=' + encodeURIComponent(data.emailSubject)
            + '&body='  + encodeURIComponent(data.emailBody);
      }
    }
  },
  
  table: {
    
    /**
     * 
     */
    setFilesData: function() {
      table = $('#sp-files-data__table').DataTable({
        ajax: {
          url: '../ManagementServlet',
          data: {action: 'getFilesData', salesmanEmail: sp.config.salesman.email},
          dataSrc: 'filesData'
        },      
        buttons: [
          {
            extend: 'copy',
            exportOptions: {
              format: {
                body: function(data, columnIndex, rowIndex) {
                  if (1 == columnIndex) {  
                    return data.match(/^(.+?)<button/).pop();
                  } else {
                    return data;
                  }
                }
              }
            }
          },
          {
            extend: 'csv',
            title: 'files-data',
            exportOptions: {
              format: {
                body: function(data, columnIndex, rowIndex) {
                  if (1 == columnIndex) {  
                    return data.match(/^(.+?)<button/).pop();
                  } else {
                    return data;
                  }
                }
              }
            }
          },
          {
            extend: 'excel',
            title: 'files-data',
            exportOptions: {
              format: {
                body: function(data, columnIndex, rowIndex) {
                  if (1 == columnIndex) {  
                    return data.match(/^(.+?)<button/).pop();
                  } else {
                    return data;
                  }
                }
              }
            }
          },
          {
            extend: 'pdf',
            title: 'files-data',
            exportOptions: {
              format: {
                body: function(data, columnIndex, rowIndex) {
                  if (1 == columnIndex) {  
                    return data.match(/^(.+?)<button/).pop();
                  } else {
                    return data;
                  }
                }
              }
            }
          },
          {
            extend: 'print',
            exportOptions: {
              format: {
                body: function(data, columnIndex, rowIndex) {
                  if (1 == columnIndex) {  
                    return data.match(/^(.+?)<button/).pop();
                  } else {
                    return data;
                  }
                }
              }
            },
            customize: function (win){
              $(win.document.body).addClass('white-bg');
              $(win.document.body).css('font-size', '10px');
              $(win.document.body).find('table')
                .addClass('compact')
                .css('font-size', 'inherit');
            }
          }
        ],
        columnDefs: [
          {
            'render': function (data, type, row) {
              return sp.config.viewerUrlWithoutFileLink + data
                  + '<button class="btn btn-white btn-xs sp-copy__button" data-clipboard-text="'
                  + sp.config.viewerUrlWithoutFileLink + data + '">'
                  + '<i class="fa fa-copy"></i> Copy</button>';
          },
            'sClass': 'sp-file-link__td',
            'targets': 1
          },
          {
            'render': function (data, type, row) {
              return (parseFloat(data) * 100).toFixed(2) + '%';
            },
            'targets': 3
          },
          {
            'render': function (data, type, row) {
              return parseFloat(data).toFixed(2);
             },
             'targets': 4
          }
        ],
        dom: '<"html5buttons"B>lTfgitp'
      });
    }
  }
};


$(document).ready(function() {
 
	/**
	 * Add a salesman to the DB.
	 */
	$('#sp-signup').submit(function(event) {
		
		var formData = {action: 'setSalesman'};
		 $('input:not([type=submit]), select').each(function(index){
			 formData[$(this).attr('id')] = this.value;
		 });
		
		$.ajax({
			async: false,
			type: 'POST',
			url: 'ManagementServlet',
			contentType : 'application/json; charset=utf-8',
			dataType: 'json',
			data: JSON.stringify(formData),
		}).done(function(data) {
			switch (data.statusCode) {
				case 200:
					alert('The user was added successfuly.');
					$('input:not([type=submit])').val('');
					$('select').val('gmail');
					break;

				case 100:
					alert('The user ' + formData.email + ' already exist.');
					break;
					
				case 101:
					alert('The user was not added. Magic inccorect.');
					break;
					
				default:
					alert('The user was not added. Error code: ' + data.statusCode + ".");
			}
		}).fail(function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus + ": " + errorThrown);
		});
		
		event.preventDefault();
    });
	
	
	/**
   *  Store the last focused subject or body email element.
   */
	$('#subject1, #msgtext1').focus(function() {
	  sp.email.lastFocusedSubjectOrBody = $(this);
	});
	
	
	/**
	 * Add a file place holder to the email subject or body based upon
   * the focused element, and caret position or selected text.
	 */
	$(document).on('click', 'label.ui-btn:not([for^=cust])', function() {  
	  var fileHash = $(this).attr('for').substr(0, $(this).attr('for').length - 2);
	  var focusedElement = sp.email.getLastFocusedSubjectOrBody();
	  
      if (! $.isEmptyObject(focusedElement)) {
        var caretStart = focusedElement[0].selectionStart;
        var caretEnd = focusedElement[0].selectionEnd;
        var focusedElementText = focusedElement.val();
        var textToAdd = sp.config.email.mergeTagStartCharacter
            + sp.config.email.mergeTagFile + sp.config.email.mergeTagDelimiter + fileHash
            + sp.config.email.mergeTagEndCharacter + ' ';
        
        focusedElement.val(focusedElementText.substring(0, caretStart) + textToAdd
            + focusedElementText.substring(caretEnd));
        focusedElement[0].setSelectionRange(caretStart + textToAdd.length, caretStart
            + textToAdd.length);
        focusedElement.focus();
      }
	});
	
	
	/**
	 * List the files to be uploaded.
	 * 
	 * @see http://stackoverflow.com/questions/13652955/get-all-values-of-multiple-file-select-with-jquery
	 */
	$('form[id="uploadform"] input[id="file"]').change(function() {
	  var filesNames = "";
	  for (var i = 0; i < $(this)[0].files.length; i++) {
	    filesNames += $(this)[0].files[i].name + "\n";
	  }
	  $("#newpresname").val(filesNames);
	});
});