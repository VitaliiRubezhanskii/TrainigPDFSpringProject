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
      
      $.getJSON('../ManagementServlet',
          {action: "getFileList", salesmanEmail: $.cookie("SalesmanEmail")}, function(data) {
        if (0 < data.fileList.length) {
          $('#sp-nav-files__li a').append('<span class="fa arrow"></span>');
          $('#sp-nav-files__li a').after('<ul class="nav nav-second-level">');
          
          var firstFile = null;
          $.each(data.fileList, function(index, row) {
            $('#sp-nav-files__li ul').append('<li><a href="#" data-file-hash="' + row[0] + '">' + row[1] + '</a></li>');
            if (0 == index) {
              firstFile = row[0];
              //$('#sp-nav-files__li li').addClass("active");
            }
          });
          
          $('#sp-nav-files__li a[data-file-hash]').click(function() {
            //$(this).toggleClass('active');
            $('.sp-display--on').removeClass('sp-display--on').addClass('sp-display--off');
            $('#sp-file-dashboard').removeClass('sp-display--off').addClass('sp-display--on');
            
            $.getJSON('../ManagementServlet',
                {
                  action: "getFileData",
                  fileHash: $(this).attr('data-file-hash'),
                  salesmanEmail: $.cookie("SalesmanEmail")
                },
                function(data) {
                  if (typeof data.fileData[0] !== 'undefined' ) {
                    $('#sp-widget-total-views').text(data.fileData[0][0]);
                    $('#sp-widget-bounce-rate').text(parseFloat(data.fileData[0][1]).toFixed(2) + '%');
                  } else {
                    $('#sp-widget-total-views').text('-');
                    $('#sp-widget-bounce-rate').text('-');
                  }
                }
            );
            sp.graph.setFileLineChart(this);
          });
          $('#sp-nav-files__li a[data-file-hash="' + firstFile + '"]').click();
        }
        
        $('#side-menu').metisMenu();        
      });
      
      $(document).ready(function() {
        $('#send_email_to_customers').css('visibility', 'visible');
        $('#sp-salesman-full-name strong').text(sp.config.salesman.name);
        sp.table.setFilesData();
        new Clipboard('.sp-copy__button');
        
        $('#sp-file-links-data').click(function(){
          $('.sp-display--on').removeClass('sp-display--on').addClass('sp-display--off');
          $('#sp-file-links-data').removeClass('sp-display--off').addClass('sp-display--on');
        });
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
          data: {action: 'getFileLinksData', salesmanEmail: sp.config.salesman.email},
          dataSrc: 'fileLinksData'
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
  },
  
  graph: {
    
    /**
     * Set file line chart.
     */
    setFileLineChart: function(clickedElement) {
      $.getJSON('../ManagementServlet', {action: "getFileLineChart",
          fileHash: $(clickedElement).attr('data-file-hash'), salesmanEmail: $.cookie("SalesmanEmail")},
          function(data) {
            if (typeof data.fileLineChart[0] !== 'undefined' ) {
              
              var dataLabels = [];
              var dataLine1 = [];
              var dataLine2 = [];
              $.each(data.fileLineChart, function(index) {
                dataLabels.push(data.fileLineChart[index][3]);
                dataLine1.push(data.fileLineChart[index][0]);
                dataLine2.push(data.fileLineChart[index][2]);
              });
              
              var lineData = {
                  labels: dataLabels,
                  datasets: [
                     {
                         label: "Example dataset",
                         fillColor: "rgba(220,220,220,0.5)",
                         strokeColor: "rgba(220,220,220,1)",
                         pointColor: "rgba(220,220,220,1)",
                         pointStrokeColor: "#fff",
                         pointHighlightFill: "#fff",
                         pointHighlightStroke: "rgba(220,220,220,1)",
                         data: dataLine1
                     },
                     {
                         label: "Example dataset",
                         fillColor: "rgba(26,179,148,0.5)",
                         strokeColor: "rgba(26,179,148,0.7)",
                         pointColor: "rgba(26,179,148,1)",
                         pointStrokeColor: "#fff",
                         pointHighlightFill: "#fff",
                         pointHighlightStroke: "rgba(26,179,148,1)",
                         data: dataLine2
                     }
                 ]
              };
                
    
              var lineOptions = {
                  scaleShowGridLines: true,
                  scaleGridLineColor: "rgba(0,0,0,.05)",
                  scaleGridLineWidth: 1,
                  bezierCurve: true,
                  bezierCurveTension: 0.4,
                  pointDot: true,
                  pointDotRadius: 4,
                  pointDotStrokeWidth: 1,
                  pointHitDetectionRadius: 20,
                  datasetStroke: true,
                  datasetStrokeWidth: 2,
                  datasetFill: true,
                  responsive: true,
              }; 
            }
            
            var ctx = document.getElementById("lineChart").getContext("2d");
            var myNewChart = new Chart(ctx).Line(lineData, lineOptions);
          }
      );
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