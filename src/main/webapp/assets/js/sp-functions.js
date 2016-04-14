/* Global Variables */
var sp = sp || {};
sp = {
  
  init: (function(fileHash) {
    var path = window.location.pathname.split( '/' ).splice(-1, 1);
    var isDashboard = false;
    if ('dashboard.html' == path) {
      isDashboard = true;
    }
    
    $.getJSON('config', {salesmanEmail: Cookies.get('SalesmanEmail')}, function(data) {
      sp.config = data;
      
      if (isDashboard) {
        if (typeof Cookies.get('SalesmanEmail') === 'undefined') {
          window.location.href = sp.config.appUrl;
        }
        
        /**
         * Set the file dashboard.
         */
        function setFileDashboard() {
          // Set fileHash.
          var fileHash = $(this).children().attr('data-file-hash');
          if (typeof fileHash === 'undefined' && typeof sp.table.filesData !== 'undefined') {
            fileHash = sp.table.filesData.row($(this).parent()).data()[0];
          }
          
          $.getJSON(
              'ManagementServlet',
              {action: 'getFilesData', salesmanEmail: sp.config.salesman.email},
              function(data) {
            var filesData = data.filesData;
          
            if (0 < filesData.length) {
              // Build side menu.
              $('#sp-nav-files__li')
                  .empty()
                  .append(
                      '<a href="#" aria-expanded="true"><i class="fa fa-file"></i> '
                      + '<span class="nav-label">Marketing Analytics</span></a>'
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
              sp.metric.getFileMetrics(files[fileHash]);
              sp.chart.getFileLine(fileHash);
              sp.chart.getFileBar(fileHash);
              sp.chart.getFileVisitorsMap(fileHash);
              sp.chart.getFilePerformance(fileHash);
              sp.table.getFilesTable(filesData);
              
              // Move to the top of the page.
              $('html, body').animate({scrollTop: 0}, 'fast');
            }
          });
        }
            
        // Run once.
        setFileDashboard();
        
        // .click() cannot be used since '#sp-nav-files__li li' haven't been created yet.
        $(document).on('click', '#sp-nav-files__li li, td.sp-file-hash', setFileDashboard);
        
        $(document).ready(function() {
          $('#sp-salesman-full-name strong').text(sp.config.salesman.name);
          
          $('.sp-nav-section').click(function() {
            routingEmulator($(this).attr('data-dashboard'));
          });
          
          $('.sp-logout').click(function() {
            Cookies.remove('SalesmanEmail');
            location.href = sp.config.appUrl;
          });
          
          /* Files & Customers management */
          $('.sp-files-customers-mgmt-tab').click(function() {
            if ('sp-files-mgmt-tab' == $(this)[0].id) {
              $('#sp-customers-mgmt-top-part').hide();
              $('#sp-files-mgmt-top-part').show();
            } else if ('sp-customers-mgmt-tab' == $(this)[0].id) {
              $('#sp-files-mgmt-top-part').hide();
              $('#sp-customers-mgmt-top-part').show();
            }
          });
          
          $('input[type=file]').on('change', function() {
            sp.file.files = event.target.files;
          });
          
          // Upload file.
          $('#sp-upload-files__button').click(function(event) {
            sp.file.uploadFiles(event);
            $('input[type="file"]').val(null);
          });
          
          // Update file.
          $(document).on('click', '.sp-file-update', function() {
            sp.file.fileHash = $(this).attr('data-file-hash');
          });
          
          $('#sp-update-file__button').click(function(event) {
            sp.file.updateFile(event, sp.file.fileHash);
            $('input[type="file"]').val(null);
          });
          
          // Delete file.
          $(document).on('click', '.sp-file-delete', function() {
            if (true == confirm('Are you sure you want to delete this file?')) {
              sp.file.fileHash = $(this).attr('data-file-hash');
              sp.file.deleteFile(sp.file.fileHash);
            }
          });
          
          /* Customers mgmt. */
          
          // Upload customers.
          $('#sp-upload-customers__button').click(function(event) {
            sp.file.uploadCustomers(event);
            $('input[type="file"]').val(null);
          });
          
          $('#sp-download-template__button').click(function() {
            location.href = 'assets/files/customers_template.csv';
          });
          
          // Add or update a customer.
          $(document).on('click', '.sp-add-update-customer', function() {
            if ('add' == $(this).attr('data-add-update')) {
              $('#sp-modal-add-update-customer .modal-title').text('Add Customer');
              $('#sp-modal-add-update-customer .modal-sub-title')
                  .text('Fill the fields below and then click on add a customer.');
              $('#sp-modal-add-update-customer__button').text('Add Customer');
              $('#sp-modal-add-update-customer input[type=submit]').val('Add Customer');
              $('#sp-modal-add-update-customer input#add-update').val('add');
              
              $('#sp-modal-add-update-customer input:not(#add-update, [type=submit])').val('');
              $('#sp-modal-add-update-customer input[name="customerEmail"]')
                  .prop('readonly', false);
              
            } else {
              $('#sp-modal-add-update-customer .modal-title').text('Update Customer');
              $('#sp-modal-add-update-customer .modal-sub-title')
                  .text('Update the fields below and then click on update a customer.');
              $('#sp-modal-add-update-customer__button').text('Update Customer');
              $('#sp-modal-add-update-customer input[type=submit]').val('Update Customer');
              $('#sp-modal-add-update-customer input#add-update').val('update');
              
              $('#sp-modal-add-update-customer input[name="customerFirstName"]').
                  val($('#sp-customers-management tr[data-customer-email="'
                      + $(this).attr('data-customer-email') + '"] #sp-customer-first-name__td').text());
              
              $('#sp-modal-add-update-customer input[name="customerLastName"]').
                  val($('#sp-customers-management tr[data-customer-email="'
                      + $(this).attr('data-customer-email') + '"] #sp-customer-last-name__td').text());
              
              $('#sp-modal-add-update-customer input[name="customerCompany"]').
                  val($('#sp-customers-management tr[data-customer-email="'
                      + $(this).attr('data-customer-email') + '"] #sp-customer-company__td').text());
              
              $('#sp-modal-add-update-customer input[name="customerEmail"]')
                  .val($(this).attr('data-customer-email'))
                  .prop('readonly', true);
            }
          });
          
          $('#sp-add-update-customer__form').submit(function(event) {
            sp.file.addUpdateCustomer(event);
          });
          
          // Delete a customer.
          $(document).on('click', '.sp-customer-delete', function() {
            if (true == confirm('Are you sure you want to delete this customer?')) {
              sp.file.deleteCustomer($(this).attr('data-customer-email'));
            }
          });
          
          
          //$('#side-menu').metisMenu();
          
          /**
           * The function controls the display of the current dashboard view. 
           */
          function routingEmulator(topSection) {
            $('.sp-dashboard').hide();
            $('.sp-nav-section').removeClass('active');
            $('[data-dashboard="' + topSection + '"]').addClass('active');
            $('#' + topSection).show();
            
            switch(topSection) {
              case 'sp-file-upload':
                $('#sp-nav-files__li ul').hide();
                sp.file.getFilesList();
                sp.file.getCustomersList();
                break;
                
              case 'sp-file-dashboard':
                sp.table.filesData = undefined;
                setFileDashboard();
                break;
            }
          }
          
        });
      }
    });
  })(),
  
  file: {
    
    fileHash: null,
    files: [],
    
    getFilesList: function() {
      $.getJSON(
          'ManagementServlet',
          {action: 'getFilesList', salesmanEmail: sp.config.salesman.email},
          function(data) {
            $('#sp-files-management tbody').empty();
            
            $.each(data.filesList, function(index, row) {
              $('#sp-files-management tbody').append(
                  '<tr>'
                    + '<td class="col-lg-2"><i class="fa fa-clock-o sp-file-clock" data-toggle="tooltip" data-placement="right" title="Date file was added or updated"></i> ' + row[2] + '</td>'
                    + '<td class="col-lg-3 sp-file-mgmt-file-name" data-file-hash="' + row[0] + '">' + row[1] + '</td>'
                    + '<td class="col-lg-7"><a href="#"><span class="label label-primary sp-file-update" data-toggle="modal" data-target="#sp-modal-update-file" data-file-hash="' + row[0] + '">Update</span></a><a href="#"><span class="label label-danger sp-file-delete" data-file-hash="' + row[0] + '">Delete</span></a></td>'
                + '</tr>'
              );
            });
            
            $('#sp-files-management tbody').tooltip({
              selector: "[data-toggle=tooltip]"
            });
          });
    },
    
    uploadFiles: function(event) {
      event.stopPropagation();
      event.preventDefault();

      $('#sp-file-upload__form').hide();
      $('.sk-spinner').show();
      $('#sp-upload-files__button').removeClass('btn-primary').addClass('btn-default').text('Uploading...');
      
      var data = new FormData();
      $.each(sp.file.files, function(key, value) {
        data.append(key, value);
      });
      data.append('action', 'uploadFiles');
      data.append('salesmanEmail', Cookies.get('SalesmanEmail'));
        
      $.ajax({
        url: 'upload-file',
        type: 'POST',
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function(data, textStatus, jqXHR) {
          if(typeof data.error === 'undefined') {
            sp.file.getFilesList();
            $('button[data-dismiss="modal"]').click();
            
            sp.file.files = [];
            $('#sp-upload-files__button').removeClass('btn-default').addClass('btn-primary').text('Update Files');
            $('.sk-spinner').hide();
            $('.file__input').show();
          }
        }
      });
    },
    
    updateFile: function(event, fileHash) {
      event.stopPropagation();
      event.preventDefault();

      $('#sp-file-update__form').hide();
      $('.sk-spinner').show();
      $('#sp-upload-files__button').removeClass('btn-primary').addClass('btn-default').text('Uploading...');
      
      var data = new FormData();
      data.append('updatedfile', sp.file.files[0]);
      data.append('action', 'updateFile');
      data.append('updateFileHash', fileHash);
      data.append('salesmanEmail', Cookies.get('SalesmanEmail'));
      
      $.ajax({
        url: 'upload-file',
        type: 'POST',
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function(data, textStatus, jqXHR) {
          if(typeof data.error === 'undefined') {
            sp.file.getFilesList();
            $('button[data-dismiss="modal"]').click();
            
            sp.file.files = [];
            $('#sp-upload-files__button').removeClass('btn-default').addClass('btn-primary').text('Upload Files');
            $('.sk-spinner').hide();
            $('.file__input').show();
          }
        }
      });
    },
    
    deleteFile: function(fileHash) {
      $.post('ManagementServlet', JSON.stringify({
        action: 'deletePresentation',
        salesman_email: Cookies.get('SalesmanEmail'),
        presentation: fileHash
      }))
      .done(function() {
        sp.file.getFilesList();
      });
    },
    
    
    /* Customers mgmt. */
    
    getCustomersList: function() {
      $.getJSON(
          'ManagementServlet',
          {action: 'getCustomersList', salesmanEmail: sp.config.salesman.email},
          function(data) {
            $('#sp-customers-management tbody').empty();
            
            $.each(data.customersList, function(index, row) {
              $('#sp-customers-management tbody').append(
                  '<tr data-customer-email="' + row[3] + '">'
                    + '<td><span id="sp-customer-first-name__td">' + row[0] + '</span> <span id="sp-customer-last-name__td">' + row[1] + '</span></td>' 
                    + '<td id="sp-customer-company__td">' + row[2] + '</td>'
                    + '<td class="contact-type"><i class="fa fa-envelope"> </i></td>'
                    + '<td>' + row[3] + '</td>'
                    + '<td><a href="#"><span class="label label-primary sp-add-update-customer sp-customer-update" data-add-update="update" data-toggle="modal" data-target="#sp-modal-add-update-customer" data-customer-email="' + row[3] + '">Update</span></a><a href="#"><span class="label label-danger sp-customer-delete" data-customer-email="' + row[3] + '">Delete</span></a></td>'
                + '</tr>'
              );
            });
          });
    },
    
    uploadCustomers: function(event) {
      event.stopPropagation();
      event.preventDefault();

      $('#sp-customers-upload__form').hide();
      $('.sk-spinner').show();
      $('#sp-upload-customers__button').removeClass('btn-primary').addClass('btn-default').text('Uploading...');
      
      var data = new FormData();
      data.append('filecsv', sp.file.files[0]);
      data.append('salesman_email_for_csv', Cookies.get('SalesmanEmail'));
        
      $.ajax({
        url: 'uploadCustomers',
        type: 'POST',
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function(data, textStatus, jqXHR) {
          if(typeof data.error === 'undefined') {
            if (-1 == data.flag) {
              alert('The CSV file first line titles are corrupted. Please use the titles located in the template file and in the order they appear there');
            } else if (0 < data.flag) {
              alert(data.flag + ' records were not inserted due to missing or corrupt data.');
            }
            
            sp.file.getCustomersList();
            $('button[data-dismiss="modal"]').click();
            
            sp.file.files = [];
            $('#sp-upload-customers__button').removeClass('btn-default').addClass('btn-primary').text('Upload Customers');
            $('.sk-spinner').hide();
            $('#sp-customers-upload__form').show();
          }
        }
      });
    },
    
    addUpdateCustomer: function(event) {
      event.preventDefault();
      
      $('#sp-add-update-customer__form').hide();
      $('.sk-spinner').show();
      $('#sp-modal-add-update-customer__button').removeClass('btn-primary').addClass('btn-default');
      
      var subAction = null;
      if ('add' == $('#sp-modal-add-update-customer input#add-update').val()) {
        $('#sp-modal-add-update-customer__button').text('Adding...');
        subAction = 'add';
      } else {
        $('#sp-modal-add-update-customer__button').text('Updating...');
        subAction = 'update';
      }
      
      var data = {
        'salesmanEmail': Cookies.get('SalesmanEmail'),
        'action': 'addNewCustomer',
        'subAction': subAction 
      };
      $('#sp-add-update-customer__form input:not([type="hidden"])').each(function() {
        data[$(this).attr('name')] = $(this).val();
      });
      
      $.ajax({
        url: 'ManagementServlet',
        type: 'POST',
        data: JSON.stringify(data),
        cache: false,
        processData: false,
        contentType : "application/json; charset=utf-8",
        success: function(data, textStatus, jqXHR) {
          if(typeof data.error === 'undefined') {
            sp.file.getCustomersList();
            $('button[data-dismiss="modal"]').click();
            
            if (-1 == data.newCustomer) {
              alert('The added user alredy exist therefore was not inserted into the system');
            }
            $('#sp-modal-add-update-customer__button').removeClass('btn-default').addClass('btn-primary');
            $('.sk-spinner').hide();
            $('#sp-add-update-customer__form').show();
          }
        }
      });
    },
    
    deleteCustomer: function(customerEmail) {
      $.post('ManagementServlet', JSON.stringify({
        action: 'deleteCustomer',
        salesman_email: Cookies.get('SalesmanEmail'),
        customer_email: customerEmail
      }))
      .done(function() {
        sp.file.getCustomersList();
      });
    },
  },
  
  
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
    getFileMetrics: function(fileData) {
      // Total views.
      $('#sp-widget-total-views').text(fileData[3]);
      sp.metric.totalViews = parseInt(fileData[3]);
      
      if (sp.metric.totalViews > 0) {
        // Bounce rate.
        $('#sp-widget-bounce-rate').text(parseFloat(fileData[4] * 100).toFixed(2) + '%');
        
        // Average view duration.
        if (null != fileData[5]) {
          /**
           * @see http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
           */
          var totalSeconds = parseInt(fileData[5], 10);
          var hours   = Math.floor(totalSeconds / 3600);
          var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
          var seconds = totalSeconds - (hours * 3600) - (minutes * 60);
  
          if (hours < 10) {
            hours = '0' + hours;
          }
          if (minutes < 10) {
            minutes = '0' + minutes;
          }
          if (seconds < 10) {
            seconds = '0' + seconds;
          }
          var time    = hours+':'+minutes+':'+seconds;
          $('#sp-widget-average-view-duration').text(hours + ':' + minutes + ':' + seconds);
        } else {
          $('#sp-widget-average-view-duration').text('N/A');
        }
        
        // Average pages viewed.
        if (null != fileData[6]) {
          $('#sp-widget-average-pages-viewed').text(parseFloat(fileData[6]).toFixed(2));
        } else {
          $('#sp-widget-average-pages-viewed').text('N/A');
        }
        
        // Top exit page.
        $.getJSON(
            'ManagementServlet',
            {action: 'getTopExitPage', fileHash: fileData[0], salesmanEmail: sp.config.salesman.email},
            function(data) {
              if (typeof data.topExitPage[0] !== 'undefined') {
                $('#sp-widget-top-exit-page').text(data.topExitPage);
              } else {
                $('#sp-widget-top-exit-page').text('N/A');
              }
            }
        );
        
        // Users CTA.
        $('#sp-widget-users-cta').text(fileData[7]);
        
      } else {
        $('.sp-widget:not(#sp-widget-total-views)').text('N/A');
      }
    }
  },
  
chart: {
    
    /**
     * Get the file bar chart.
     */
    getFileBar: function(fileHash) {
      $.getJSON('ManagementServlet', {action: 'getFileBarChart',
          fileHash: fileHash, salesmanEmail: sp.config.salesman.email}, function(data) {
          
        if (typeof sp.chart.fileBar !== 'undefined') {
          sp.chart.fileBar.destroy();
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
        sp.chart.fileBar = new Chart(ctx).Bar(barData, barOptions);
      });
    },
    
    /**
     * Get the file line chart.
     */
    getFileLine: function(fileHash) {
      $.getJSON('ManagementServlet', {action: 'getFileLineChart',
          fileHash: fileHash, salesmanEmail: sp.config.salesman.email}, function(data) {
            
        if (typeof sp.chart.fileLine !== 'undefined') {
          sp.chart.fileLine.destroy();
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
        sp.chart.fileLine = new Chart(ctx).Line(lineData, lineOptions);
      });
    },
    
    /**
     * Get the file performance chart.
     */
    getFilePerformance: function(fileHash) {
      $.getJSON('ManagementServlet', {action: 'getFilePerformanceChart',
          fileHash: fileHash, salesmanEmail: sp.config.salesman.email}, function(data) {
            
        if (typeof sp.chart.filePerformance !== 'undefined') {
          sp.chart.filePerformance.destroy();
        }
        
        var lineData = {
            labels: [],
            datasets: [
                {
                    label: "Max performance",
                    strokeColor: "rgba(248,172,89,0.7)",
                    pointColor: "rgba(248,172,89,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(248,172,89,1)",
                    data: []
                },
                {
                    label: "Average performance",
                    strokeColor: "rgba(26,179,148,0.7)",
                    pointColor: "rgba(26,179,148,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(26,179,148,1)",
                    data: []
                },
                {
                  label: "File performance",
                  strokeColor: "rgba(28,132,198,0.7)",
                  pointColor: "rgba(28,132,198,1)",
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(28,132,198,1)",
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
            datasetFill: false,
            responsive: true,
            multiTooltipTemplate: "<%= datasetLabel + ': ' + value %>"
        };
          
        if (typeof data.filePerformanceChart[0] !== 'undefined' ) {
          $.each(data.filePerformanceChart, function(index, value) {
            dateParts = value[0].split('-');
            lineData.labels.push(dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0]);
            
            if (0 == value[1]) {
              lineData.datasets[0].data.push(1);
            } else {
              lineData.datasets[0].data.push(Math.ceil(parseFloat(value[1]) * 100));
            }

            if (0 == value[2]) {
              lineData.datasets[1].data.push(1);
            } else {
              lineData.datasets[1].data.push(Math.ceil(parseFloat(value[2]) * 100));
            }
            
            if (0 == value[3]) {
              lineData.datasets[2].data.push(1);
            } else {
              lineData.datasets[2].data.push(Math.ceil(parseFloat(value[3]) * 100));
            }
          });
        }
          
        var ctx = $('#lineChart2')[0].getContext('2d');
        sp.chart.filePerformance = new Chart(ctx).Line(lineData, lineOptions);
      });
    },
    
    /**
     * get the file visitors report.
     */
    getFileVisitorsMap: function(fileHash) {
      $.getJSON('ManagementServlet', {action: 'getFileVisitorsMap',
          fileHash: fileHash, salesmanEmail: sp.config.salesman.email}, function(data) {
        
        var dataFormatted = [];
        if (data.fileVisitorsMap.length > 0) {
          dataFormatted.push(['Latitude', 'Longitude', 'City', 'Total views']);
          $.each(data.fileVisitorsMap, function(index, row) {
            var city = (null != row[2]) ? row[2] + ', ' + row[3] : 'Unknown city, ' + row[3];
            dataFormatted.push([parseFloat(row[0]), parseFloat(row[1]), city, parseInt(row[4])]);
          });
        } else {
          dataFormatted.push(['']);
        }
        
        var mapData = google.visualization.arrayToDataTable(dataFormatted);

        var options = {
          colorAxis: {
            colors: ['#dcdcdc', '#1ab394'],
            minValue: 0
          },
          datalessRegionColor: '#dcdcdc',
          displayMode: 'markers',
          legend: 'none',
          projection: 'kavrayskiy-vii',
          sizeAxis: {
            minValue: 0
          }
        };
        
        if (typeof sp.chart.visitorsMap == 'undefined') {
          sp.chart.visitorsMap = new google.visualization.GeoChart(document.getElementById('sp-google-geochart'));
        }
        sp.chart.visitorsMap.draw(mapData, options);
      });
    }
  },
  
  table: {
    
    /**
     * Place the files data into the DataTables plugin.
     * 
     * @param object filesData A 2d array consisting of files data.
     */
    getFilesTable: function(filesData) {
      if ($.fn.dataTable.isDataTable('#sp-files-data__table')) {
        sp.table.filesData = $('#sp-files-data__table').DataTable()
            .clear()
            .rows.add(filesData)
            .draw();
      } else {
        var fileLinkColumnIndex = 2;
        sp.table.filesData = $('#sp-files-data__table').DataTable({
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
                targets: [0, 5, 6, 7]
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
                render: function (data, type, row) {
                  if (null != data) {
                    if (0 == data) {
                      return 1;
                    } else {
                      return Math.ceil(parseFloat(data) * 100);
                    }
                  } else {
                    return 'N/A';
                  }
                },
                targets: 8
              }
          ],
          dom: '<"html5buttons"B>lTfgitp',
          order: [[ 1, 'asc' ]]
        });
      
        new Clipboard('.sp-copy__button');
      }
    }
  }
};
// End sp.

$(document).ready(function() {
  $('#send_email_to_customers').css('visibility', 'visible');
  
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
