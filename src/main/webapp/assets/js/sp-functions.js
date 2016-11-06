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
              sp.metric.getViewerWidgetMetrics(files[fileHash]);
              sp.chart.getFileLine(fileHash);
              sp.chart.getFileBar(fileHash);
              sp.chart.getFilePerformance(fileHash);
              sp.chart.getFileVisitorsMap(fileHash);
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
            Cookies.remove('SalesmanEmailBase64');
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
          

          /**
           * Notifications init.
           * 
           * Run on init, then every minute.
           */
          (function() {
            sp.notifications.init();
            
            setInterval(function() {
              sp.notifications.init();
            }, 60000);
          })();
          
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
                $('#document-wizard-t-0').click();
                sp.file.getCustomersList(requestOrigin);
                sp.file.getFilesList(requestOrigin);   
                break;
                
              case 'sp-notifications-table':
                sp.notifications.getNotifications(sp.notifications.tableNotifications);
                break;
            }
          }
        });
      }
    });
  })(),
  
  data: {
    
    /**
     * The function gets an array of jQuery objects, and returns
     * an array containig only the empty ones.
     */
    getEmptyJqueryObjects: function(jqueryObjects) {
      var emptyJqueryObjects = [];
      
      $.each(jqueryObjects, function(index, jqueryObject) {
        if ('' === jqueryObject.val()) {
          emptyJqueryObjects.push(jqueryObject);
        }
      });
      
      return emptyJqueryObjects;
    }
  },
  
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
      $.each(data['filesList'], function (index, value) {
        
        var date = moment.utc(value[2]).toDate();
        var obj = {
            'date': moment(date).format('DD-MM-YYYY HH:mm'),
            'document': '<span class="sp-file-mgmt-file-name" data-file-hash="' + value[0] + '">' + value[1] + '</span>',
            'options': '<span>'
		                    + '<a><span class="label label-primary sp-file-update" data-toggle="modal" data-target="#sp-modal-update-file" data-file-hash="' + value[0] + '">Update</span></a>'
		                    + '<a href="#"><span class="label label-danger sp-file-delete" data-file-hash="' + value[0] + '">Delete</span></a></span>'
		                    + '<a><span data-toggle="modal" data-target="#sp-viewer-widgets-modal" style="margin-left: 10px;" class="label label-success sp-file-customize" data-file-hash="' + value[0] + '">Customize</span></a>'
		                    + '<a class="sp-preview-file-link"><span id="sp-preview-file-' + index + '" style="margin-left: 10px;" class="label label-warning">Preview</span></a></span>'
        };           
        filesArr.push(obj);
        
        sp.file.setFileLinkAttribute(
		      value[0],
		      'test@example.com',
		      sp.config.salesman.email,
		      'sp-preview-file-' + index
		    );
      });
      
      $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
      if (!($.fn.dataTable.isDataTable('#sp-files-management'))) {
        $('#sp-files-management').DataTable({
          data: filesArr,
          columns: [
            {data: 'date'},
            {data: 'document'},
            {data: 'options'},
          ],
          scrollY: '55vh',
          scrollCollapse: true,
          paging: false,
          order: [0, 'desc'],
          initComplete: function(settings) {
           $('.sp-table-date__info').tooltip({
              'container': 'body'
           });  
          }
        });
      }
      else {
        $('#sp-files-management').DataTable()
          .clear()
          .rows.add(filesArr)
          .columns.adjust()
          .draw();
      }
      
      $('a[href="#tab-1"]').on('shown.bs.tab', function () {
        $('#sp-files-management').DataTable().columns.adjust();
      });
      
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
      
      /**
       * Open preview document.
       */
      $('.sp-preview-file-link span').on('click', function() {
    		window.open($(this).attr('data-file-link')); 
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
        
        var date = moment.utc(row[4]).toDate();
        var obj = {
            'date': moment(date).format('DD-MM-YYYY HH:mm'),
            'name':  '<span id="sp-customer-first-name__td">' + row[0] + '</span> <span id="sp-customer-last-name__td">' + row[1] + '</span></span>' ,
            'company': '<span id="sp-customer-company__td">' + row[2] + '</span>',
            'email':  '<span class="contact-type"><i class="fa fa-envelope"> </i></span>' + '         '  + row[3] + '',
            'options': '<td><a href="#"><span class="label label-primary sp-add-update-customer sp-customer-update" data-add-update="update" data-toggle="modal" data-target="#sp-modal-add-update-customer" data-customer-email="' + row[3] + '">Update</span></a><a href="#"><span class="label label-danger sp-customer-delete" data-customer-email="' + row[3] + '">Delete</span></a></td>'
        };
        nameArr.push(obj);
      });
      
      $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
      if (!($.fn.dataTable.isDataTable('#sp-customers-management'))) {
        $('#sp-customers-management').DataTable({
          data: nameArr,
          columns: [
            {data: 'date'},        
            {data: 'name'},
            {data: 'company'},
            {data: 'email'},
            {data: 'options'}
          ],
          scrollY: '55vh',
          scrollCollapse: true,
          paging: false,
          order: [[0, 'desc']],
          initComplete: function(settings) {
            $('.sp-tooltip-test').tooltip({
               'container': 'body'
            });  
           }
        });
      }
      else {
        $('#sp-customers-management').DataTable()
          .clear()
          .rows.add(nameArr)
          .columns.adjust()
          .draw();
      }
      
      // init tooltip
      $('.sp-file-clock').tooltip({delay: {show: 100, hide: 200}, placement: 'right' });
      
      $('a[href="#tab-2"]').on('shown.bs.tab', function () {
        $('#sp-customers-management').DataTable().columns.adjust();
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
            sp.file.getCustomersList('customerFileLinksGenerator');
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
        $('#sp-widget-bounce-rate').text((parseFloat(fileData[4]) * 100).toFixed().toString() + '%');
        
        // Average view duration.
        if (null != fileData[5]) {
          /**
           * @see http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
           */
          var totalSeconds = parseInt(fileData[5], 10);
          
          var hours   = Math.floor(totalSeconds / 3600);
          var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
          var seconds = totalSeconds - (hours * 3600) - (minutes * 60);
          
          if (minutes < 10) {
            minutes = '0' + minutes;
          }
          
          if (seconds < 10) {
            seconds = '0' + seconds;
          }
          
          $('#sp-widget-average-view-duration').text(minutes + ':' + seconds);
        } else {
          $('#sp-widget-average-view-duration').text('N/A');
        }
        
        // Average pages viewed.
        if (null != fileData[6]) {
          $('#sp-widget-average-pages-viewed').text(parseFloat(fileData[6]).toFixed(1));
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
    },
  
    /**
     * Get metrics about the viewer widgets.
     * 
     * @param {object} fileData - Array of data about a file including information such as fileHash and fileLink.
     * (fileData[3] - Number of times a document has been opened)
     *  
     * @param {string} customerEmail - The email address of the customer whose information being requested.
     */
    getViewerWidgetMetrics: function(fileData, customerEmail) {
      if (typeof fileData != 'undefined' && typeof fileData[3] != 'undefined' && parseInt(fileData[3]) > 0) {
        
      	// Total number of YouTube plays.
      	$.getJSON(
          'ManagementServlet',
          {
          	action: 'getVideoWidgetMetrics',
          	customerEmail: customerEmail,
          	fileHash: fileData[0],
          	salesmanEmail: sp.config.salesman.email
          },
          function(data) {
            $('#sp-widget-video-youtube-metric-total-number-plays')
                .text(data['totalNumberYouTubePlays'][0][0]);
          }
        );
      	
      	// Ask a Question widget questions.
        $.getJSON(
          'ManagementServlet',
          {
            action: 'getViewerWidgetAskQuestion',
            customerEmail: customerEmail,
            fileHash: fileData[0],
            salesmanEmail: sp.config.salesman.email
          },
          function(data) {
            $('#sp-widget-ask-question-metric ul.list-group').empty();
            
            var quetions = data.widgetAskQuestion;
            if (quetions.length > 0) {
              $.each(quetions, function(index, value) {
                $('#sp-widget-ask-question-metric ul.list-group').append(
                    '<li class="list-group-item">'
                    + '<p class="sp-widget-ask-question-metric-email"><strong>' + value[2] + '</strong></p>'
                    + '<div class="sp-widget-ask-question-metric-message">' + value[1].replace(/\r\n|\r|\n/g, '<br>') + '</div>'
                    + '<small class="block"><i class="fa fa-clock-o"></i> ' + value[0] + '</small>'
                  + '</li>');
              });
              
              $('#sp-widget-ask-question-metric').show();
            } else {
              $('#sp-widget-ask-question-metric').hide();
            }
          }
        );
        
        // Total number of likes.
        $.getJSON(
    				'ManagementServlet',
    				{
    					action: 'getWidgetLikesCount',
              customerEmail: customerEmail,
              fileHash: fileData[0],
              salesmanEmail: sp.config.salesman.email
    				},
    				function(data) {
    					$('#sp-widget-total-count-likes').text(data.likesCount[0][0]);
    				}
    		);
        
      } else {
        $('#sp-widget-video-youtube-metric-total-number-plays, #sp-widget-total-count-likes').text('N/A');
        $('#sp-widget-ask-question-metric').hide();
      }
    }
  },
  
  chart: {
		averageViewDurationData: {},
		totalViewsData: {},
		performanceBenchmarkData: {},
		
		/**
	    * Resize the charts to fit their .ibox-content container when the window resizes.
	    */
		resizeCharts: (function() {
			var timer = {};
			
			$(window).resize(function() {
				clearTimeout(timer);
				
				timer = setTimeout(function() {
					sp.chart.loadBarChart(sp.chart.averageViewDurationData);
					sp.chart.loadFileLine(sp.chart.totalViewsData);
					sp.chart.loadFilePerformance(sp.chart.performanceBenchmarkData);
				}, 500);
	    });
		})(),
	
    /**
     * Get the file bar chart.
     */
    getFileBar: function(fileHash, customerEmail) {
      if (typeof customerEmail == 'undefined') {
        customerEmail = null;
      }
      $.getJSON(
          'ManagementServlet',
          {
            action: 'getFileBarChart',
            fileHash: fileHash,
            salesmanEmail: sp.config.salesman.email,
            customerEmail: customerEmail
          },
          function(data) {
       	    sp.chart.averageViewDurationData = data;
       	    sp.chart.loadBarChart(data);
          }
       );
    },
      
    loadBarChart: function(data) {
        if (typeof sp.chart.fileBar !== 'undefined') {
          sp.chart.fileBar.destroy();
        }
        
        var canvasHeight = $('#barChart').height();
        var chartContainerWidth = $('#sp-bar-chart-container').closest('.ibox-content').width();
        $('#sp-bar-chart-container')
            .empty()
            .append('<canvas id="barChart" height="' + canvasHeight + '" width="' + chartContainerWidth + '"></canvas>');
      
        var barData = {
            labels: [],
            datasets: [
                {
                  label: "Average view duration per page",
                  backgroundColor: "rgba(26,179,148,0.5)",
                  borderColor: "rgba(26,179,148,0.8)",
                  borderWidth: 1,
                  hoverBackgroundColor: "rgba(26,179,148,0.75)",
                  hoverBorderColor: "rgba(26,179,148,1)",
                  data: []
                }
            ]
        };
        
        if (typeof data.fileBarChart !== 'undefined' && typeof data.fileBarChart[0] !== 'undefined' ) {
          $.each(data.fileBarChart, function(index, value) {
            barData.labels.push(parseInt(value[0]));
            barData.datasets[0].data.push(parseFloat(value[1]).toFixed(1));
          });
        }
        
        var ctx = $('#barChart')[0].getContext('2d');
        
        if ((data.fileBarChart.length * 18) > chartContainerWidth) {
        	ctx.canvas.width = data.fileBarChart.length * 18;
        	
        	// IE & Firefox solution to fix issue where adding a scrollbar adds height to the container.
        	$('.sp-chart__container').height($('#sp-bar-chart-container').height());
        } else {
        	ctx.canvas.width = chartContainerWidth;
        }
        
        sp.chart.fileBar = new Chart.Bar(ctx, {
        	type: 'bar',
        	data: barData,
        	options: {
        		responsive: false,
        		scales: {
      				yAxes: [{
      					ticks: {
      						beginAtZero: true,
      						callback: function(value, index, values) {
                    if (Math.floor(value) === value) {
                      return value;
                    }
                  }
      					}
      				}],
      			},
        		tooltips: {
        			callbacks: {
        				label: function(tooltipItem, data) {
        					return 'Page ' + tooltipItem.xLabel + ': ' + tooltipItem.yLabel + ' sec.';
        				},
        				title: function(tooltipItem, data) {
        					return '';
        				},
        			},
        		},
        		legend: {
        			display: false,
        		},
        	},
        });
    },
    
    /**
     * Get the file line chart.
     */
    getFileLine: function(fileHash, customerEmail) {
      if (typeof customerEmail == 'undefined') {
        customerEmail = null;
      }
      $.getJSON(
			  'ManagementServlet',
			  {
			  	action: 'getFileLineChart',
			    fileHash: fileHash,
			    salesmanEmail: sp.config.salesman.email,
		  	  customerEmail: customerEmail,
			  },
			  function(data) {
	    	  sp.chart.totalViewsData = data;
	    	  sp.chart.loadFileLine(data);
			  }
      );
    },
        
    loadFileLine: function(data) {
        if (typeof sp.chart.fileLine !== 'undefined') {
          sp.chart.fileLine.destroy();
        } 
          
        var chartContainerWidth = $('#sp-line-chart-container').closest('.ibox-content').width();
        var canvasHeight = $('#lineChart').height();
        $('#sp-line-chart-container')
        	.empty()	
            .append('<canvas id="lineChart" height="' + canvasHeight + '" width="' + chartContainerWidth +'"></canvas>');
        
        var lineData = {
            labels: [],
            datasets: [
                {
                  label: 'Total views',
                  backgroundColor: 'rgba(220,220,220,0.5)',
                  borderColor: 'rgba(220,220,220,1)',
                  fill: false,
                  pointBorderColor: 'rgba(220,220,220,1)',
                  pointBackgroundColor: 'rgba(220,220,220,1)',
                  pointBorderWidth: 1,
                  pointHoverRadius: 3,
                  pointHoverBackgroundColor: 'rgba(220,220,220,1)',
                  pointHoverBorderColor: '#fff',
                  pointHoverBorderWidth: 1,
                  pointRadius: 3,
                  pointHitRadius: 1,
                  data: [],
                },
                {
                  label: 'Actual views',
                  backgroundColor: 'rgba(26,179,148,0.5)',
                  borderColor: 'rgba(26,179,148,0.7)',
                  fill: false,
                  pointBorderColor: 'rgba(26,179,148,1)',
                  pointBackgroundColor: 'rgba(26,179,148,1)',
                  pointBorderWidth: 1,
                  pointHoverRadius: 3,
                  pointHoverBackgroundColor: 'rgba(26,179,148,1)',
                  pointHoverBorderColor: '#fff',
                  pointHoverBorderWidth: 1,
                  pointRadius: 3,
                  pointHitRadius: 1,
                  data: []
                }
            ]
        };
          
        if (typeof data.fileLineChart !== 'undefined' && typeof data.fileLineChart[0] !== 'undefined') {
          $.each(data.fileLineChart, function(index, value) {
            dateParts = value[0].split('-');
            lineData.labels.push(dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0]);
            lineData.datasets[0].data.push(parseInt(value[1]));
            lineData.datasets[1].data.push(parseInt(value[2]));
          });
        }
          
        var ctx = $('#lineChart')[0].getContext('2d');
        
        if ((data.fileLineChart.length * 18) > chartContainerWidth) {
        	ctx.canvas.width = data.fileLineChart.length * 18;
        	
        	// IE & Firefox solution to fix issue where adding a scrollbar adds height to the container.
        	$('.sp-chart__container ').height($('#sp-line-chart-container').height());
        } else {
        	ctx.canvas.width = chartContainerWidth;
        }
        
        sp.chart.fileLine = new Chart.Line(ctx, {
        	data: lineData,
        	options: {
        		hover: {
        			mode: 'x-axis',
        		},
        		scales: {
      				yAxes: [{
      					ticks: {
      						beginAtZero: true,
      						callback: function(value, index, values) {
      						  if (Math.floor(value) === value) {
                      return value;
      						  }
      					  }
      					}
      				}],
      			},
        		responsive: false,
        		tooltips: {
        		  enabled: false,
        			mode: 'x-axis',
        			custom: function(tooltip) {
        				
        				// Tooltip Element.
          			var tooltipEl = $('#sp-total-views--tooltip');

          			// Hide if no tooltip.
          			if (tooltip.opacity === 0) {
          				tooltipEl.css('opacity', '0');
          				return;
          			}

          			function getBody(bodyItem) {
          				return bodyItem.lines;
          			}
          			
          			// Set tooltip text.
          			if (tooltip.body) {
          				var tooltipTitles = tooltip.title || [];
          				var tooltipBody = tooltip.body.map(getBody);
          				
          				var innerHtml = '<thead>';
          				$.each(tooltipTitles, function() {
          					innerHtml += '<tr><th>' + this + '</th></tr><br>';
          				});
          				
          				innerHtml += '</thead><tbody>';
          				
          				$.each(tooltipBody, function(index, body) {
          					var colors = tooltip.labelColors[index];
          					var style = 'background:' + colors.backgroundColor + '; border-color:' + colors.borderColor;
          					var tooltipColorKey = '<span class="sp-chart__chartjs-tooltip-color-key" style="' + style + '"></span>';
          					
          					innerHtml += '<tr><td>' + tooltipColorKey + body + '</td></tr><br>';
          				});
          				
          				innerHtml += '</tbody>';
          				tooltipEl.html(innerHtml);
          			}
          			
          			var chartLeftPosition = $('#sp-line-chart-container').offset().left;
          			
          			// Display, position, and set styles for font.
          			tooltipEl.css({
          				'opacity': '1',
          				'left':  (event.pageX - chartLeftPosition) + 'px',
          				'top': tooltip.y,
          				'font-family': tooltip._bodyFontFamily,
          				'font-size': tooltip.bodyFontSize,
          				'font-style': tooltip._bodyFontStyle,
          				'padding': tooltip.yPadding + 'px ' + tooltip.xPadding + 'px'
          			});
        			},
        		},
        	},
        });
    },
    
    /**
     * Get the file performance chart.
     */
    getFilePerformance: function(fileHash) {
      $.getJSON(
		  'ManagementServlet',
		  {
			  action: 'getFilePerformanceChart',
			  fileHash: fileHash,
			  salesmanEmail: sp.config.salesman.email
		  },
		  function(data) {
			  sp.chart.performanceBenchmarkData = data;
			  sp.chart.loadFilePerformance(data);
		  }
	  );
    },
      
    loadFilePerformance: function(data) {
        if (typeof sp.chart.filePerformance !== 'undefined') {
          sp.chart.filePerformance.destroy();
        }  
          
        var canvasHeight = $('#lineChart2').height();
        var chartContainerWidth = $('#sp-line-chart-2-container').closest('.ibox-content').width();
        $('#sp-line-chart-2-container')
            .empty()		 
            .append('<canvas id="lineChart2" height="' + canvasHeight + '" width="' + chartContainerWidth + '"></canvas>');
        
        var lineData = {
            labels: [],
            datasets: [
                {
                  label: 'Maximum',
                  backgroundColor: 'rgba(255, 156, 71 ,0.7)',
                  borderColor: 'rgba(255, 156, 71 ,0.7)',
                  fill: false,
                  pointBorderColor: 'rgba(255, 156, 71 ,0.7)',
                  pointBackgroundColor: 'rgba(255, 156, 71 ,0.7)',
                  pointBorderWidth: 1,
                  pointHoverRadius: 3,
                  pointHoverBackgroundColor: 'rgba(255, 156, 71 ,0.7)',
                  pointHoverBorderColor: '#fff',
                  pointHoverBorderWidth: 1,
                  pointRadius: 3,
                  pointHitRadius: 1,
                  data: []
                },
                {
                  label: 'Average',
                  backgroundColor: 'rgba(30, 166, 129, 0.7)',
                  borderColor: 'rgba(30, 166, 129, 0.7)',
                  fill: false,
                  pointBorderColor: 'rgba(30, 166, 129, 0.7)',
                  pointBackgroundColor: 'rgba(30, 166, 129, 0.7)',
                  pointBorderWidth: 1,
                  pointHoverRadius: 3,
                  pointHoverBackgroundColor: 'rgba(30, 166, 129, 0.7)',
                  pointHoverBorderColor: '#fff',
                  pointHoverBorderWidth: 1,
                  pointRadius: 3,
                  pointHitRadius: 1,
                  data: []
                },
                {
                  label: 'Document',
                  backgroundColor: 'rgba(26, 111, 186, 0.7)',
                  borderColor: 'rgba(26, 111, 186, 0.7)',
                  fill: false,
                  pointBorderColor: 'rgba(26, 111, 186, 0.7)',
                  pointBackgroundColor: 'rgba(26, 111, 186, 0.7)',
                  pointBorderWidth: 1,
                  pointHoverRadius: 3,
                  pointHoverBackgroundColor: 'rgba(26, 111, 186, 0.7)',
                  pointHoverBorderColor: '#fff',
                  pointHoverBorderWidth: 1,
                  pointRadius: 3,
                  pointHitRadius: 1,
                  data: []
              }
            ]
        };

  	  	var individualPerformanceFileName = '';
  	  	
  	  	/**
  	  	 * This will contain key:value pairs of {date: fileName} e.g. 22-10-16: myfile.pdf
  	  	 */
  	  	var dateToFileNameMap = {};
  	  	
        if (typeof data.filePerformanceChart !== 'undefined' && typeof data.filePerformanceChart[0] !== 'undefined') {
          $.each(data.filePerformanceChart, function(index, value) {
        	  
          	individualPerformanceFileName = value[5];
        	  
            dateParts = value[0].split('-');
            var date = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0];
            lineData.labels.push(date);
            
            dateToFileNameMap[date] = value[4];
            
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

        if ((data.filePerformanceChart.length * 18) > chartContainerWidth) {
        	ctx.canvas.width = data.filePerformanceChart.length * 18;
        	
        	// IE & Firefox solution to fix issue where adding a scrollbar adds height to the container.
        	$('.sp-chart__container').height($('#sp-line-chart-2-container').height());
        } else {
        	ctx.canvas.width = chartContainerWidth;
        }
        
        sp.chart.filePerformance = new Chart.Line(ctx, {
        	data: lineData,
        	options: {
        		hover: {
        			mode: 'x-axis',
        		},
        		scales: {
      				yAxes: [{
      					ticks: {
      						beginAtZero: true,
      						callback: function(value, index, values) {
                    if (Math.floor(value) === value) {
                      return value;
                    }
                  }
      					}
      				}],
      			},
        		responsive: false,
        		tooltips: {
        			enabled: false,
            	mode: 'x-axis',
              custom: function(tooltip) {
              	
              	// Tooltip Element.
          			var tooltipEl = $('#sp-performance-benchmark--tooltip');

          			// Hide if no tooltip.
          			if (tooltip.opacity === 0) {
          				tooltipEl.css('opacity', '0');
          				return;
          			}
          			
          			function getBody(bodyItem) {
          				return bodyItem.lines;
          			}
          			
          			// Set tooltip text.
          			if (tooltip.body) {
          				var tooltipTitles = tooltip.title || [];
          				var tooltipBody = tooltip.body.map(getBody);
          				
          				var innerHtml = '<thead>';
          				$.each(tooltipTitles, function() {
          					innerHtml += '<tr><th>' + this + '</th></tr><br>';
          				});
          				
          				innerHtml += '</thead><tbody>';
          				
          				$.each(tooltipBody, function(index, body) {
          					var colors = tooltip.labelColors[index];
          					var style = 'background:' + colors.backgroundColor;
          					style += '; border-color:' + colors.borderColor;
          					style += '; border-width: 2px'; 
          					var tooltipColorKey = '<span class="sp-chart__chartjs-tooltip-color-key" style="' + style + '"></span>';
          					var fileData = '';
          					
          					switch(index) {
	          					case 0:
	          						var fileName = '';
	          						
	          						$.each(dateToFileNameMap, function(date, file) {
	          							if (tooltip.title.toString() === date) {
	          								fileName = file;
	          							}
	          						});
	          						
	          						// Max Performance.
	          						fileData = fileName + ': ' + body[0].split(':').pop();	
	          						break;
          						
	          					case 1:
	          						
	          						// Average.
	          						fileData = body;
	          						break;
          					
	          					case 2:
	          						
	          						// Current document.
	          						fileData = individualPerformanceFileName + ': ' + body[0].split(':').pop();	
	          						break;
          					}
          						
          					innerHtml += '<tr><td>' + tooltipColorKey + fileData + '</td></tr><br>';
          				});
          				
          				innerHtml += '</tbody>';
          				tooltipEl.html(innerHtml);
          			}
          			
          			var chartLeftPosition = $('#sp-line-chart-2-container').offset().left;
          			
          			// Display, position, and set styles for font.
          			tooltipEl.css({
          				'opacity': '1',
          				'left':  (event.pageX - chartLeftPosition) + 'px',
          				'top': tooltip.y,
          				'font-family': tooltip._bodyFontFamily,
          				'font-size': tooltip.bodyFontSize,
          				'font-style': tooltip._bodyFontStyle,
          				'padding': tooltip.yPadding + 'px ' + tooltip.xPadding + 'px'
          			});
              },
        		},
          },
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
          },
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
        autoFocus : true,
        bodyTag : 'section',
        enableCancelButton: false,
        enableFinishButton: false,
        headerTag : 'h3',
        transitionEffect : 'none',
        onStepChanging: function (event, currentIndex, newIndex){
          if (currentIndex > newIndex){
            return true;
          };
          
          $('.sp-customer-table').DataTable()
            .search('').draw();
  
          $('.sp-doc-table').DataTable()
            .search('').draw();
          
          if (0 === currentIndex && (! $('.sp-customer-table tbody input[type="checkbox"]').is(':checked'))){
            sp.error.handleError('You must select at least one customer to continue');
            return false;
          } else if (1 === currentIndex && (! $('.sp-doc-table tbody input[type="checkbox"]').is(':checked'))) {
            sp.error.handleError('You must select at least one document to continue');
            return false;
          } else {
            return true;
          };
        },
        onStepChanged: function(event, currentIndex) {
          switch(currentIndex) {
            case 0:
              $('.sp-customer-table').DataTable()
                .columns.adjust().draw();
              break;
              
            case 1:
              $('.sp-doc-table').DataTable()
                .columns.adjust().draw();
              break;
              
            case 2:
              $('.sp-send-table').DataTable()
                .columns.adjust().draw();
              break;
          }
        }
      });
    })(),
    
    /**
     * This function formats and prints customers to the document sending wizard using DataTables API
     * @params {data - object} This is the data on the customers recevied from the server
     * This object contains both customer and file data @see sp.customerFileLinks.formatFile()
     */
    formatCustomers : function(data) {
      var nameArr = [];
      
      $.each(data['customersList'], function (index, value) {
        var date = moment.utc(value[4]).toDate();
        
        var obj = {
            'checkbox' : '<input id= ' + 'checkbox' + index + ' type="checkbox" class="i-checks" name="input[]">',
            'name' : value[0] + ' ' + value[1],
            'company' : value[2],
            'email' : '<span data-email=' + value[3] +' class="sp-email"> ' + value[3] + '</span>',
            'date':  moment(date).format('DD-MM-YYYY HH:mm')
        };
        nameArr.push(obj);
      });
      
      $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
      if (!($.fn.dataTable.isDataTable('.sp-customer-table'))) {
        $('.sp-customer-table').DataTable({
          data: nameArr,
          columns: [
            {data: 'checkbox'},
            {data: 'name'},
            {data: 'company'},
            {data: 'email'},
            {data: 'date'}
          ],
          buttons: [
            {
              action: function(e, dt, node, config) {
                $('#sp-modal-add-update-customer .modal-title').text('Add Customer');
                $('#sp-modal-add-update-customer .modal-sub-title')
                    .text('Fill the fields below and then click on add a customer.');
                $('#sp-modal-add-update-customer__button').text('Add Customer');
                $('#sp-modal-add-update-customer input[type=submit]').val('Add Customer');
                $('#sp-modal-add-update-customer input#add-update').val('add');
                
                $('#sp-modal-add-update-customer input:not(#add-update, [type=submit])').val('');
                $('#sp-modal-add-update-customer input[name="customerEmail"]')
                    .prop('readonly', false);
                
              	$('#sp-modal-add-update-customer').modal();
              },
              className: 'sp-send-email__add-customer',
              text: 'Add a Customer'

            },
          ],
          dom: '<"sp-datatables-search-left"f><"sp-send-email__add-customer"B>ti',
          order: [[4, 'desc']],
          scrollY: '15vh',
          paging: false,
        });
      } else {
        $('.sp-customer-table').DataTable()
          .clear()
          .rows.add(nameArr)
          .draw();
      }
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
      
      $.each(data['filesList'], function (index, value) {
        var date = moment.utc(value[2]).toDate();
        
        var obj = {
            'checkbox' : '<input id= ' + 'checkbox' + index + ' type="checkbox" class="i-checks" name="input[]">',
            'name' : '<span class="sp-doc-name" data-file-name=' + value[1] +' data-file-hash=' + value[0] +'>' + value[1] + '</span>',
            'date' : moment(date).format('DD-MM-YYYY HH:mm'),
        };
        fileArr.push(obj);
      });
      
      $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
      if (!($.fn.dataTable.isDataTable('.sp-doc-table'))) {
        $('.sp-doc-table').DataTable({
          data: fileArr,
          columns: [
            {data: 'checkbox'},
            {data: 'name'},
            {data: 'date'},
          ],
          dom: '<"sp-datatables-search-left"f>ti',
          order: [[2, 'desc']],
          scrollY: '15vh',
          paging: false,
        });
      } else {
        $('.sp-doc-table').DataTable()
          .clear()
          .rows.add(fileArr)
          .draw();
      }
      
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
    

    /**
     * Create 'Send Documents' step in wizard.
     * 
     * Create DataTable of customers, document name, and file links. 
     * The DataTable includes functionality to export the table as a CSV.
     * 
     * @param {object} files - The files data - The file name and fileHash.
     * @param {object} data - The selected customers and the corresponding fileHash and fileLink from the DB.
     */
    renderCustomerChoice: function (data, files) {
      var customerFileLinks = [];
      var dataTableColumns = [];
      
      /**
       * Remove and add the table HTML and reinitialise DataTable.
       * 
       * Selecting documents and customers to be sent creates a table with as many columns, but then selecting
       * another would require more columns. This would be an issue for the DataTable already created, thus it is
       * better to create a new one.
       */
      if ($.fn.dataTable.isDataTable('.sp-send-table')) {
        $('.sp-send-table').DataTable().destroy();
      }
      
      $('#document-wizard-p-2 .table-responsive').remove();
      $('#document-wizard-p-2').append(
        '<div class="table-responsive">' +
          '<table style="width: 100%;" class="table table-striped sp-send-table">' +
              '<thead>' +
                  '<tr id="sp-send-doc-table__header-row">' +
                      '<th>Email Address</th>' +
                      '<th>Document</th>' +
                      '<th>Link</th>' +
                      '<th></th>' +
                  '</tr>' +
              '</thead>' +
              '<tbody></tbody>' +
          '</table>' +
        '</div>'
      );
      
      $.each(files, function(index) {
        $('#sp-send-doc-table__header-row')
          .append('<th>sp-file-name-' + (index + 1) + '</th>')
          .append('<th>sp-file-link-' + (index + 1) + '</th>');
      });
      
      $.each(data.customersFilelinks, function (index, customer) {
        var customerTableData = {};
        
        var documentName = '';
        var documentLink = '';
        $.each(customer.files, function(index, fileData) {
          
          customerTableData.email = '<span class="sp-send-documents__email-address">' + customer.customerEmail + '</span>';
          documentName += 
            '<span class="sp-send-documents__file-name">' + sp.customerFileLinksGenerator.getDocumentName(fileData.fileHash, files) + '</span><br>';
          
          documentLink += 
            '<span class="sp-send-documents__file-link">' + sp.config.viewerUrlWithoutFileLink + fileData.fileLink + '</span><br>';
          
          customerTableData.document = documentName;
          customerTableData.link = documentLink;
          
          customerTableData.copy = '<button class="btn btn-white btn-sm sp-mail-all__button sp-copy-all">' +
                                     '<i class="fa fa-copy sp-mail__icon"></i><span> Copy</span>' +
                                   '</button>';
          
          customerTableData['sp-file-name-' + (index + 1)] = sp.customerFileLinksGenerator.getDocumentName(fileData.fileHash, files);
          customerTableData['sp-file-link-' + (index + 1)] = sp.config.viewerUrlWithoutFileLink + fileData.fileLink;
        });
 
        customerFileLinks.push(customerTableData);
      });
      
      // Create DataTables columns.
      for (key in customerFileLinks[0]) {
        dataTableColumns.push({
          'data': key
        });
      }
      
      /**
       * Set target columns to be exported to CSV.
       * 
       * Include: Column 0 - the customer email.
       *          Hidden columns - sp-file-name-x, and sp-file-link-x.
       */
      var targetColumns = [0];
      for (var i = 4; i < dataTableColumns.length; i++) {
          targetColumns.push(i);
      }
      
      if (! $.fn.dataTable.isDataTable('.sp-send-table')) {
        $('.sp-send-table').DataTable({
          data: customerFileLinks,
          columns: dataTableColumns,
          buttons: [
            {
              extend: 'csv',
              exportOptions: {
                columns: targetColumns
              },
              filename: 'SlidePiper Links',
              text: '<i title="Export links for mass mailing on platforms such as MailChimp" class="fa fa-info-circle sp-clickable sp-send-email__export-info" aria-hidden="true"></i>    Export to CSV'
            },
          ],
          columnDefs: [
            {
              visible: false,
              targets: targetColumns.slice(1, targetColumns.length)
            }
          ],
          dom: '<"sp-datatables-search-left"f>t<"html5buttons"B>i',
          ordering: false,
          paging: false,
          scrollY: '15vh'                  
        });
      }
      
      sp.customerFileLinksGenerator.copyAll();
      $('.sp-send-email__export-info').tooltip({delay: {show: 100, hide: 200}, placement: 'auto' });
    },
    
    
    /**
     * This function allows the user to copy all documents being
     * sent to a particular email address
     * 
     * Uses clipboard js https://clipboardjs.com/
     * @returns the array of links that need to be copied
     */
    copyAll: function () {
      
      $('.sp-copy-all').on('click', function () {
        var links = [];
        $(this).closest('tr').find('.sp-send-documents__file-link').each(function (){
          links.push($(this).text() + '\r\n');
        });
        
        new Clipboard('.sp-copy-all', {
          text: function(target) {
            var target = '';
            $.each(links, function (index, link) {
              target += link;
            });
            
            return target;
          }
        });
      });
    },
    
    /**
     * Get the file name by fileHash.
     * 
     * File-hash is linked to file-name in an object - so name can be retrieved by hash
     * @param {string} hash - the file hash
     * @param {arr of objs} - the file objects containing k/v pair of hash and document name
     * 
     * @returns {string} fileName - The file name.
     */
    getDocumentName: function (hash, files) {
      var fileName = '';
      
      $.each(files, function () {
        if (this.hash === hash){
          fileName = this.name;
        }
      });

      return fileName;
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
          "closeButton": true,
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
            'isAlertEmailEnabled': $('#sp-enable-alert-emails__checkbox').is(':checked'),
            'isReportEmailEnabled': $('#sp-enable-report-emails__checkbox').is(':checked'),
            'isNotificationEmailEnabled': $('#sp-enable-notification-emails__checkbox').prop('checked'),
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
          $('#sp-enable-alert-emails__checkbox').prop('checked', sp.config.salesman.email_alert_enabled);
          $('#sp-enable-report-emails__checkbox').prop('checked', sp.config.salesman.email_report_enabled);
          $('#sp-enable-notification-emails__checkbox').prop('checked', sp.config.salesman.email_notifications_enabled);
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
              sp.metric.getViewerWidgetMetrics(files[fileHash], customerEmail);
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
  $('.sp-doc-settings-info__icon').tooltip({delay: {show: 100, hide: 200}, placement: 'auto' }); 
  
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
