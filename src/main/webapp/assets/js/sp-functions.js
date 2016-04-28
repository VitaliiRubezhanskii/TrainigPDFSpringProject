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
                      '<a href="#" aria-expanded="true"><i class="fa fa-bar-chart"></i> '
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
//            if ($("input[multiple]").val())
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
                var requestOrigin = 'fileUploadDashboard';
                $('#sp-nav-files__li ul').hide();
                sp.file.getFilesList(requestOrigin);
                sp.file.getCustomersList(requestOrigin);
                break;
                
              case 'sp-file-dashboard':
                sp.table.filesData = undefined;                
                setFileDashboard();
                break;
                
              case 'sp-send-email':
                requestOrigin = 'customerFileLinksGenerator';
                $('#sp-nav-files__li ul').hide();
                $('.sp-hidden').removeClass('sp-hidden');                
                sp.file.getCustomersList(requestOrigin);
                sp.file.getFilesList(requestOrigin);   
             // Move to the top of the page.
                $('html, body').animate({scrollTop: 0}, 'fast');
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
    
    getFilesList: function(requestOrigin) {
      $.getJSON(
          'ManagementServlet',
          {action: 'getFilesList', salesmanEmail: sp.config.salesman.email},
          function(data) {
                   
            //Request Origin is a handler to decide where to send the data from the getFilesList function
            //There are two choices - either to send the file data to the fileupload dashboard (Files & Customers),
            //or to send it to the customerFileLinkGenerator which allows the user to choose customers and documents
            //to send out.
            
            sp.file.fileCallback(data, requestOrigin);
            
            
          });
    },
    
    fileCallback: function (data, requestOrigin) {
      // do something with data      
      console.log(data);
      if (requestOrigin === 'fileUploadDashboard'){
        sp.file.sortFilesForUpload(data);
      }
      else if (requestOrigin === 'customerFileLinksGenerator') {
        sp.customerFileLinksGenerator.formatFile(data);
      }
      
      
    },
    
    sortFilesForUpload: function (data) {
      $('#sp-files-management tbody').empty();
      
      $.each(data.filesList, function(index, row) {
        $('#sp-files-management tbody').append(
            '<tr>'
              + '<td class="col-lg-2"><i class="fa fa-clock-o sp-file-clock" data-toggle="tooltip" data-placement="right" title="Date file was added or updated"></i> ' + row[2] + '</td>'
              + '<td class="col-lg-3 sp-file-mgmt-file-name" data-file-hash="' + row[0] + '">' + row[1] + '</td>'
              + '<td class="col-lg-7"><a href="#"><span style="margin-left: 300px;" class="label label-primary sp-file-update" data-toggle="modal" data-target="#sp-modal-update-file" data-file-hash="' + row[0] + '">Update</span></a><a href="#"><span class="label label-danger sp-file-delete" data-file-hash="' + row[0] + '">Delete</span></a></td>'
          + '</tr>'
        );
      });
      $('.tab-content').perfectScrollbar();
      $('#sp-files-management tbody').tooltip({
        selector: "[data-toggle=tooltip]"
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
            sp.file.getFilesList('file');
            $('button[data-dismiss="modal"]').click();
            
            sp.file.files = [];
            $('#sp-upload-files__button').removeClass('btn-default').addClass('btn-primary').text('Update Files');
            $('.sk-spinner').hide();
            $('.file__input').show();
            $('#sp-file-upload__form').css('display', 'block');
          }
        },
        error: sp.error.handleError('ERROR: the file was too large, please upload a file less than 16MB')
      
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
    
    getCustomersList: function(requestOrigin) {
      
      $.getJSON(
          'ManagementServlet',
          {action: 'getCustomersList', salesmanEmail: sp.config.salesman.email},
          function(data) {              
          //Request Origin is a handler to decide where to send the data from the getFilesList function
            //There are two choices - either to send the file data to the fileupload dashboard (Files & Customers),
            //or to send it to the customerFileLinkGenerator which allows the user to choose customers and documents
            //to send out.           
            sp.file.customerCallback(data, requestOrigin);
          });
    },
    
    customerCallback: function (data, requestOrigin) {
      
      if (requestOrigin === 'fileUploadDashboard'){
        sp.file.sortForDocUpload(data);
      }
      else if (requestOrigin === 'customerFileLinksGenerator') {
        sp.customerFileLinksGenerator.formatCustomers(data);
      }
      
      
    },
   
    
    sortForDocUpload: function (data) {
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
      $('.tab-content').perfectScrollbar();
      
      
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
  },
  
  // This object handles the wizard where a user can choose customers 
  // and documents they'd like to send them
  customerFileLinksGenerator : {
    
    //This function is the configuration for the wizard - jQuery Steps www.jquery-steps.com/
    wizardConfig : (function() {
      $("#document-wizard").steps({
        headerTag : "h3",
        bodyTag : "section",
        transitionEffect : "slideLeft",
        autoFocus : true,
        onStepChanging: function (event, currentIndex, newIndex){
          if (currentIndex > newIndex){
            return true;
          };
          console.log('current: ' + currentIndex + 'new: ' + newIndex);
          if (currentIndex === 0 && (!$('.sp-customer-table tbody input[type="checkbox"]').is(':checked'))){
            sp.error.handleError('You must select at least one customer to continue');
            return false;
          }
          else if (currentIndex === 1 && (!$('.sp-doc-table tbody input[type="checkbox"]').is(':checked'))) {
            sp.error.handleError('You must select at least one document to continue');
            return false;
          }
          else {
            return true;
          };
          
        },
      });
    })(),
    
    // This function formats and prints customers to print wizard
    formatCustomers : function(data) {
      $('.sp-customer-table td').remove();
      $.each(data['customersList'], function(i, v) {  
          $('.sp-customer-table tbody').append(
              '<tr id=' + i + '><td><input id= ' + 'checkbox' + i + ' type="checkbox" class="i-checks" name="input[]"></td>'
                  + '<td>' + v[0] + ' ' + v[1] + '</td><td>' + v[2]
                  + '</td><td data-email=' + v[3] +' class="sp-email"> ' + v[3] + '</td>'
                  + '<td></td>'
                  + '</tr>'
          );
      });
      $('.table-responsive').perfectScrollbar();
    },
    
  // This function formats and renders files to the wizard
    formatFile: function (data){
      $('.sp-doc-table td').remove();
      $.each(data['filesList'], function (i, v) {
        $('.sp-doc-table tbody').append(
            '<tr id=' + i + '><td><input id= ' + 'checkbox' + i + ' type="checkbox" class="i-checks" name="input[]"></td>'
                + '<td class="sp-doc-name" data-file-name=' + v[1] +' data-file-hash=' + v[0] +'>' + v[1] + '</td>'
                + '<td> ' + v[2] + '</td>'
                + '</tr>'
        );        
      });
      $('.content').perfectScrollbar();
       
    },
    
    // Listener to save which boxes have been checked i.e. which documents the
    // user wants to send, and to whom
    checkboxListener: (function () {            
      $('a#document-wizard-t-2').addClass('sp-enumerate-customers-files__button');
      $('a#document-wizard-t-1').addClass('sp-enumerate-customers-files__button');
      $('a[href="#next"]').addClass('sp-enumerate-customers-files__button');
      $('.sp-enumerate-customers-files__button').on('click', function () { 
        
        // This checks If wizard-step is document selector tab in order to start saving the
        // chosen sections
        if ($('li.current').text() === 'current step: 3. Send Documents'){  
          var customerArr = [];
          var fileArr = [];
          var files = [];
         
          //This saves all the chosen email addresses
          $(':checked').closest('tr').find('[data-email]').each(function (i, v) {
            var email = $(this).text();
            customerArr.push(email.slice(1, email.length));
          });
       
          // This saves all the document hashes & file names into a file array, and
          // a files object
          $(':checked').closest('tr').find('[data-file-hash]')
            .each(function (i, v) {
              fileArr.push($(this).attr('data-file-hash'));
              var fileObj = {
                  name: $(this).text(),
                  hash: $(this).attr('data-file-hash')
              };
              files.push(fileObj);
            }); 
          
          sp.customerFileLinksGenerator.sortDocsAndCustomersForServer(customerArr, fileArr, files);
        }      
      });   
    })(),
    

    // Change 'next' button text to 'send'. 
    toggleActionTabs: (function () {      
      $('ul[role="tablist"]').on('click', function () {
        if ($('ul[role="tablist"] > li[aria-selected="true"]')
            .children().attr('id') === 'document-wizard-t-1') {
          $('a[href="#next"]').text('Send');
        }
        else {
          $('a[href="#next"]').text('Next');
        }
      });      
    })(),
    
    toggleActionBtns: (function () {
      $('a[href="#previous"]').on('click', function () {
        if (!($('li.current').text() === 'current step: 2. Select Documents')){
          $('a[href="#next"]').text('Next');
        }   
        else {
          $('a[href="#next"]').text('Send');
        }
      });
    })(),
    
    //Create obj to send
    sortDocsAndCustomersForServer: function (customers, documents, files) {
      var dataToSend = [];
      $.each(customers, function (i, v) {
        var obj = {
            customerEmail: v,
            fileHashes: documents
        };
        dataToSend.push(obj);
      
      });
      sp.customerFileLinksGenerator.sendDocsAndCustomersToServer(dataToSend, files);

    },
    
    sendDocsAndCustomersToServer: function (dataToSend, files) {
      var data = {'data': dataToSend};
      $.ajax({       
        url: 'ManagementServlet',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          'data': data, 
          'action': 'createCustomersFilelinks', 
          'salesmanEmail': sp.config.salesman.email
          }),
        success: function (data) {
          sp.customerFileLinksGenerator.renderCustomerChoice(data, files);
        },
        error: function (err) {
          console.log(err);
        }
      });

    },
    
    //This function collects the choices the customer has made for the email addresses to which he will
    //send the documents
    renderCustomerChoice: function (data, files) {
      var fileLink;
      $('.sp-send-table tbody tr').remove();
      $.each(data['customersFilelinks'], function (i, val) {
      //This creates the initial bootstrap layout
        $('.sp-send-table tbody').append(
          '<tr class="sp-mail-table__row" id="sp-t-row' + i + '">'
        + '<div class="row">' 
        + '<td class="col-sm-2 sp-customer">' + val['customerEmail'] +'</td>'
        + '<td id="sp-doc-'+ i +'" class="col-sm-10 sp-document"></td>'
        + '</div>'
        + '</tr>'
        );
        
        $.each(val['files'], function (index, v) {
            fileLink = sp.config.viewerUrlWithoutFileLink + v['fileLink'];
            //This renders the information into the predefined rows 
            $('.sp-send-table tbody #sp-t-row' + i + ' #sp-doc-' + i).append(
                '<div class="sp-doc-send-data row">'
                  + '<div class="col-md-3" data-hash=' + v['fileHash'] +'></div>'
                  + '<div id="sp-file-link-' + v['fileLink'] + '"  data-link="'+ fileLink +'" class="col-md-5 sp-file-link">' + fileLink + '</div>'
                  + '<div class="sp-mail-choice col-md-2">'
                      + '<button class="btn btn-white sp-send-options btn-xs sp-copy__btn" data-clipboard-target="#sp-file-link-' + v['fileLink']+ '">'
                          + '<i class="fa fa-copy"></i> Copy'
                      + '</button>'
                  + '</div>'
                  + '<div class="sp-mail-choice col-md-2">'
                      + '<button data-file-link="' + fileLink +'" data-mailto="' + val['customerEmail'] + '" class="btn btn-white  sp-send-options btn-xs sp-mailto sp-clickable ' + 'mail-' + v['fileHash'] +'">'
                          + '<i class="fa fa-envelope"></i>  Send Mail'
                      +'</button>'
                  + '</div>'
              + '</div>'
           );            
          
          sp.customerFileLinksGenerator.findDocumentName(v['fileHash'], files);
          sp.customerFileLinksGenerator.sendMailCallback();
          new Clipboard('.sp-copy__btn');
        });
        
      });
      // This creates the copy all and send all buttons
      $('.sp-document').append(
            '<div class="row">'
              + '<div class="col-md-offset-8 col-md-2">'
                + '<button class="btn btn-white sp-mail-all__button btn-xs sp-copy-all sp-cmd-all__button">'
                  + '<i class="fa fa-copy sp-mail__icon"></i> Copy All'
                + '</button>' 
              + '</div>'
              + '<div class="col-md-2">' 
                  + '<button class="btn btn-white sp-send-to-all__button sp-send-options btn-xs sp-mail-all__button sp-send-all sp-cmd-all__button">'
                    + '<i class="fa fa-envelope sp-mail__icon"></i> Send To All'
                  + '</button>'
              + '</div>'
          + '</div>'          
      );
      
      sp.customerFileLinksGenerator.sendAll();
      sp.customerFileLinksGenerator.copyAll();
      
    },
    
    //This function
    sendMailCallback: function () {      
      var mailSubject = sp.config.salesman.name.split(" ")[0] + ' from ' + sp.config.salesman.company
      + ' has sent you a document'; 
      
      $('.sp-mailto').on('click', function () {       
        window.open(
            'mailto:' + $(this).attr('data-mailto')
          + '?subject=' + mailSubject
          + '&body='  + 'Please follow this link to view the PDF: '+ '%0D%0A' + $(this).attr('data-file-name') + ' - ' + $(this).attr('data-file-link')
      );
      });
      
    },
    
    copyAll: function () {
      //This function allows the user to copy all documents being
      //sent to a particular email address
      //Uses clipboard js https://clipboardjs.com/
      $('.sp-copy-all').on('click', function () {
        var links = [];
        $(this).closest('tr').find('div[data-link]').each(function (i, v){
          console.log($(this).text());
          links.push($(this).text() + '%0D%0A');
          });
        
        new Clipboard('.sp-copy-all', {
          text: function(target) {
            target = '';
            $.each(links, function (i, v){
              target += decodeURIComponent(v);       
            });
            return target;
     
          }
      });
      });
      
    },
    
    /**
     * This function opens a mail window to a particular email address with all documents in the body
     */
    sendAll: function () {
      $('.sp-send-all').on('click', function () {
        var emailRecipient = $(this).closest('tr').children('td.sp-customer').text();
        
        //This will create an array of file links
        var links = [];
        $(this).closest('tr').find('div[data-link]').each(function(i, v) {
          links.push($(this).text()); 
        });
        
        //filename
        var fileNames = [];
          $(this).closest('tr').find('.sp-mailto').each(function(i, v) {
            fileNames.push($(this).attr('data-file-name'));
          });  
          
          
        var mailBody = '';
        $.each(fileNames, function (i, v) {
            
            mailBody += v + ' - ' + links[i] + '%0D%0A';
           });
        
        //This dynamically creates the email subject with the salesman email and their company
        var mailSubject = sp.config.salesman.name.split(" ")[0] + ' from ' + sp.config.salesman.company
        + ' has sent you a document'; 
        
        window.open(
          'mailto:' + emailRecipient
        + '?subject=' + mailSubject 
        + '&body=' + 'Please follow these links to view the PDFs: ' + '%0D%0A' + mailBody
        );
        
      });
      
    },
    /**
     * File-hash is linked to file-name in an object - so name can be retrieved by hash
     * @param {string} hash - the file hash
     * @param {arr of objs} - the file objects containing k/v pair of hash and document name
     */
    
    findDocumentName: function (hash, files) {      
      $.each(files, function (i, v) {
        var name = v['name'];
        if (v['hash'] === hash){
          $('[data-hash=' + hash + ']').text(v['name']);
          $('.mail-' + hash).attr('data-file-name',  name);
        }
      });      
    }
    
  }, 
  
  error: {
    /** 
      * This function is an error handler - you can call this function sp.error.handleError() and
      * pass the error message as a parameter 
      * @param {string} msg - the error message 
      */
    handleError: function (msg) {
      toastr.options = {
          "closeButton": false,
          "debug": false,
          "progressBar": false,
          "preventDuplicates": true,
          "positionClass": "toast-top-right",
          "onclick": null,
          "showDuration": "400",
          "hideDuration": "1000",
          "timeOut": "7000",
          "extendedTimeOut": "1000",
          "showEasing": "swing",
          "hideEasing": "linear",
          "showMethod": "fadeIn",
          "hideMethod": "fadeOut"
        };
      toastr.error(msg);

    },
    
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
          alert('The user ' + formData.email + ' already exists.');
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
