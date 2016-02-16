/* Global Variables */
var sp = sp || {};
sp = {
  
  init: (function(fileHash) {
    var path = window.location.pathname.split( '/' ).splice(-2).join('/');
    var configUrl = 'config';
    var isDashboard = false;
    if ('dashboard/index.html' == path || 'dashboard/' == path) {
      configUrl = '../' + configUrl;
      isDashboard = true;
    }
    
    $.getJSON(configUrl, {salesmanEmail: $.cookie('SalesmanEmail')}, function(data) {
      sp.config = data;
      
      if (isDashboard) {
        if (typeof $.cookie('SalesmanEmail') === 'undefined') {
          window.location.href = sp.config.appUrl;
        }
        
        /**
         * Set the file dashboard.
         */
        function setFileDashboard() {
          // Set fileHash.
          var fileHash = $(this).children().attr('data-file-hash');
          if (typeof fileHash === 'undefined' && typeof sp.filesTable !== 'undefined') {
            fileHash = sp.filesTable.row($(this).parent()).data()[0];
          }
          
          $.getJSON(
              '../ManagementServlet',
              {action: 'getFilesData', salesmanEmail: sp.config.salesman.email},
              function(data) {
            var filesData = data.filesData;
          
            if (0 < filesData.length) {
              // Build side menu.
              $('#sp-nav-files__li')
                  .empty()
                  .append(
                      '<a href="#" aria-expanded="true"><i class="fa fa-file"></i> '
                      + '<span class="nav-label">Files</span></a>'
                      + '<span class="fa arrow"></span>'
                      + '<ul class="nav nav-second-level">'
                  );
              
              var files = [];
              for (var i = 0; i < filesData.length; i++) {
                $('#sp-nav-files__li ul').append('<li><a href="#" data-file-hash="'
                    + filesData[i][0] + '">' + filesData[i][1] + '</a></li>');
                
                if (typeof fileHash === 'undefined' || filesData[i][0] == fileHash) {
                  fileHash = filesData[i][0];
                  files[fileHash] = filesData[i];
                  
                  // A workaround for metisMenu dysfunctionality.
                  $('#sp-nav-files__li li:has(a[data-file-hash="' + fileHash + '"])')
                      .addClass("active");
                }
              }

              // Build dashboard.
              sp.metric.fileMetrics(files[fileHash]);
              sp.graph.getFileLineChart(fileHash);
              sp.graph.getFileBarChart(fileHash);
              sp.table.filesTable(filesData);
              
              // Move to the top of the page.
              $('html, body').animate({scrollTop: 0}, 'fast');
            }
          });
        }
            
        // Run once.
        setFileDashboard();
        
        // .click() cannot be used since '#sp-nav-files__li li' haven't been created yet.
        $(document).on('click', '#sp-nav-files__li li, td.sp-file-hash', setFileDashboard);
      }
    });
  
      
    $(document).ready(function() {
      $('#send_email_to_customers').css('visibility', 'visible');
      
      $('#side-menu').metisMenu();
      $('#sp-salesman-full-name strong').text(sp.config.salesman.name);
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
        action: 'sendEmail',
        data: {
          accessToken: accessToken,
          customerEmailArray: sp.email.customerEmailArray,
          emailBody: sp.email.emailBody,
          emailSubject: sp.email.emailSubject,
          salesmanEmail: sp.email.salesmanEmail,
          salesmanEmailClient: sp.email.salesmanEmailClient
        }
      };
          
      $.post('ManagementServlet', JSON.stringify(data), this.sendEmailCallback, 'json');
    },
    
    
    /**
     * Send an email result callback function.
     */
    // TODO: manage textStatus and jqXHR.
    sendEmailCallback: function(data, textStatus, jqXHR) {
      if (true == data.isApi) {
        alert('Successfully sent ' + data.emailSent + ' email(s) out of ' + sp.email.customerEmailArray.length);
      } else {
        location.href =
            'mailto:' + data.customerEmail
            + '?subject=' + encodeURIComponent(data.emailSubject)
            + '&body='  + encodeURIComponent(data.emailBody);
      }
    }
  },
  
  metric: {
    
    /**
     * Display the selected file data metrics. 
     */
    fileMetrics: function(fileData) {
      $('#sp-widget-total-views').text(fileData[3]);
      if (null != fileData[4]) {
        $('#sp-widget-bounce-rate').text(parseFloat(fileData[4] * 100).toFixed(2) + '%');
      } else {
        $('#sp-widget-bounce-rate').text('N/A');
      }
    }
  },
  
  table: {
    
    /**
     * Place the files data into the DataTables plugin.
     * 
     * @param object filesData A 2d array consisting of files data.
     */
    filesTable: function(filesData) {
      if ($.fn.dataTable.isDataTable('#sp-files-data__table')) {
        sp.filesTable = $('#sp-files-data__table').DataTable()
            .clear()
            .rows.add(filesData)
            .draw();
      } else {
        var fileLinkColumnIndex = 2;
        sp.filesTable = $('#sp-files-data__table').DataTable({
          data: filesData,
          buttons: [
            {
              extend: 'copy',
              exportOptions: {
                format: {
                  body: function(data, columnIndex, rowIndex) {
                    if (fileLinkColumnIndex == columnIndex) {  
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
                    if (fileLinkColumnIndex == columnIndex) {  
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
                    if (fileLinkColumnIndex == columnIndex) {  
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
                    if (fileLinkColumnIndex == columnIndex) {  
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
                    if (fileLinkColumnIndex == columnIndex) {  
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
                visible: false,
                targets: 0
              },
              {
                className: 'sp-file-hash',
                targets: 1
              },
              {
                render: function (data, type, row) {
                  return sp.config.viewerUrlWithoutFileLink + data
                      + '<button class="btn btn-white btn-xs sp-copy__button" data-clipboard-text="'
                      + sp.config.viewerUrlWithoutFileLink + data + '">'
                      + '<i class="fa fa-copy"></i> Copy</button>';
                },
                className: 'sp-file-link__td',
                targets: 2
              },
              {
                render: function (data, type, row) {
                  if (null != data) {
                    return (parseFloat(data) * 100).toFixed(2) + '%';
                  } else {
                    return 'N/A';
                  }
                },
                targets: 4
              },
              {
                defaultContent: '',
                targets: 5
              }
          ],
          dom: '<"html5buttons"B>lTfgitp',
          order: [[ 1, 'asc' ]]
        });
      
        new Clipboard('.sp-copy__button');
      }
    }
  },
  
  graph: {
    
    /**
     * Get the file bar chart.
     */
    getFileBarChart: function(fileHash) {
      $.getJSON('../ManagementServlet', {action: 'getFileBarChart',
          fileHash: fileHash, salesmanEmail: sp.config.salesman.email}, function(data) {
          
        if (typeof sp.graph.fileBarChart !== 'undefined') {
          sp.graph.fileBarChart.destroy();
        }
      
        var barData = {
            labels: [],
            datasets: [
                {
                    label: "My Second dataset",
                    fillColor: "rgba(26,179,148,0.5)",
                    strokeColor: "rgba(26,179,148,0.8)",
                    highlightFill: "rgba(26,179,148,0.75)",
                    highlightStroke: "rgba(26,179,148,1)",
                    data: []
                }
            ]
        };
  
        var barOptions = {
            scaleBeginAtZero: true,
            scaleShowGridLines: true,
            scaleGridLineColor: "rgba(0,0,0,.05)",
            scaleGridLineWidth: 1,
            barShowStroke: true,
            barStrokeWidth: 2,
            barValueSpacing: 15,
            barDatasetSpacing: 1,
            responsive: true,
            tooltipTemplate: "<%if (label){%><%='Page ' + label%>: <%}%><%= value + ' sec.' %>"
        };
        
        if (typeof data.fileBarChart[0] !== 'undefined' ) {
          $.each(data.fileBarChart, function(index, value) {
            barData.labels.push(parseInt(value[0]));
            barData.datasets[0].data.push(parseFloat(value[1]).toFixed(1));
          });
        }
        
        
        var ctx = $('#barChart')[0].getContext('2d');
        sp.graph.fileBarChart = new Chart(ctx).Bar(barData, barOptions);
      });
    },
    
    
    /**
     * Get the file line chart.
     */
    getFileLineChart: function(fileHash) {
      $.getJSON('../ManagementServlet', {action: 'getFileLineChart',
          fileHash: fileHash, salesmanEmail: sp.config.salesman.email}, function(data) {
            
        if (typeof sp.graph.fileLineChart !== 'undefined') {
          sp.graph.fileLineChart.destroy();
        }
        
        var lineData = {
            labels: [],
            datasets: [
                {
                    label: "Total views",
                    fillColor: "rgba(220,220,220,0.5)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: []
                },
                {
                    label: "Actual views",
                    fillColor: "rgba(26,179,148,0.5)",
                    strokeColor: "rgba(26,179,148,0.7)",
                    pointColor: "rgba(26,179,148,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(26,179,148,1)",
                    data: []
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
            multiTooltipTemplate: "<%= datasetLabel + ': ' + value %>"
        };
          
        if (typeof data.fileLineChart[0] !== 'undefined' ) {
          $.each(data.fileLineChart, function(index, value) {
            dateParts = value[0].split('-');
            lineData.labels.push(dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0]);
            lineData.datasets[0].data.push(parseInt(value[1]));
            lineData.datasets[1].data.push(parseInt(value[2]));
          });
        }
          
        var ctx = $('#lineChart')[0].getContext('2d');
        sp.graph.fileLineChart = new Chart(ctx).Line(lineData, lineOptions);
      });
    }
    
  // End graph.
  }
  
// End sp.
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
					alert('The user was not added. Error code: ' + data.statusCode + '.');
			}
		}).fail(function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus + ': ' + errorThrown);
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
	  var filesNames = '';
	  for (var i = 0; i < $(this)[0].files.length; i++) {
	    filesNames += $(this)[0].files[i].name + '\n';
	  }
	  $('#newpresname').val(filesNames);
	});
});