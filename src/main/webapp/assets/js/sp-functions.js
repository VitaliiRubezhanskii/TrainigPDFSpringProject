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
          /**
           * The (if) clause is there so that a fileHash is not set to the search field,
           * as it is contained inside an <li> tag
           */
            var fileHash = $(this).children().attr('data-file-hash');
        if (!($(this).find('input').hasClass('sp-nav-search__input') || $(this).hasClass('sp-sort'))){  
            if (typeof fileHash === 'undefined' && typeof sp.table.filesData !== 'undefined') {
              fileHash = sp.table.filesData.row($(this).parent()).data()[0];
            }
        }
          /**
           * @param Check what has been clicked on in the menu to decide whether to repopulate the list
           * or not. I.e. if they have clicked sort repopulate the list, otherwise do not
           */
          var clickChoice = $(this).attr('data-sort');
          $.getJSON(
              'ManagementServlet',
              {action: 'getFilesData', salesmanEmail: sp.config.salesman.email, 
                sortChoice: $(this).attr('data-sort') !== undefined ? $(this).attr('data-sort'): "noSort" },
              function(data) {
            var filesData = data.filesData;
            
            if (0 < filesData.length) {
              // Build side menu.
             /**
              *  Put search bar inside <ul> tag, putting it anywhere else causes bugs in the menu
              *  
              *  If the list has not been created, create it (in the else clause)
              *  This stops the list from being re-created each time a file is clicked on, but still allows
              *  the metrics to be updated
              */ 
              var files = [];
              if (0 < $('.sp-search-list li').length && undefined === clickChoice) {
                for (var i = 0; i < filesData.length; i++) {
                  if (typeof fileHash === 'undefined' || filesData[i][0] == fileHash) {
                    fileHash = filesData[i][0];
                    files[fileHash] = filesData[i];
                  }
                }
              }
              else  {
                $('#sp-nav-files__li')
                    .empty()
                    .append(
                        '<a aria-expanded="true"><i class="fa fa-bar-chart"></i> '
                        + '<span class="nav-label">Marketing Analytics</span></a>'
                        + '<span class="fa arrow"></span>'
                        + '<div id="sp-marketing-analytics" class="sp-analytics-container__div">'
                        + '<ul class="nav nav-second-level sp-search-list">'
                        + '<div class="sp-sort-search-cont">'
                          + '<div class="sp-search-container">'
                            + '<span><input id="sp-search-box" class="sp-nav-search__input" placeholder="Search" /></span>'
                          + '</div>'
                          + '<div class="sp-sort-list">'
                            + '<span class="sp-clickable sp-sort sp-sort-options-toggle"><i class="fa fa-sort-amount-asc" aria-hidden="true"></i></i><i class="fa fa-caret-down sp-sort-toggle__icon" aria-hidden="true"></i></span>'
                          + '</div>'  
                          + '<div">'
                            + '<li data-sort="fileName" class="sp-sort-option__li sp-sort"><span class="sp-sort-option__a">Sort by Name</span></li>'
                            + '<li data-sort="performance" class="sp-sort-option__li sp-sort"><span class="sp-sort-option__a">Sort by Performance</span></li>'                           
                          + '</div>'
                        + '</div>'
                        + '</div>'
                    );
                
                //Without this command, the input field does not focus when clicked on 
                $('#sp-search-box').focus();
                
                for (var i = 0; i < filesData.length; i++) {
                  $('#sp-nav-files__li ul').append('<li class="sp-marketing-analytics__li"><a class="sp-word-wrap" data-file-hash="'
                      + filesData[i][0] + '">' + filesData[i][1] + '</a></li>');

                  if (typeof fileHash === 'undefined' || filesData[i][0] == fileHash) {
                    fileHash = filesData[i][0];
                    files[fileHash] = filesData[i];
                  }
                }
                $('.sp-marketing-analytics__li:first').addClass('active');
                
                // Init search and sort functions
                sp.view.marketingAnalytics.search();
                sp.view.marketingAnalytics.sort();
              }
              
              // Highlight the <li> clicked on
              $('.sp-marketing-analytics__li').on('click', function () {
                $('.sp-marketing-analytics__li').removeClass('active');
                $(this).addClass('active');
              });
              
              // Build dashboard.
              sp.metric.getFileMetrics(files[fileHash]);
              sp.chart.getFileLine(fileHash);
              sp.chart.getFileBar(fileHash);
              sp.chart.getFileVisitorsMap(fileHash);
              sp.chart.getFilePerformance(fileHash);
              sp.table.getFilesTable(filesData);
              

              // Temporary solution until sales analytics will show data for all metrics, charts, and table. 
              $('.sp-metric-top-exit-page, .sp-chart-performance-benchmark').show();
              
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
          $.ajaxSetup({cache: false});
          
          $('#sp-salesman-full-name strong').text(sp.config.salesman.name);
          
          /* Nav bar click event mechanisem */
          $('.sp-nav-section').click(function(event) {

            // If a first level nav bar is clicked, then do the following.
            if (typeof $(event.target).closest('.nav-second-level')[0] == 'undefined') {
              routingEmulator($(this).attr('data-dashboard'));
            }
            
            // If a third level nav bar from the sales analytics nav (a file name) is clicked,
            // then do the following.
            if ($(event.target).hasClass('sp-customer-file__a')) {
              
              // Temporary solution until metisMenu and Inspinia nav bar functionality will work well.
              $('#sp-nav-sales-analytics__li ul li a').css('color', '#a7b1c2');
              $(event.target).css('color', '#fff');
              
              sp.view.salesAnalytics.setMetrics(
                  $(event.target).attr('data-customer-email'),
                  $(event.target).attr('data-file-hash')
              );
            }
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
          
          $('input[type=file]').on('change', function(event) {
            if(!event) {
              event = window.event;
            }
            sp.file.files = event.target.files;
          });
          
          // Upload file.
          $('#sp-upload-files__button').click(function(event) {
            if ($('#sp-file-upload__form > input[type="file"]').val() !== '') {
                sp.file.uploadFiles(event);
                $('input[type="file"]').val(null);
            }
            else {
              sp.error.handleError('You must select a document to upload');
            }
          });
          
          // Update file.
          $(document).on('click', '.sp-file-update', function() {
            sp.file.fileHash = $(this).attr('data-file-hash');
          });
          
          $('#sp-update-file__button').click(function(event) {
            if ($('#sp-file-update__form > input[type="file"]').val() !== ''){
              sp.file.updateFile(event, sp.file.fileHash);
              $('input[type="file"]').val(null);
            }
            else {
              sp.error.handleError('You must select a file to update');
            }
          });
          
          // Customize Toolbar
          
          $('[data-target="#sp-toolbar-settings__modal"]').on('click', function () {
            $('#sp-toolbar-settings__modal').load('assets/modal/navbar-customization/main.html');
          });
          
          // Delete file.
          $(document).on('click', '.sp-file-delete', function() {
            sp.file.fileHash = $(this).attr('data-file-hash');
            swal({
              title: "Are you sure you want to delete this file?",             
              type: "warning",
              confirmButtonText: "Yes, delete please!",
              cancelButtonText: "No, cancel!",
              showCancelButton: true,
              closeOnConfirm: false,
              closeOnCancel: true
          },
          function(isConfirm){
            if (isConfirm) {
              sp.file.deleteFile(sp.file.fileHash);
              swal("Deleted!", "Your file has been deleted.", "success");
              
              } 
            });
          });
          
          /* Customers mgmt. */
          
          // Upload customers.
          $('#sp-upload-customers__button').click(function(event) {
          if ($('#sp-modal-upload-customers input[type="file"]').val() === ''){
            sp.error.handleError('You must select a file to upload');
          }
          else {
            sp.file.uploadCustomers(event);
            $('input[type="file"]').val(null);
            }
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
                  val($('[data-customer-email="' + $(this).attr('data-customer-email') + '"]')
                      .closest('tr').find('#sp-customer-first-name__td').text());
              
              $('#sp-modal-add-update-customer input[name="customerLastName"]').
                  val($('[data-customer-email="' + $(this).attr('data-customer-email') + '"]')
                      .closest('tr').find('#sp-customer-last-name__td').text());
              
              $('#sp-modal-add-update-customer input[name="customerCompany"]').
                  val($('[data-customer-email="' + $(this).attr('data-customer-email') + '"]')
                      .closest('tr').find('#sp-customer-company__td').text());
              
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
            var customerToDelete = $(this).attr('data-customer-email');
            swal({
              title: "Are you sure you want to delete this contact?",             
              type: "warning",
              confirmButtonText: "Yes, delete please!",
              cancelButtonText: "No, cancel!",
              showCancelButton: true,
              closeOnConfirm: false,
              closeOnCancel: true
          },
          function(isConfirm){  
            if (isConfirm) {
              sp.file.deleteCustomer(customerToDelete);
              swal("Deleted!", customerToDelete + " has been deleted.", "success");
              
              } 
            });
          });
          
          
          //$('#side-menu').metisMenu();
          
          /**
           * The function controls the display of the current dashboard view. 
           * topSection refers to the ID of the container in dashboard.html
           * When the routingEmulator is called, all sections are hidden,
           * then, the selected topSection is shown
           * 
           */
          function routingEmulator(topSection) {
            $('.sp-dashboard, .sp-nav-section ul').hide();
            $('.sp-nav-section').removeClass('active');
            $('.sp-nav-section[data-dashboard="' + topSection + '"]').addClass('active');
            $('#' + topSection).show();
            //  Bug fix for bad UI on mozilla - scrollbar still shows
            $('.sp-analytics-container__div').remove();
            $('html, body').animate({scrollTop: 0}, 'fast');
            
            switch(topSection) {
              case 'sp-file-upload':
                var requestOrigin = 'fileUploadDashboard';
                sp.file.getFilesList(requestOrigin);
                sp.file.getCustomersList(requestOrigin);
                break;
                
              case 'sp-file-dashboard':
                sp.table.filesData = undefined;
                //  Bug fix for bad UI on mozilla - scrollbar still showed
                $('#sp-sales-analytics-scroll').remove();
                setFileDashboard();
                break;
                
              case 'sp-sales-analytics-view':
                sp.view.salesAnalytics.setNavBar("customerName");
                //  Bug fix for bad UI on mozilla - scrollbar still showed
                $('#sp-marketing-analytics').remove();
                $('#sp-file-dashboard').show();
                break;
                
              /**
               * @todo: fix the step the doc-wizard loads on - 
               *        current method: $('#document-wizard-t-0').click();
               *        simulates a click on the first step.
               */
              case 'sp-send-email':
                requestOrigin = 'customerFileLinksGenerator';
                $('#sp-nav-files__li ul').hide();
                // This class is removed because the send-email wizard appears at the botton of
                // marketing analytics when the page loads
                $('.sp-email-container-hidden').removeClass('sp-email-container-hidden'); 
                $('a[href="#finish"]').remove();
                $('a[href="#cancel"]').remove();
                $('#document-wizard-t-0').click();
                sp.file.getCustomersList(requestOrigin);
                sp.file.getFilesList(requestOrigin);   
                break;
            }
          }
          
        });
      }
     
      
    /* Intercom Start */
    window.intercomSettings = {
      app_id: "j4o2t486",
      name: sp.config.salesman.email, // Full name
      email: sp.config.salesman.email // Email address
    };
    
    (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/j4o2t486';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()
    /* Intercom End */
    
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
            /**
             * Request Origin is a handler to decide where to send the data from the getFilesList function
             * There are two choices - either to send the file data to the fileupload dashboard (Files & Customers),
             * or to send it to the customerFileLinkGenerator which allows the user to choose customers and documents
             * to send out.
             */       
            
            sp.file.fileCallback(data, requestOrigin);
            
          });
    },
    
    fileCallback: function (data, requestOrigin) {
      // do something with data    
      /**
       * @params {data - obj} This is the data received from the server
       * @params {requestOrigin - String} The request origin routes the the sending of the data either for the 
       *          file upload, or to the send document wizard
       */
      
      if (requestOrigin === 'fileUploadDashboard'){
        sp.file.sortDocsInDocsMgmtPanel(data);
      }
      else if (requestOrigin === 'customerFileLinksGenerator') {
        sp.customerFileLinksGenerator.formatFile(data);
        
      }
      
    },
    /**
     * @params {data - obj} This is the file data received from the server, which has
     *          been passed through the callback function.
     * The data will now be printed to 'Documents & Customers, Upload Documents' 
     * 
     */
    sortDocsInDocsMgmtPanel: function (data) {
      var filesArr = [];
      $.each(data['filesList'], function (i, v) {
        var obj = {
            'date': '<span><i class="fa fa-clock-o sp-clickable sp-file-clock" data-toggle="tooltip" data-placement="right" title="Date file was added or updated"></i> ' + v[2] + '</span>',
            'document': '<span class="sp-file-mgmt-file-name" data-file-hash="' + v[0] + '">' + v[1] + '</span>',
            'options': '<span>'
                        + '<a><span style="margin-left: 300px;" class="label label-primary sp-file-update" data-toggle="modal" data-target="#sp-modal-update-file" data-file-hash="' + v[0] + '">Update</span></a>'
                        + '<a href="#"><span class="label label-danger sp-file-delete" data-file-hash="' + v[0] + '">Delete</span></a></span>'
                        + '<a><span data-toggle="modal" data-target="#sp-viewer-widgets-modal" style="margin-left: 10px;" class="label label-success sp-file-customize" data-file-hash="' + v[0] + '">Customize</span></a>'
        };   
        filesArr.push(obj);
      });
      
      if (!($.fn.dataTable.isDataTable('#sp-files-management'))) {
        $('#sp-files-management').DataTable({
          data: filesArr,
          columns: [
            {data: 'date' },
            {data: 'document' },
            {data: 'options' },
          ],
          order: [[ 0, "desc" ]],
          paging: false,
        });
      }
      else {
        $('#sp-files-management').DataTable()
        .clear()
        .rows.add(filesArr)
        .draw();
      }
      $('.tab-content').css('overflow-y', 'scroll');
      
      
      /**
      * Open viewer widgets modal.
      */
      $('.sp-file-customize').on('click', function() {
        var fileHash = $(this).attr('data-file-hash');
        
        $('#sp-viewer-widgets-modal').load('assets/modal/viewer-widgets-wizard/main.html', function () {
          $.getScript('assets/modal/viewer-widgets-wizard/functions.js', function() {
            sp.viewerWidgetsModal.getWidgetsSettings(fileHash);  
          });
        });
      });
      
      
   // init tooltip
      $('.sp-file-clock').tooltip({delay: {show: 100, hide: 200}, placement: 'right' });
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
      data.append('localTimestamp', Math.round(new Date().getTime()));
        
      $.ajax({
        url: 'upload-file',
        type: 'POST',
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function(data, textStatus, jqXHR) {
          if(typeof data.error === 'undefined') {
            sp.file.getFilesList('fileUploadDashboard');
            $('button[data-dismiss="modal"]').click();
            
            sp.file.files = [];
            $('#sp-upload-files__button').removeClass('btn-default').addClass('btn-primary').text('Upload Documents');
            $('.sk-spinner').hide();
            $('.file__input').show();
            $('#sp-file-upload__form').css('display', 'block');
            swal("Success!", "Your file was uploaded!", "success");
          }
        },
        error: function () {
          sp.error.handleError('ERROR: the file was too large, please upload a file less than 100MB');
        }
      
      });
    },
    
    updateFile: function(event, fileHash) {
      event.stopPropagation();
      event.preventDefault();

      $('#sp-file-update__form').hide();
      $('.sk-spinner').show();
      $('#sp-update-file__button').removeClass('btn-primary').addClass('btn-default').text('Updating...');
      
      var data = new FormData();
      data.append('updatedfile', sp.file.files[0]);
      data.append('action', 'updateFile');
      data.append('updateFileHash', fileHash);
      data.append('salesmanEmail', Cookies.get('SalesmanEmail'));
      data.append('localTimestamp', Math.round(new Date().getTime()));
      
      $.ajax({
        url: 'upload-file',
        type: 'POST',
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success: function(data, textStatus, jqXHR) {
          if(typeof data.error === 'undefined') {
            sp.file.getFilesList('fileUploadDashboard');
            $('button[data-dismiss="modal"]').click();
            
            sp.file.files = [];
            $('#sp-update-file__button').removeClass('btn-default').addClass('btn-primary').text('Update Document');
            $('#sp-upload-files__button').removeClass('btn-default').addClass('btn-primary').text('Upload Documents');
            $('.sk-spinner').hide();
            $('.file__input').show();
            $('#sp-file-update__form').css('display', 'block');
            swal("Success!", "Your file was updated!", "success");
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
        sp.file.getFilesList('fileUploadDashboard');
      });
    },
    
    
    /**
     * Add data-file-link attribute containing a user file link to an HTML element.
     *
     * @param {String} fileHash - A file hash.
     * @param {String} customerEmail - A customer email.
     * @param {String} salesmanEmail - A salesman email.
     * @param {String} targetId - The id attribute of a target HTML element.
     */
    setFileLinkAttribute: function(fileHash, customerEmail, salesmanEmail, targetId) {
      $.getJSON(
          'ManagementServlet',
          {
            action: 'getFileLinkHash',
            fileHash: fileHash,
            customerEmail: customerEmail,
            salesmanEmail: salesmanEmail
          },
          function(data) {
            var fileLink = sp.config.viewerUrlWithoutFileLink + data.fileLinkHash;
            $('#' + targetId).attr('data-file-link', fileLink); 
          }
      );
    },
    
    
    /* Customers mgmt. */
    
    getCustomersList: function(requestOrigin) {
      $.getJSON(
          'ManagementServlet',
          {action: 'getCustomersList', salesmanEmail: sp.config.salesman.email},
          function(data) {              
          /**
           * @see comment on line 341
           */         
            sp.file.customerCallback(data, requestOrigin);
          });
    },
    
    customerCallback: function (data, requestOrigin) {
      /**
       * @see similar callback function above
       */
      if (requestOrigin === 'fileUploadDashboard'){
        sp.file.sortForDocUpload(data);
      }
      else if (requestOrigin === 'customerFileLinksGenerator') {
        sp.customerFileLinksGenerator.formatCustomers(data);
      }
    },
   
    
    sortForDocUpload: function (data) {
      var nameArr = [];
      $.each(data['customersList'], function (i, row) {
        var obj = {
            'name':  '<span id="sp-customer-first-name__td">' + row[0] + '</span> <span id="sp-customer-last-name__td">' + row[1] + '</span></span>' ,
            'company': '<span id="sp-customer-company__td">' + row[2] + '</span>',
            'email':  '<span class="contact-type"><i class="fa fa-envelope"> </i></span>' + '         '  + row[3] + '',
            'options': '<td><a href="#"><span class="label label-primary sp-add-update-customer sp-customer-update" data-add-update="update" data-toggle="modal" data-target="#sp-modal-add-update-customer" data-customer-email="' + row[3] + '">Update</span></a><a href="#"><span class="label label-danger sp-customer-delete" data-customer-email="' + row[3] + '">Delete</span></a></td>'
        };
        nameArr.push(obj);
      });
      if (!($.fn.dataTable.isDataTable('#sp-customers-management'))) {
        $('#sp-customers-management').DataTable({
          data: nameArr,
          columns: [
            {data: 'name'},
            {data: 'company'},
            {data: 'email'},
            {data: 'options'}
          ],
          paging: false,
        });
      }
      else {
        $('#sp-customers-management').DataTable()
        .clear()
        .rows.add(nameArr)
        .draw();
      }
      $('.tab-content').css('overflow-y', 'scroll');
      
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
            
            if (data.err){
              swal(
                'Error!',  
                'You are missing some required information - your contacts must include First Name, Last Name,'
              + ' Company, and Email Address',
                'error'
              );
            }
            else {
              swal("Success!", "Your new customers were uploaded!", "success");
            }
            
            sp.file.getCustomersList('fileUploadDashboard');
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
        
      // Firefox fix.
      if (!event) {
        event = window.event;
      }
      
      event.preventDefault();
      event.stopPropagation();
      
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
            sp.file.getCustomersList('fileUploadDashboard');
            $('button[data-dismiss="modal"]').click();
            
            if (-1 == data.newCustomer) {
              sp.error.handleError('The added user already exists so was not inserted into the system');
            }
            else {
              swal("Success!", "Your customer list was udpated!", "success");
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
        
        sp.file.getCustomersList('fileUploadDashboard');
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
      if (typeof fileData != 'undefined' && typeof fileData[3] != 'undefined' && parseInt(fileData[3]) > 0) {

        // Total views.
        $('#sp-widget-total-views').text(fileData[3]);
        
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
        $('#sp-widget-total-views').text('0');
        $('.sp-widget:not(#sp-widget-total-views)').text('N/A');
      }
    }
  },
  
chart: {
    
    /**
     * Get the file bar chart.
     */
    getFileBar: function(fileHash, customerEmail) {
      if (typeof customerEmail == 'undefined') {
        customerEmail = null;
      }
      $.getJSON('ManagementServlet', {action: 'getFileBarChart',
          fileHash: fileHash, salesmanEmail: sp.config.salesman.email, customerEmail: customerEmail}, function(data) {
          
        if (typeof sp.chart.fileBar !== 'undefined') {
          sp.chart.fileBar.destroy();
          $('#barChart').remove();
          $('#sp-bar-chart-container')
              .append('<canvas id="barChart" height="354" width="760" style="width: 760px; height: 354px;"></canvas>');
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
    getFileLine: function(fileHash, customerEmail) {
      if (typeof customerEmail == 'undefined') {
        customerEmail = null;
      }
      $.getJSON('ManagementServlet', {action: 'getFileLineChart',
          fileHash: fileHash, salesmanEmail: sp.config.salesman.email, customerEmail: customerEmail}, function(data) {
            
        if (typeof sp.chart.fileLine !== 'undefined') {
          sp.chart.fileLine.destroy();
          $('#lineChart').remove();
          $('#sp-line-chart-container')
              .append('<canvas id="lineChart" height="354" width="760" style="width: 760px; height: 354px;"></canvas>');
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
          $('#lineChart2').remove();
          $('#sp-line-chart-2-container')
              .append('<canvas id="lineChart2" height="354" width="760" style="width: 760px; height: 354px;"></canvas>');
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
    getFileVisitorsMap: function(fileHash, customerEmail) {
      if (typeof customerEmail == 'undefined') {
        customerEmail = null;
      }
      $.getJSON('ManagementServlet', {action: 'getFileVisitorsMap',
          fileHash: fileHash, salesmanEmail: sp.config.salesman.email, customerEmail: customerEmail}, function(data) {
       
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
            colors: ['#00AC8A', '#00AC8A']
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
        
        $(window).on('resize', function() {
          sp.chart.visitorsMap = new google.visualization.GeoChart(document.getElementById('sp-google-geochart'));
          sp.chart.visitorsMap.draw(mapData, options);
        });
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
        
        if (typeof filesData[0] == 'undefined') {
          sp.table.filesData = $('#sp-files-data__table').DataTable()
            .clear()
            .draw();
          return false;
        }
        
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
  
  /**
   * This object handles the wizard where a user can choose customers 
   * and documents they'd like to send them 
  */
  
  customerFileLinksGenerator : {
    /**
     * This function is the configuration for the wizard - @see jQuery Steps www.jquery-steps.com/
     * Immediatley invoked i.e. when the page loads - this is because initialising the jQuery steps
     * causes bugs that stop it from working
     * @returns false or true, which highlights the current index of the wizard, allowing for errors to be
     *          thrown if the user has not checked a box, and wants to move to the next part
     */
    wizardConfig : (function() {
      $('#document-wizard').steps({
        headerTag : 'h3',
        bodyTag : 'section',
        transitionEffect : 'slideLeft',
        autoFocus : true,
        onStepChanging: function (event, currentIndex, newIndex){
          if (currentIndex > newIndex){
            return true;
          };
          $('.sp-customer-table').DataTable()
          .search('').draw();
  
          $('.sp-doc-table').DataTable()
          .search('').draw();
          
          if (0 === currentIndex && (!$('.sp-customer-table tbody input[type="checkbox"]').is(':checked'))){
            sp.error.handleError('You must select at least one customer to continue');
            return false;
          }
          else if (1 === currentIndex && (!$('.sp-doc-table tbody input[type="checkbox"]').is(':checked'))) {
            sp.error.handleError('You must select at least one document to continue');
            return false;
          }
          else {
            return true;
          };
        },
      });
    })(),
    
    /**
     * This function formats and prints customers to the document sending wizard using DataTables API
     * @params {data - object} This is the data on the customers recevied from the server
     * This object contains both customer and file data @see sp.customerFileLinks.formatFile()
     */
    formatCustomers : function(data) {
      var nameArr = [];
      $.each(data['customersList'], function (i, v) {
        var obj = {
            'checkbox' : '<input id= ' + 'checkbox' + i + ' type="checkbox" class="i-checks" name="input[]">',
            'name' : v[0] + ' ' + v[1],
            'company' : v[2],
            'email' : '<span data-email=' + v[3] +' class="sp-email"> ' + v[3] + '</span>'
        };
        nameArr.push(obj);
      });
      if (!($.fn.dataTable.isDataTable('.sp-customer-table'))) {
        $('.sp-customer-table').DataTable({
          data: nameArr,
          columns: [
            {data: 'checkbox' },
            {data: 'name' },
            {data: 'company' },
            {data: 'email' },
          ],
          paging: false,
        });
      }
      else {
        $('.sp-customer-table').DataTable()
        .clear()
        .rows.add(nameArr)
        .draw();
      }
      $('.content').css('overflow-y', 'scroll');
      /**
       * $('.content') is the selector on the section object within the wizard
       * @see the same in sp.customerFileLinks.formatFile() 
       */
    },
    
    /**
     * This function ensure the wizard is always at the top, the scrollbar often
     * makes this not possible
     */
    scrollTop: $(function () {
      $('#document-wizard-t-0, #document-wizard-t-1, #document-wizard-t-2, a[href="next"], a[href="previous"]')
          .on('click', function () {
            $('.content').animate({scrollTop: 0}, 1, 'linear');
          });
      }),
    
    /**
     * This function formats and renders documents to the wizard, using the DataTables API
     * @params {data-obj} - This is the files data received from the server
     */
    formatFile: function (data){
      var fileArr = [];
      $.each(data['filesList'], function (i, v) {
        var obj = {
            'checkbox' : '<input id= ' + 'checkbox' + i + ' type="checkbox" class="i-checks" name="input[]">',
            'name' : '<span class="sp-doc-name" data-file-name=' + v[1] +' data-file-hash=' + v[0] +'>' + v[1] + '</span>',
            'date' : '<span>' + v[2] + '</span>',
        };
        fileArr.push(obj);
      });
      if (!($.fn.dataTable.isDataTable('.sp-doc-table'))) {
        $('.sp-doc-table').DataTable({
          data: fileArr,
          columns: [
            {data: 'checkbox' },
            {data: 'name'},
            {data: 'date'},
          ],
          
          paging: false,
        });
      }
      else {
        $('.sp-doc-table').DataTable()
        .clear()
        .rows.add(fileArr)
        .draw();
      }
      $('.content').css('overflow-y', 'scroll');
      
      sp.customerFileLinksGenerator.toggleBtnAttr();
    },

    toggleBtnAttr: function () {
      if ($('li.current').text() === 'current step: 2. Select Documents'){ 
          $('a[href="#next"]').attr('id', 'sp-send-docs__button');
      };
    },

    /**
     *  Listener to save which boxes have been checked i.e. which documents the
     *  user wants to send, and to whom.
     *  $('#document-wizard-t-x') is a selector on the inspinia wizard object
     *        @see http://webapplayers.com/inspinia_admin-v2.5/form_wizard.html#
     *  $('a[href="next"]') is also an INSPINIA generated selector
     */
   
    checkboxListener: (function () {            
      $('#document-wizard-t-2').addClass('sp-enumerate-customers-files__button');
      $('#document-wizard-t-1').addClass('sp-enumerate-customers-files__button');
      $('#sp-send-docs__button').addClass('sp-enumerate-customers-files__button');
      $('.sp-enumerate-customers-files__button').on('click', function (e) { 
        
        // This checks If wizard-step is document selector tab in order to start saving the
        // chosen sections.
        if ($('li.current').text() === 'current step: 3. Send Documents'){  
          var customerArr = [];
          var fileArr = [];
          var files = [];
          
          $('.sp-customer-table').DataTable()
                    .search('').draw();
          
          $('.sp-doc-table').DataTable()
                    .search('').draw();
         
          //This saves all the chosen email addresses.
          $(':checked').closest('tr').find('[data-email]').each(function (i, v) {
            var email = $(this).text();
            customerArr.push(email.slice(1, email.length));
          });
       
          // This saves all the document hashes & file names into a file array, and
          // a files object.
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

    /**
     * Create obj to send.
     * Each email address becomes attached to all the documents
     */
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
    
    // This function collects the choices the customer has made for the email addresses to which he will
    // send the documents.
    renderCustomerChoice: function (data, files) {
      var fileLink;
      $('.sp-send-table tbody tr').remove();
      $.each(data['customersFilelinks'], function (i, val) {
      // This creates the initial bootstrap layout.
        $('.sp-send-table tbody').append(
            '<tr class="sp-mail-table__row" id="sp-t-row' + i + '">'
          + '<td class="col-sm-2 sp-customer">' + val['customerEmail'] +'</td>'
          + '<td id="sp-doc-'+ i +'" class="col-sm-6 sp-document"></td>'
          + '</tr>'
        );
        
        $.each(val['files'], function (index, v) {
            fileLink = sp.config.viewerUrlWithoutFileLink + v['fileLink'];
            // This renders the information into the predefined rows.
            $('.sp-send-table tbody #sp-t-row' + i + ' #sp-doc-' + i).append(
                '<div class="row">'
                  + '<div class="col-md-5" data-file-hash=' + v['fileHash'] +'></div>'
                  + '<div data-file-link-hash="'+ fileLink +'" class="col-md-7 sp-file-link">' + fileLink + '</div>'
              + '</div>'
              
           );        
          sp.customerFileLinksGenerator.findDocumentName(v['fileHash'], files);
        });
      });
      // This creates the copy all and send all buttons.
      $('.sp-mail-table__row').append(
            '<td id="sp-wizard-action-btns-container" class="col-sm-2 row">'
              + '<div id="sp-copy-button-container" class="col-md-6">'
                + '<button class="btn btn-white sp-mail-all__button btn-xs sp-copy-all sp-cmd-all__button">'
                  + '<i class="fa fa-copy sp-mail__icon"></i> Copy'
                + '</button>' 
              + '</div>'
              + '<div class="col-md-6">' 
                  + '<button class="btn btn-white sp-send-to-all__button sp-send-options btn-xs sp-mail-all__button sp-send-all sp-cmd-all__button">'
                    + '<i class="fa fa-envelope sp-mail__icon"></i> Send'
                  + '</button>'
              + '</div>'
          + '</td>'          
      );
 
      sp.customerFileLinksGenerator.sendAll();
      sp.customerFileLinksGenerator.copyAll();
    },

    copyAll: function () {
      /**
       * This function allows the user to copy all documents being
       * sent to a particular email address
       * Uses clipboard js https://clipboardjs.com/
       * @returns the array of links that need to be copied
       */
      
      $('.sp-copy-all').on('click', function () {
        var links = [];
        $(this).closest('tr').find('div[data-file-link-hash]').each(function (i, v){
          links.push($(this).text() + '\r\n');
          });
        
        new Clipboard('.sp-copy-all', {
          text: function(target) {
            target = '';
            $.each(links, function (i, v){
              target += v;
            });
            return target;
     
          }
        });
      });
    },
    
    /**
     * This function opens a mail window to a particular email address with all
     * documents in the body. The subject and body are encoded as some mail 
     * clients have issues rendering the unencoded information
     */
    sendAll: function () {
      $('.sp-send-all').on('click', function () {
        var emailRecipient = $(this).closest('tr').children('td.sp-customer').text();
        
        // This will create an array of file links.
        var links = [];
        $(this).closest('tr').find('div[data-file-link-hash]').each(function(i, v) {
          links.push($(this).text()); 
        });
        
        // This creates an array of filenames.
        var fileNames = [];
          $(this).closest('tr').find('[data-file-hash]').each(function(i, v) {
            fileNames.push($(v).text());
          });  
          
          
        var mailBody = '';
        $.each(fileNames, function (i, v) {
            
            mailBody += v + ' - ' + links[i] + '\r\n';
           });
        
        //This dynamically creates the email subject with the salesman email and their company.
        var mailSubject = sp.config.salesman.name.split(" ")[0] + ' from ' + sp.config.salesman.company
        + ' has sent you a document'; 
        
        window.open(
          'mailto:' + emailRecipient
        + '?subject=' + encodeURIComponent(mailSubject) 
        + '&body=' + encodeURIComponent('Please follow these links to view the PDFs: ' + '\r\n' + mailBody)
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
        if (v['hash'] === hash){
          $('[data-file-hash=' + hash + ']').text(v['name']);
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
  },
  
  user: {
    /**
     * This function allows the user to change their password
     * It has a series of verifications: whether the old password is correct,
     * whether the new password is a blank field, and whether the new password
     * matches the retyped new password.
     */
    changePassword: $(function () {
        $('.sp-change-pwd__li').on('click', function () {
          $('#sp-old-password').val('');
          $('#sp-new-password').val('');
          $('#sp-retype-password').val('');
          setTimeout(function () {
            $('input#sp-old-password').focus(); 
          },1);
          
        });
      
        $('#sp-change-pwd__button').on('click', function () {
          var oldPwd = $('#sp-old-password').val();
          var newPwd = $('#sp-new-password').val();
          var retypePwd = $('#sp-retype-password').val();
          
          if ($('#sp-new-password').val() === '') {
            sp.error.handleError('Your password field cannot be blank');
          }
          else {
            
            if (sp.config.salesman.password === oldPwd) {
              if (newPwd !== retypePwd){
                sp.error.handleError('Your passwords do not match');
              }
              else {
                var data = {
                    action: 'changeSalesmanPassword',
                    email: sp.config.salesman.email,
                    oldpassword: oldPwd,
                    newpassword: newPwd
                };
                
                $.ajax({
                  url: 'ManagementServlet',
                  type: 'post',
                  contentType : 'application/json; charset=utf-8',
                  dataType: 'json',
                  data: JSON.stringify(data),
                  success: function (res) {
                    if (res) {
                      sp.user.updateConfigSettings();
                      swal(
                        'Success',
                        'Your password has been changed',
                        'success'
                      );
                      // Close modal after pwd change
                      $('.sr-only').click();
                    }
                    else {
                      sp.error.handleError('There was an error');
                    }
                  },
                  error: function (err) {
                    console.log(err);
                    sp.error.handleError('There was an error, your password was not changed');
                  }
                   
                });
            }
           
            }
            else {
              sp.error.handleError('Retype your old password');
            }
          }
        });
    }),
    
    setDocSettings: $(function () {
      
      $('#sp-save-doc-settings-changes').on('click', function () {
        var docSettingsData = {
            'action': 'setSalesmanDocumentSettings',
            'isChatEnabled': $('#sp-enable-chat__checkbox').is(':checked'),
            'isAlertEmailEnabled': $('#sp-enable-alert-emails__checkbox').is(':checked'),
            'isReportEmailEnabled': $('#sp-enable-report-emails__checkbox').is(':checked'),
            'salesMan': sp.config.salesman.email
        };
        
        $.ajax({
          url: 'ManagementServlet',
          type: 'post',
          data: JSON.stringify(docSettingsData),
          success: function (data) {
            $('#sp-document-settings__modal .sr-only').click();
            sp.user.updateConfigSettings();
            swal(
              'Success!',
              'Your changes have been saved',
              'success'
            );
          },
          error: function (err) {
            console.log(err);
            swal(
              'Error!',
              'Your changes were not saved',
              'error'
            );
          }
        });
        
      });
    }),
    
    getSalesmanDocSettings: $(function () {
        
        $('[data-target="#sp-document-settings__modal"]').on('click', function () {
          var enabledChat = (sp.config.salesman.viewer_is_chat_enabled === "true") ? true: false;
          $('#sp-enable-chat__checkbox').prop('checked', enabledChat);
          $('#sp-enable-alert-emails__checkbox').prop('checked', sp.config.salesman.email_alert_enabled);
          $('#sp-enable-report-emails__checkbox').prop('checked', sp.config.salesman.email_report_enabled);
        }); 
    }),
    
    updateConfigSettings: function () {
      $.getJSON('config', {salesmanEmail: Cookies.get('SalesmanEmail')}, function(data) {
        sp.config = data;
      });
    },
  },

  view: {
    salesAnalytics: {
      setNavBar: function(sortChoice) {
        $.getJSON(
            'ManagementServlet',
            {
              action: 'getCustomersFilesList',
              salesmanEmail: sp.config.salesman.email,
              sortChoice: sortChoice
            },
            function(data) {
              var customersFilesList = data.customersFilesList;
              if (0 < customersFilesList.length) {
                
                // Arrange the data for future processing.
                var customers = {};
                $.each(customersFilesList, function(i, v) {
                  if (typeof customers[v[0]] == 'undefined') { 
                    customers[v[0]] = {
                      customerName: v[1],
                      files: [],
                    };
                  };
                  
                  var file = {
                    fileName: v[3],
                    fileHash: v[2],
                  };
                  
                  customers[v[0]]['files'].push(file);
                });
                
                // Build the nav bar.
                $('#sp-nav-sales-analytics__li')
                    .empty()
                    .append(
                          '<a aria-expanded="true"><i class="fa fa-bar-chart"></i> '
                        + '<span class="nav-label">Sales Analytics</span></a>'
                        + '<span class="fa arrow"></span>'
                        + '<ul id="sp-sales-analytics__ul" class="nav nav-second-level sp-sales-search-list">'
                        + '<div class="sp-sort-search-cont">'
                        + '<div class="sp-search-container">'
                          + '<span><input id="sp-sales-search__input" type="text" placeholder="Search" class="sp-nav-search__input"></span>'
                        + '</div>'
                        + '<div class="sp-sort-list">'
                          + '<span class="sp-clickable sp-sort sp-sort-options-toggle"><i class="fa fa-sort-amount-asc" aria-hidden="true"></i></i><i class="fa fa-caret-down sp-sort-toggle__icon" aria-hidden="true"></i></span>'
                        + '</div>'  
                        + '<div>'
                        + '<li data-sort="customerName" class="sp-sort-option__li sp-sales-sort"><span class="sp-sort-option__a">Sort by Customer Name</span></li>'
                        + '<li data-sort="performance" class="sp-sort-option__li sp-sales-sort"><span class="sp-sort-option__a">Sort by Performance</span></li>'                      
                        + '</div>'
                      + '</div>'
                    );
                
                $.each(customers, function(i, v) {
                  $('#sp-nav-sales-analytics__li > ul')
                      .append('<li class="sp-analytics-customer-name__li"><a class="sp-word-wrap" data-customer-email="' + i + '">' + v.customerName + '</a></li>')
                      .append('<ul class="nav nav-third-level" data-customer-email="' + i + '">');
                  
                  $.each(v.files, function(j, u) {
                    $('#sp-nav-sales-analytics__li ul ul[data-customer-email="' + i + '"]')
                        .append('<li class="sp-sales-analytics-filename__li"><a class="sp-customer-file__a sp-word-wrap" data-customer-email="'
                            + i + '" data-file-hash="' + u.fileHash + '">' + u.fileName + '</a></li>');
                  });
                });
                
                //Search and Sort
                sp.view.salesAnalytics.search();
                sp.view.salesAnalytics.sort();
                
                /**
                 * CSS overflow styling
                 */
                var scrollCont = $('<div></div>', {class: 'sp-analytics-container__div', id: 'sp-sales-analytics-scroll'});
                $('#sp-nav-sales-analytics__li').append(scrollCont);
                scrollCont.append($('#sp-sales-analytics__ul'));
                
                // A workaround for metisMenu dysfunctionality.
                $('#sp-nav-sales-analytics__li ul li:has(a[data-file-hash="' + customersFilesList[0][2]
                    + '"][data-customer-email="' + customersFilesList[0][0] + '"]) a')
                        .css('color', '#fff');
                sp.view.salesAnalytics.setMetrics(customersFilesList[0][0], customersFilesList[0][2]);
              }
            }
         );
      },
      
      search: function () {
        /**
         * Search sales analytics
         * The document names are hidden
         */
        $('.sp-sales-search-list >li > a').each(function(){
          // Add data-search-term attribute to customers their their corresponding
          // file names
          $(this).attr('data-search-term', $(this).text().toLowerCase());
          $(this).parent().next('ul').find('a').each(function (i, v) {
            $(v).attr('data-search-term', $(this).text().toLowerCase());
            });
          });
        $('#sp-sales-search__input').on('keyup', function(){
          var searchTerm = $(this).val().toLowerCase();
              $('.sp-sales-search-list > li > a').each(function() {
                  if ($(this).is('[data-search-term *= ' + searchTerm + ']')) {
                    $(this).show();
                    $(this).parent().next('ul').find('li').show();
                  }
                  else {
                    $(this).hide();
                    $(this).parent().next('ul').find('li').hide();
                  }
                  if (!(searchTerm)){
                    // If search bar is empty display all customers & files
                    $(this).show();
                    $(this).parent().next('ul').find('li').show();
                  }
              });
              
          });
      },
      
      sort: function () {
        /**
         * Init sort capabilities
         * Using 'unbind' and 'bind' because of the yoyo effect on the list - this ensures
         * there are no leftover click handlers
         * 
         * Callback: Toggle the icon caret to up or down
         */
        $('.sp-sort-options-toggle').off('click');
        $('.sp-sort-options-toggle').on('click', function () {
            $('.sp-sort-option__li').slideToggle('slow','swing', function (){
              if (!$('.sp-sort-option__li').is(':hidden')) {
                $('.sp-sort-options-toggle i')
                  .removeClass('.fa fa-caret-down')
                  .addClass('.fa fa-caret-up');
                isDown = false;
              }
              else {
                $('.sp-sort-options-toggle i')
                  .removeClass('.fa fa-caret-up')
                  .addClass('.fa fa-caret-down');
                isDown = true;
              }
            });
        });
        $('.sp-sales-sort').on('click', function () {
          sp.view.salesAnalytics.setNavBar($(this).attr('data-sort'));
        });
        
        // Temp until sorting is possible
        $('[data-sort="performance"]').on('click', function () {
          swal('We\'re working on it!', 'Sorting by performance will be with you soon');
        });
      },
      
      setMetrics: function(customerEmail, fileHash) {
        $.getJSON(
            'ManagementServlet',
            {
              action: 'getFilesCustomerData',
              salesmanEmail: sp.config.salesman.email,
              customerEmail: customerEmail,
            },
            function(data) {
              var files = [];
              $.each(data.filesCustomerData, function(i, v) {
                files[v[0]] = v;
              });
             
              // Build dashboard.
              sp.metric.getFileMetrics(files[fileHash]);
              sp.chart.getFileLine(fileHash, customerEmail);
              sp.chart.getFileBar(fileHash, customerEmail);
              sp.chart.getFileVisitorsMap(fileHash, customerEmail);
              var filesArray = [files[fileHash]];
              if (typeof filesArray[0] != 'undefined') {
                filesArray[0][8] = null;
              }
              sp.table.getFilesTable(filesArray);
              
              // Hide unavailable yet metrics, charts, and table.
              $('.sp-metric-top-exit-page, .sp-chart-performance-benchmark').hide();
            }
        );
      }
    },
    marketingAnalytics: {
      search: function () {
        /**
         * Search functionality on navbar 
         */
        $('.sp-search-list a').each(function (i, v) {
          $(v).attr('data-search-term', $(v).text().toLowerCase());
          });
        $('#sp-search-box').on('keyup', function () {
          var searchTerm = $(this).val().toLowerCase();
              $('.sp-search-list a').each(function(){
                  if ($(this).is('[data-search-term *= ' + searchTerm + ']')) {
                      $(this).show();
                  } else {
                      $(this).hide();
                  }
                  if (!(searchTerm)) {
                      $(this).show();
                  }
              });
          });
        
      },
      sort: function () {
        /**
         * Init sort capabilities
         * Using 'unbind' and 'bind' because of the yoyo effect on the list - this ensures
         * there are no leftover click handlers
         * 
         * Callback: Toggle the icon caret to up or down
         */
        $('.sp-sort-options-toggle').off('click');
        $('.sp-sort-options-toggle').on('click', function () {
            $('.sp-sort-option__li').slideToggle('slow','swing', function (){
              if (!$('.sp-sort-option__li').is(':hidden')) {
                $('.sp-sort-options-toggle i')
                  .removeClass('.fa fa-caret-down')
                  .addClass('.fa fa-caret-up');
                isDown = false;
              }
              else {
                $('.sp-sort-options-toggle i')
                  .removeClass('.fa fa-caret-up')
                  .addClass('.fa fa-caret-down');
                isDown = true;
              }
            });
        });
      },
      
    }
  }
};
// End sp.

$(document).ready(function() {
  // Init js tooltip
  $('[data-toggle="tooltip"]').tooltip({delay: {show: 100, hide: 200}, placement: 'auto' }); 
  
  $('#send_email_to_customers').css('visibility', 'visible');

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
