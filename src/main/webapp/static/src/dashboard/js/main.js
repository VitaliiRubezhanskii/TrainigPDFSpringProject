var sp = sp || {};
sp = {
    init: (function(fileHash) {

        $.getJSON('/api/v1/user', function(data) {
            // Start user configuration.
            $('#sp-salesman-full-name strong').text(data.name);

            // Start email configuration.
            var email = data.notificationEmail || data.email;
            $('#sp-document-settings__modal [name=notificationEmail]').val(email);

            if (data.email_alert_enabled) {
                $('#sp-enable-alert-emails__checkbox').prop('checked', true);
            } else {
                $('#sp-enable-alert-emails__checkbox').prop('checked', false);
            }

            if (data.email_notifications_enabled) {
                $('#sp-enable-notification-emails__checkbox').prop('checked', true);
            } else {
                $('#sp-enable-notification-emails__checkbox').prop('checked', false);
            }

            if (data.receiveCustomerEmailEnabled) {
                $('.user__receive-customer-email').prop('checked', true);
            } else {
                $('.user__receive-customer-email').prop('checked', false);
            }
            // End email configuration.
            // End user configuration.
        });

        /**
         * Set the file dashboard.
         */

        setFileDashboard();
        function setFileDashboard() {
            $.getJSON('/api/v1/analytics', {action: 'getFilesList'}, function(data) {
                var filesList = data.filesList;

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
                        + '</div>'
                        + '</div>'
                    );

                    //Without this command, the input field does not focus when clicked on
                    $('#sp-search-box').focus();

                    for (var i = 0; i < filesList.length; i++) {
                        $('#sp-nav-files__li ul').append('<li class="sp-marketing-analytics__li"><a class="sp-word-wrap" data-file-hash="'
                            + filesList[i][0] + '">' + filesList[i][1] + '</a></li>');
                    }

                    // Init search function
                    sp.view.marketingAnalytics.search();

                    // Highlight the <li> clicked on
                    $('.sp-marketing-analytics__li').on('click', function () {
                        $('.sp-marketing-analytics__li').removeClass('active');
                        $(this).addClass('active');
                    });

                    // Temporary solution until sales analytics will show data for all metrics, charts, and table.
                    $('.sp-metric-top-exit-page, .sp-chart-performance-benchmark').show();
                }
            );
        }

        $(document).on('click', '.sp-marketing-analytics__li a', function() {
            var fileHash = this.getAttribute('data-file-hash');
            $.getJSON('/api/v1/analytics?action=getFileData&fileHash=' + fileHash, function(data) {
                sp.metric.getViewerWidgetMetrics(data.fileData[0]);
            });
        });

        $(document).ready(function() {
            $.ajaxSetup({
                cache: false,
                statusCode: {
                    403: function() {
                        window.location = '/login';
                    },
                    500: function() {
                        window.location = '/login';
                    }
                },
                success: function(data) {
                    if (typeof data === 'string' && '<!DOCTYPE html>' === data.substring(0, 15)) {
                        window.location = '/login';
                    }
                },
                error: function(jqXHR) {
                    if (typeof jqXHR.responseText === 'string' && '<!DOCTYPE html>' === jqXHR.responseText.substring(0, 15)) {
                        window.location = '/login';
                    }
                }
            });

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

            // Load Upload File modal.
            $('[data-target="#sp-modal-upload-files"]').click(function() {
                $('#sp-modal-upload-files').load('assets/modal/upload-files/main.html', function() {
                    $('#sp-file__upload-form input').val('');
                    $.getScript('assets/modal/upload-files/functions.js');
                });
            });

            // Load Update File modal.
            $(document).on('click', '[data-target="#sp-modal-update-file"]', function() {
                sp.file.fileHash = $(this).attr('data-file-hash');

                $('#sp-modal-update-file').load('assets/modal/upload-files/main.html', function() {
                    $('#sp-modal-update-file .modal-title').text('Update Document');
                    $('.sp-file__upload-update-file-button')
                        .text('Update Document')
                        .attr('data-upload-update', 'update');
                    $('#sp-modal-update-file .font-bold span').text('update');

                    $('#sp-file__upload-form input').val('');
                    $('#sp-file__upload-form [type="file"]').removeAttr('multiple');

                    $.getScript('assets/modal/upload-files/functions.js');
                });
            });

            // Customize Toolbar.
            $('[data-target="#sp-toolbar-settings__modal"]').on('click', function () {
                $('#sp-toolbar-settings__modal').load('assets/modal/navbar-customization/main.html');
                new UserEvent('CLICKED_TOOLBAR_SETTINGS').send();
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
                        }
                    });
            });

            /* Customers mgmt. */

            // Upload customers.
            $('#sp-upload-customers__button').click(function(event) {
                if ($('#sp-modal-upload-customers input[type="file"]').val() === ''){
                    sp.error.handleError('You must select a file to upload');
                } else {
                    sp.file.uploadCustomers(event);
                    $('input[type="file"]').val(null);
                }
                new UserEvent('UPLOADED_CUSTOMERS').send();
            });

            $('#sp-download-template__button').click(function() {
                location.href = '../../../../assets/files/customers_template.csv';
            });

            // Add or update a customer.
            $(document).on('click', '#sp-modal-add-update-customer__button[value="Add Customer"]', function() {
                new UserEvent('ADDED_CUSTOMER').send();
            })

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

                    $('#sp-modal-add-update-customer input[name="customerGroup"]').
                    val($('[data-customer-email="' + $(this).attr('data-customer-email') + '"]')
                        .closest('tr').find('#sp-customer-group__td').text());

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
                        resetDashboardData();
                        //  Bug fix for bad UI on mozilla - scrollbar still showed
                        $('#sp-sales-analytics-scroll').remove();
                        setFileDashboard();
                        break;

                    case 'sp-sales-analytics-view':
                        $('#sp-file-dashboard').show();
                        resetDashboardData();
                        //  Bug fix for bad UI on mozilla - scrollbar still showed
                        $('#sp-marketing-analytics').remove();
                        sp.view.salesAnalytics.setNavBar();
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

                    case 'navigation__tasks':
                        $('.tasks').show();
                        window.sp.tasks.getAll();
                        break;
                }

                function resetDashboardData() {
                    $('#sp-widget-total-views').text('0');
                    $('#sp-widget-bounce-rate, #sp-widget-average-view-duration, #sp-widget-average-pages-viewed, #sp-widget-top-exit-page, #sp-widget-users-cta').text('N/A');

                    $('.hopper__items').empty();
                    $('.hopper__title').show();
                    $('#sp-widget-video-youtube-metric-total-number-plays').text('N/A');
                    $('#sp-widget-ask-question-metric').hide();
                    $('#sp-widget-total-count-likes').text('N/A');
                    $('#sp-widget-count-unique-views').text('N/A');

                    sp.chart.averageViewDurationData = {};
                    if (typeof sp.chart.fileBar !== 'undefined') {
                        sp.chart.fileBar.destroy();
                    }

                    sp.chart.totalViewsData = {};
                    if (typeof sp.chart.fileLine !== 'undefined') {
                        sp.chart.fileLine.destroy();
                    }

                    if (typeof sp.chart.visitorsMap !== 'undefined') {
                        sp.chart.visitorsMap.clearChart();
                    }
                }
            }

            // Clone document.
            document.addEventListener('click', function(event) {
                if (event.target.classList.contains('sp-document__clone')) {
                    var sourceDocumentFriendlyId = event.target.getAttribute('data-document-friendly-id');
                    var sourceDocumentName = event.target.getAttribute('data-document-name');
                    swal({
                        title: 'Set the cloned document name:',
                        type: 'input',
                        inputValue: sourceDocumentName,
                        showCancelButton: true,
                        closeOnConfirm: false,
                        showLoaderOnConfirm: true
                    }, function (destinationDocumentName) {
                        if (false === destinationDocumentName) {
                            return false;
                        } else if ('' === destinationDocumentName) {
                            swal.showInputError("Please enter a document name");
                        } else {
                            var data = {
                                sourceDocumentFriendlyId: sourceDocumentFriendlyId,
                                destinationDocumentName: destinationDocumentName
                            };

                            var xhr = new XMLHttpRequest();
                            xhr.open('POST', '/api/v1/document-utils/clone/');
                            xhr.setRequestHeader('Content-type', 'application/json');
                            xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
                            xhr.onload = function() {
                                if (typeof xhr.response === 'string' && '<!DOCTYPE html>' === xhr.response.substring(0, 15)) {
                                    window.location = '/login';
                                } else if (xhr.status === 200) {
                                    sp.file.getFilesList('fileUploadDashboard');
                                    swal("Success!", "You successfully cloned a document", "success");
                                } else if (xhr.status === 403 || xhr.status === 500) {
                                    window.location = '/login';
                                } else {
                                    swal("Error!", "Clone operation failed. Please contact support@slidepiper.com for assistance", "error");
                                }
                            };
                            xhr.send(JSON.stringify(data));
                        }
                    });
                }
            });

            // Widgets.
            window.sp.widgetsResource = {
                findByDocumentFriendlyId: function(documentFriendlyId) {
                    return $.getJSON('/api/v1/widgets?fileHash=' + documentFriendlyId);
                }
            };

            // Tasks.
            // Get all tasks.
            window.sp.tasks = {
                getAll: function() {
                    $.getJSON('/api/v1/tasks', function(data) {
                        $.fn.dataTable.moment('D/M/Y HH:mm (Z)');
                        if (!($.fn.dataTable.isDataTable('.tasks__table'))) {
                            $('.tasks__table').DataTable({
                                data: data,
                                buttons: [
                                    {
                                        extend: 'csv',
                                        filename: 'SlidePiper Tasks',
                                        text: 'Export to CSV'
                                    }
                                ],
                                columns: [
                                    {data: 'dueAt'},
                                    {data: 'completedAt'},
                                    {
                                        data: 'customer.firstName',
                                        defaultContent: 'Not set'
                                    },
                                    {
                                        data: 'customer.lastName',
                                        defaultContent: 'Not set'
                                    },
                                    {
                                        data: 'customer.email',
                                        defaultContent: 'Not set'
                                    },
                                    {
                                        data: 'customer.company',
                                        defaultContent: 'Not set'
                                    },
                                    {
                                        data: 'document.name',
                                        defaultContent: 'Not set'
                                    },
                                    {
                                        data: 'data.pageNumber',
                                        defaultContent: 'Not set'
                                    },
                                    {
                                        data: 'data.taskMessage',
                                        defaultContent: 'Not set'
                                    },
                                    {data: 'link'}
                                ],
                                columnDefs: [
                                    {
                                        render: function(data) {
                                            return moment(data).zone(new Date().getTimezoneOffset()).format('D/M/Y HH:mm (Z)');
                                        },
                                        targets: 0
                                    },
                                    {
                                        render: function(data, type, row) {
                                            if (row.completedAt > -1) {
                                                if ('EMAIL' === row.action) {
                                                    return 'Email sent';
                                                } else {
                                                    return 'Completed';
                                                }
                                            } else if (row.failedAt > -1) {
                                                return 'Failed';
                                            } else if (row.abortedAt > -1) {
                                                return 'Aborted';
                                            } else if (row.initializedAt > -1) {
                                                return 'In progress';
                                            } else if (!row.enabled) {
                                                return 'Not enabled';
                                            } else {
                                                return 'Scheduled';
                                            }
                                        },
                                        targets: 1
                                    },
                                    {
                                        render: function(data, type, row) {
                                            if (typeof data === 'undefined') {
                                                return 'Not set';
                                            } else {
                                                return data + ' ' + row.customer.lastName + ' (' + row.customer.email + ')';
                                            }
                                        },
                                        targets: 2
                                    },
                                    {
                                        visible: false,
                                        targets: [3,4]
                                    },
                                    {
                                        render: function(data, type, row) {
                                            var disabled = '';
                                            if (row.initializedAt > -1) {
                                                disabled = 'disabled';
                                            }
                                            return '<button class="tasks__task-update btn btn-primary btn-xs" data-toggle="modal" data-target=".tasks__task-modal" data-link="' + data + '" ' + disabled + '>Update</button> <button class="tasks__task-delete btn btn-danger btn-xs" data-link="' + data + '" ' + disabled + '>Delete</button>'
                                        },
                                        targets: 9
                                    }
                                ],
                                dom: '<"sp-datatables-search-left"f><"html5buttons"B>ti',
                                paging: false,
                                order: [[0, 'desc']],
                                scrollY: '50vh'
                            });
                        } else {
                            $('.tasks__table').DataTable()
                                .clear()
                                .rows.add(data)
                                .draw();
                        }
                    });
                },
                get: function(link, callback) {
                    $.getJSON(link, function (data) {
                        callback(data);
                    });
                }
            };

            // Create / Update task.
            document.addEventListener('click', function(event) {
                if (event.target.classList.contains('tasks__task-create')) {
                    clearTask();
                    $('.tasks__task-form [name=requestLink]').val('/api/v1/tasks');
                    $('.tasks__task-form [name=requestType]').val('POST');
                    $('.tasks__task-form [name=successMessage]').val('created');
                }

                if (event.target.classList.contains('tasks__task-update')) {
                    window.sp.tasks.get(event.target.getAttribute('data-link'), populateTask);
                    $('.tasks__task-form [name=requestLink]').val(event.target.getAttribute('data-link'));
                    $('.tasks__task-form [name=requestType]').val('PUT');
                    $('.tasks__task-form [name=successMessage]').val('updated');
                }
            });

            // Initialize task from.
            $('.tasks__task-form-due-date').datetimepicker({
                allowInputToggle: true,
                format: 'D/M/Y HH:mm (Z)',
                sideBySide: true
            });

            $('.tasks__task-form-customer').select2({
                theme: 'bootstrap',
                width: '100%'
            });

            $('.tasks__task-form-document').select2({
                theme: 'bootstrap',
                width: '100%'
            });

            $('.tasks__task-form-milestone').select2({
                theme: 'bootstrap',
                width: '100%'
            });

            function populateTask(task) {
                // Enabled.
                $('.tasks__task-form [name=enabled]').prop('checked', task.enabled);

                // Due date.
                $('.tasks__task-form-due-date').data("DateTimePicker").date(moment(task.dueAt).zone(new Date().getTimezoneOffset()));

                // Customer.
                $.getJSON('/api/v1/analytics?action=getCustomersList', function(data) {
                    data.customersList.sort(compareCustomer);
                    $('.tasks__task-form-customer').empty();
                    $.each(data.customersList, function() {
                        $('.tasks__task-form-customer').append($('<option>').val(this[6]).text(this[0] + ' ' + this[1] + ' (' + this[3] + ')'));
                    });
                    $('.tasks__task-form-customer').val(task.customer.id);
                });

                // Document.
                $.getJSON('/api/v1/analytics?action=getFilesList', function(data) {
                    data.filesList.sort(compareDocument);
                    $('.tasks__task-form-document').empty();
                    $.each(data.filesList, function() {
                        $('.tasks__task-form-document').append($('<option>').val(this[3]).text(this[1]).attr('data-friendly-id', this[0]));
                    });
                    $('.tasks__task-form-document').val(task.document.id);

                    var friendlyId = task.document.friendlyId;
                    window.sp.widgetsResource.findByDocumentFriendlyId(friendlyId).then(function(data) {getHopperWidget(data, createMilestone)});
                });

                // Page number.
                $('.tasks__task-form [name=pageNumber]').val(task.data.pageNumber);

                // Task message.
                $('.tasks__task-form [name=taskMessage]').val(task.data.taskMessage);
            }

            function clearTask() {
                // Enabled.
                $('.tasks__task-form [name=enabled]').prop('checked', true);

                // Due at.
                $('.tasks__task-form-due-date').data("DateTimePicker").date(new Date());

                // Customer.
                $.getJSON('/api/v1/analytics?action=getCustomersList', function(data) {
                    data.customersList.sort(compareCustomer);
                    $('.tasks__task-form-customer').empty();
                    $.each(data.customersList, function() {
                        $('.tasks__task-form-customer').append($('<option>').val(this[6]).text(this[0] + ' ' + this[1] + ' (' + this[3] + ')'));
                    });
                });

                // Document.
                $.getJSON('/api/v1/analytics?action=getFilesList', function(data) {
                    data.filesList.sort(compareDocument);
                    $('.tasks__task-form-document').empty();
                    $.each(data.filesList, function() {
                        $('.tasks__task-form-document').append($('<option>').val(this[3]).text(this[1]).attr('data-friendly-id', this[0]));
                    });

                    var friendlyId = $('.tasks__task-form-document option:first-child').attr('data-friendly-id');
                    window.sp.widgetsResource.findByDocumentFriendlyId(friendlyId).then(function(data) {getHopperWidget(data, createMilestone)});
                });

                // Page number.
                $('.tasks__task-form [name=pageNumber]').val('');

                // Task message.
                $('.tasks__task-form [name=taskMessage]').val('');
            }

            document.querySelector('.tasks__task-form-document').onchange = function() {
                $('.tasks__task-form [name=pageNumber]').val('');

                var friendlyId = this.options[this.selectedIndex].getAttribute('data-friendly-id');
                window.sp.widgetsResource.findByDocumentFriendlyId(friendlyId).then(function(data) {getHopperWidget(data, createMilestone)});
            };

            document.querySelector('.tasks__task-form-milestone').onchange = function() {
                $('.tasks__task-form [name=pageNumber]').val(this.value);
            };

            function getHopperWidget(data, callback) {
                var hopperWidget = null;
                data.forEach(function(widget) {
                    var widgetData = JSON.parse(widget.widgetData);
                    if (5 === widgetData.data.widgetId) {
                        hopperWidget = widgetData.data;
                    }
                });

                callback(hopperWidget);
            }

            function createMilestone(hopperWidget) {
                $('.tasks__task-form-milestone').empty();

                if (hopperWidget) {
                    $('.tasks__task-form-milestone').append($('<option>').text('Choose...').prop({disabled: true, selected: true}));
                    hopperWidget.items.forEach(function(item) {
                        $('.tasks__task-form-milestone').append($('<option>').val(item.hopperPage).text(item.hopperText));
                    });
                }
            }

            function compareCustomer(a, b) {
                if (a[0] < b[0]) {
                    return -1;
                }
                if (a[0] > b[0]) {
                    return 1;
                }
                return 0;
            }

            function compareDocument(a, b) {
                if (a[1] < b[1]) {
                    return -1;
                }
                if (a[1] > b[1]) {
                    return 1;
                }
                return 0;
            }

            // Save task.
            document.addEventListener('submit', function(event) {
                if (event.target.classList.contains('tasks__task-form')) {
                    event.preventDefault();

                    var data = {
                        enabled: $('.tasks__task-form [name=enabled]').prop('checked'),
                        dueAt: $('.tasks__task-form-due-date').data("DateTimePicker").date().valueOf(),
                        type: 'DOCUMENT',
                        action: 'EMAIL',
                        customerId: parseInt($('.tasks__task-form-customer').val()),
                        documentId: parseInt($('.tasks__task-form-document').val()),
                        data: {
                            pageNumber: parseInt($('.tasks__task-form [name=pageNumber]').val()),
                            taskMessage: $('.tasks__task-form [name=taskMessage]').val()
                        }
                    };

                    $.ajax({
                        url: $('.tasks__task-form [name=requestLink]').val(),
                        type: $('.tasks__task-form [name=requestType]').val(),
                        data: JSON.stringify(data),
                        contentType : 'application/json',
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
                        }
                    }).done(function () {
                        if (typeof data === 'string' && '<!DOCTYPE html>' === data.substring(0, 15)) {
                            window.location = '/login';
                        } else {
                            swal('Success!', 'You have successfully ' + $('.tasks__task-form [name=successMessage]').val() + ' a task', 'success');
                            window.sp.tasks.getAll();
                            $('button[data-dismiss="modal"]').click();
                        }
                    }).fail(function () {
                        swal('Error!', 'Please contact support@slidepiper.com for assistance', 'error');
                    });
                }
            });

            // Delete task.
            document.addEventListener('click', function(event) {
                if (event.target.classList.contains('tasks__task-delete')) {
                    swal({
                            title: "Are you sure you want to delete this task?",
                            type: "warning",
                            confirmButtonText: "Yes",
                            cancelButtonText: "No",
                            showCancelButton: true,
                            closeOnConfirm: false,
                            closeOnCancel: true
                        },
                        function(isConfirm) {
                            if (isConfirm) {
                                $.ajax({
                                    url: event.target.getAttribute('data-link'),
                                    type: 'DELETE',
                                    beforeSend: function (xhr) {
                                        xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
                                    }
                                }).done(function () {
                                    if (typeof data === 'string' && '<!DOCTYPE html>' === data.substring(0, 15)) {
                                        window.location = '/login';
                                    } else {
                                        swal('Success!', 'You have successfully deleted a task', 'success');
                                        window.sp.tasks.getAll();
                                    }
                                }).fail(function () {
                                    swal('Error!', 'Please contact support@slidepiper.com for assistance', 'error');
                                });
                            }
                        }
                    );
                }
            });

            // Link Widget.
            document.addEventListener('click', function(event) {
                if (1 === $(event.target).parents('.sp-link-widget__item-configuration').length) {
                    $(event.target).parents('.sp-link-widget__item-configuration').find('i').toggleClass('fa-plus fa-minus');
                    $(event.target).parents('.sp-link-widget__item').find('.sp-link-widget__item-body').slideToggle();
                }
            });
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
                '/api/v1/analytics',
                {action: 'getFilesList'},
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
                    + '<a><span style="margin-left: 10px;" class="sp-document__clone label label-info" data-document-friendly-id="' + value[0] + '" data-document-name="' + value[1] + '">Clone</span></a>'
                    + '<a><span data-toggle="modal" data-target="#sp-viewer-widgets-modal" style="margin-left: 10px;" class="label label-success sp-file-customize" data-file-hash="' + value[0] + '">Customize</span></a>'
                    + '<a class="sp-preview-file-link"><span id="sp-preview-file-' + index + '" style="margin-left: 10px;" class="label label-warning">Preview</span></a></span>'
                };
                filesArr.push(obj);

                sp.file.setFileLinkAttribute(
                    value[0],
                    'test@example.com',
                    'sp-preview-file-' + index
                );
            });

            $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
            if (!($.fn.dataTable.isDataTable('#sp-files-management'))) {
                $('#sp-files-management').DataTable({
                    data: filesArr,
                    buttons: [
                        {
                            extend: 'csv',
                            filename: 'SlidePiper Portals',
                            text: 'Export to CSV'
                        }
                    ],
                    columns: [
                        {data: 'date'},
                        {data: 'document'},
                        {data: 'options'},
                    ],
                    scrollY: '55vh',
                    scrollCollapse: true,
                    dom: '<"sp-datatables-search-left"f><"html5buttons"B>ti',
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
                    $('.sp-widgets-customisation__spinner').addClass('sp-widgets-customisation__spinner-show');

                    $.getScript('assets/js/plugins/spectrum/spectrum.js', function() {
                        $('#sp-widget3__color-picker').spectrum({
                            appendTo: '#sp-viewer-widgets-modal',
                            chooseText: 'Choose',
                            cancelText: 'Cancel',
                            preferredFormat: 'hex',
                            showAlpha: true,
                            showInput: true,
                        });

                        $('#sp-widget11__color-picker').spectrum({
                            appendTo: '#sp-viewer-widgets-modal',
                            chooseText: 'Choose',
                            cancelText: 'Cancel',
                            preferredFormat: 'hex',
                            showAlpha: true,
                            showInput: true,
                        });

                        loadModal();
                    });

                    function loadModal() {
                        $.getScript('assets/modal/viewer-widgets-wizard/functions.js', function() {
                            sp.viewerWidgetsModal.getWidgetsSettings(fileHash);

                            $('#sp-viewer-widgets-modal').off('hidden.bs.modal').on('hidden.bs.modal', function() {
                                $(this).find('.tabs-container').addClass('sp-hidden');
                            });
                        });
                    }
                });
            });

            /**
             * Open preview document.
             */
            $('.sp-preview-file-link span').on('click', function() {
                window.open($(this).attr('data-file-link'));
            });
        },

        deleteFile: function(fileHash) {
            $.ajax({
                url: '/api/v1/documents/' + fileHash,
                type: 'DELETE',
                cache: false,
                processData: false,
                contentType: false,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
                },
            })
                .done(function(data) {
                    if (typeof data === 'string' && '<!DOCTYPE html>' === data.substring(0, 15)) {
                        window.location = '/login';
                    } else {
                        sp.file.getFilesList('fileUploadDashboard');
                        swal("Deleted!", "Your file has been deleted.", "success");
                    }
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
        setFileLinkAttribute: function(fileHash, customerEmail, targetId) {
            $.getJSON(
                '/api/v1/analytics',
                {
                    action: 'getFileLinkHash',
                    fileHash: fileHash,
                    customerEmail: customerEmail
                },
                function(data) {
                        var fileLink = SP.VIEWER_URL_WITHOUT_FILELINK + data.fileLinkHash;
                        $('#' + targetId).attr('data-file-link', fileLink);
                    }
            );
        },


        /* Customers mgmt. */

        getCustomersList: function(requestOrigin) {
            $.getJSON(
                '/api/v1/analytics',
                {action: 'getCustomersList'},
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
                    'options': '<td><a href="#"><span class="label label-primary sp-add-update-customer sp-customer-update" data-add-update="update" data-toggle="modal" data-target="#sp-modal-add-update-customer" data-customer-email="' + row[3] + '">Update</span></a><a href="#"><span class="label label-danger sp-customer-delete" data-customer-email="' + row[3] + '">Delete</span></a></td>',
                    group: '<span id="sp-customer-group__td">' + row[5] + '</span>',
                };
                nameArr.push(obj);
            });

            $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
            if (!($.fn.dataTable.isDataTable('#sp-customers-management'))) {
                $('#sp-customers-management').DataTable({
                    data: nameArr,
                    buttons: [
                        {
                            extend: 'csv',
                            filename: 'SlidePiper Customers',
                            text: 'Export to CSV'
                        }
                    ],
                    columns: [
                        {data: 'date'},
                        {data: 'name'},
                        {data: 'company'},
                        {data: 'group'},
                        {data: 'email'},
                        {data: 'options'}
                    ],
                    scrollY: '55vh',
                    scrollCollapse: true,
                    dom: '<"sp-datatables-search-left"f><"html5buttons"B>ti',
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
                'action': 'addNewCustomer',
                'subAction': subAction
            };
            $('#sp-add-update-customer__form input:not([type="hidden"])').each(function() {
                data[$(this).attr('name')] = $(this).val();
            });

            $.ajax({
                url: '/api/v1/customers',
                type: 'POST',
                data: JSON.stringify(data),
                cache: false,
                processData: false,
                contentType : "application/json; charset=utf-8",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
                },
                success: function(data, textStatus, jqXHR) {
                    if (typeof data === 'string' && '<!DOCTYPE html>' === data.substring(0, 15)) {
                        window.location = '/login';
                    } else if (typeof data.error === 'undefined') {
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
            $.ajax({
                url: '/api/v1/customer-delete',
                method: 'post',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
                },
                contentType : 'application/json;',
                data: JSON.stringify({
                    customer_email: customerEmail
                })
            }).done(function(data) {
                if (typeof data === 'string' && '<!DOCTYPE html>' === data.substring(0, 15)) {
                    window.location = '/login';
                } else {
                    sp.file.getCustomersList('fileUploadDashboard');
                }
            });
        },
    },

    metric: {

        /**
         * Display the selected file data metrics.
         */
        getFileMetrics: function(fileData) {
            if (typeof fileData != 'undefined' && typeof fileData[1] != 'undefined' && parseInt(fileData[1]) > 0) {

                // Total views.
                $('#sp-widget-total-views').text(fileData[1]);

                // Bounce rate.
                $('#sp-widget-bounce-rate').text((parseFloat(fileData[2]) * 100).toFixed().toString() + '%');

                // Average view duration.
                if (null != fileData[3]) {
                    /**
                     * @see http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
                     */
                    var totalSeconds = parseInt(fileData[3], 10);

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
                if (null != fileData[4]) {
                    $('#sp-widget-average-pages-viewed').text(parseFloat(fileData[4]).toFixed(1));
                } else {
                    $('#sp-widget-average-pages-viewed').text('N/A');
                }

                // Top exit page.
                $.getJSON(
                    '/api/v1/analytics',
                    {action: 'getTopExitPage', fileHash: fileData[0]},
                    function(data) {
                            if (typeof data.topExitPage[0] !== 'undefined') {
                                $('#sp-widget-top-exit-page').text(data.topExitPage);
                            } else {
                                $('#sp-widget-top-exit-page').text('N/A');
                            }
                        }
                );

                // Users CTA.
                $('#sp-widget-users-cta').text(fileData[5]);

            } else {
                $('#sp-widget-total-views').text('0');
                $('#sp-widget-bounce-rate, #sp-widget-average-view-duration, #sp-widget-average-pages-viewed, #sp-widget-top-exit-page, #sp-widget-users-cta').text('N/A');
            }
        },

        /**
         * Get metrics about the viewer widgets.
         */
        getViewerWidgetMetrics: function(fileData, customerEmail) {
            sp.metric.getFileMetrics(fileData);

            // Hopper data.
            if (typeof fileData != 'undefined' && typeof fileData[1] != 'undefined' && parseInt(fileData[1]) > 0) {
                var items = document.querySelector('.hopper__items');
                while (items.hasChildNodes()) {
                    items.removeChild(items.lastChild);
                }
                var title = document.querySelector('.hopper__title');
                title.textContent = 'N/A';
                title.style.display = 'block';

                $.getJSON(
                    '/api/v1/analytics',
                    {
                        action: 'getHopperData',
                        fileHash: fileData[0]
                    },
                    function (data) {
                        if (typeof data['hopperData'][0] !== 'undefined') {
                            var hops = JSON.parse(data['hopperData'][0][0]).data.items;
                            var ul = document.createElement('ul');
                            ul.className = 'todo-list small-list m-t';
                            hops.forEach(function (hop) {
                                var li = document.createElement('li');
                                var i = document.createElement('i');
                                i.classList = 'fa hopper__item-checkbox'
                                switch (hop.status) {
                                    case 'finished':
                                        i.classList += ' fa-check-square';
                                        break;
                                    default:
                                        i.classList += ' fa-square-o';
                                        break;
                                }
                                li.appendChild(i);

                                var span = document.createElement('span');
                                span.classList = 'm-l-xs';
                                if ('finished' === hop.status) {
                                    span.classList += ' todo-completed';
                                }
                                span.textContent = hop.hopperText;
                                li.appendChild(span);
                                ul.appendChild(li);
                            });
                            items.appendChild(ul);
                            title.style.display = 'none';
                        }
                    }
                );
            } else {
                $('.hopper__items').empty();
                $('.hopper__title').show();
            }


            // Total number of YouTube plays.
            if (typeof fileData != 'undefined' && typeof fileData[1] != 'undefined' && parseInt(fileData[1]) > 0) {
                $.getJSON(
                    '/api/v1/analytics',
                    {
                        action: 'getVideoWidgetMetrics',
                        customerEmail: customerEmail,
                        fileHash: fileData[0]
                    },
                    function (data) {
                        $('#sp-widget-video-youtube-metric-total-number-plays')
                            .text(data['totalNumberYouTubePlays'][0][0]);
                    }
                );
            } else {
                $('#sp-widget-video-youtube-metric-total-number-plays').text('N/A');
            }

            // Ask a Question widget questions.
            if (typeof fileData != 'undefined' && typeof fileData[1] != 'undefined' && parseInt(fileData[1]) > 0) {
                $.getJSON(
                    '/api/v1/analytics',
                    {
                        action: 'getViewerWidgetAskQuestion',
                        customerEmail: customerEmail,
                        fileHash: fileData[0]
                    },
                    function (data) {
                        $('#sp-widget-ask-question-metric ul.list-group').empty();

                        var quetions = data.widgetAskQuestion;
                        if (quetions.length > 0) {
                            $.each(quetions, function (index, value) {
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
            } else {
                $('#sp-widget-ask-question-metric').hide();
            }

            // Total number of likes.
            if (typeof fileData != 'undefined' && typeof fileData[1] != 'undefined' && parseInt(fileData[1]) > 0) {
                $.getJSON(
                    '/api/v1/analytics',
                    {
                        action: 'getWidgetLikesCount',
                        customerEmail: customerEmail,
                        fileHash: fileData[0]
                    },
                    function (data) {
                        if (data.likesCount[0]) {
                            $('#sp-widget-total-count-likes').text(data.likesCount[0][0]);
                        }
                    }
                );
            } else {
                $('#sp-widget-total-count-likes').text('N/A');
            }

            
            // Number of unique views.
            if (typeof fileData != 'undefined' && typeof fileData[1] != 'undefined' && parseInt(fileData[1]) > 0) {
                $.getJSON(
                    '/api/v1/analytics',
                    {
                        action: 'getWidgetUniqueViewsCount',
                        customerEmail: customerEmail,
                        fileHash: fileData[0]
                    },
                    function (data) {
                        var viewsCountFromFileData = parseInt(fileData[1]);
                        var uniqueViewsCount = parseInt(data.uniqueViewsCount[0][0]);
                        var viewsCount = parseInt(data.uniqueViewsCount[0][1]);

                        if (uniqueViewsCount > 0 && viewsCount === viewsCountFromFileData) {
                            $('#sp-widget-count-unique-views').text(uniqueViewsCount + ' (' + (uniqueViewsCount / viewsCount * 100).toFixed(0) + '%)');
                        } else {
                            $('#sp-widget-count-unique-views').text('N/A');
                        }
                    }
                );
            } else {
                $('#sp-widget-count-unique-views').text('N/A');
            }

            sp.chart.getFileLine(fileData, customerEmail);
            sp.chart.getFileBar(fileData, customerEmail);
            sp.chart.getFileVisitorsMap(fileData, customerEmail);
        }
    },

    chart: {
        averageViewDurationData: {},
        totalViewsData: {},

        /**
         * Resize the charts to fit their .ibox-content container when the window resizes.
         */
        resizeCharts: (function() {
            $(window).resize(function() {
                if (!$.isEmptyObject(sp.chart.averageViewDurationData)) {
                    sp.chart.loadBarChart(sp.chart.averageViewDurationData);
                }

                if (!$.isEmptyObject(sp.chart.totalViewsData)) {
                    sp.chart.loadFileLine(sp.chart.totalViewsData);
                }
            });
        })(),

        /**
         * Get the file bar chart.
         */
        getFileBar: function(fileData, customerEmail) {
            if (typeof customerEmail == 'undefined') {
                customerEmail = null;
            }

            if (typeof fileData != 'undefined' && typeof fileData[1] != 'undefined' && parseInt(fileData[1]) > 0) {
                $.getJSON(
                    '/api/v1/analytics',
                    {
                        action: 'getFileBarChart',
                        fileHash: fileData[0],
                        customerEmail: customerEmail
                    },
                    function(data) {
                            sp.chart.averageViewDurationData = data;
                            sp.chart.loadBarChart(data);
                        }
                );
            } else {
                sp.chart.averageViewDurationData = {};

                if (typeof sp.chart.fileBar !== 'undefined') {
                    sp.chart.fileBar.destroy();
                }
            }
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
            }
        },

        /**
         * Get the file line chart.
         */
        getFileLine: function(fileData, customerEmail) {
            if (typeof customerEmail == 'undefined') {
                customerEmail = null;
            }

            if (typeof fileData != 'undefined' && typeof fileData[1] != 'undefined' && parseInt(fileData[1]) > 0) {
                $.getJSON(
                    '/api/v1/analytics',
                    {
                        action: 'getFileLineChart',
                        fileHash: fileData[0],
                        customerEmail: customerEmail,
                    },
                    function(data) {
                            sp.chart.totalViewsData = data;
                            sp.chart.loadFileLine(data);
                        }
                );
            } else {
                sp.chart.totalViewsData = {};

                if (typeof sp.chart.fileLine !== 'undefined') {
                    sp.chart.fileLine.destroy();
                }
            }
        },

        loadFileLine: function(data) {
            if (typeof sp.chart.fileLine !== 'undefined') {
                sp.chart.fileLine.destroy();
            }

            var chartContainerWidth = $('#sp-line-chart-container').closest('.ibox-content').width();
            var canvasHeight = $('#lineChart').height();
            $('#sp-line-chart-container')
                .empty()
                .append('<canvas id="lineChart" height="' + canvasHeight + '" width="' + chartContainerWidth + '"></canvas>');

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
                $.each(data.fileLineChart, function (index, value) {
                    dateParts = value[0].split('-');
                    lineData.labels.push(dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0]);
                    lineData.datasets[0].data.push(parseInt(value[1]));
                    lineData.datasets[1].data.push(parseInt(value[2]));
                });

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
                                    callback: function (value, index, values) {
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
                            custom: function (tooltip) {

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
                                    $.each(tooltipTitles, function () {
                                        innerHtml += '<tr><th>' + this + '</th></tr><br>';
                                    });

                                    innerHtml += '</thead><tbody>';

                                    $.each(tooltipBody, function (index, body) {
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
                                    'left': (event.pageX - chartLeftPosition) + 'px',
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
            }
        },

        /**
         * get the file visitors report.
         */
        getFileVisitorsMap: function(fileData, customerEmail) {
            if (typeof customerEmail == 'undefined') {
                customerEmail = null;
            }

            if (typeof fileData != 'undefined' && typeof fileData[1] != 'undefined' && parseInt(fileData[1]) > 0) {
                $.getJSON('/api/v1/analytics', {action: 'getFileVisitorsMap',
                    fileHash: fileData[0], customerEmail: customerEmail}, function(data) {

                        var dataFormatted = [];
                        if (data.fileVisitorsMap.length > 0) {
                            dataFormatted.push(['Latitude', 'Longitude', 'City', 'Total views']);
                            $.each(data.fileVisitorsMap, function (index, row) {
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

                        $(window).on('resize', function () {
                            sp.chart.visitorsMap = new google.visualization.GeoChart(document.getElementById('sp-google-geochart'));
                            sp.chart.visitorsMap.draw(mapData, options);
                        });
                });
            } else {
                if (typeof sp.chart.visitorsMap !== 'undefined') {
                    sp.chart.visitorsMap.clearChart();
                }
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
                    checkbox: index,
                    name: value[0] + ' ' + value[1],
                    company: value[2],
                    email: '<span data-email=' + value[3] +' class="sp-email"> ' + value[3] + '</span>',
                    date:  moment(date).format('DD-MM-YYYY HH:mm'),
                    group: value[5]
                };
                nameArr.push(obj);
            });

            $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
            if (!($.fn.dataTable.isDataTable('.sp-customer-table'))) {
                $('.sp-customer-table').DataTable({
                    select: {
                        style: 'multi',
                    },
                    data: nameArr,
                    columnDefs: [
                        {
                            targets: 0,
                            data: 'checkbox',
                            checkboxes: {
                                selectRow: true
                            }
                        },
                        {
                            targets: 1,
                            data: 'name'
                        },
                        {
                            targets: 2,
                            data: 'company'
                        },
                        {
                            targets: 3,
                            data: 'group'
                        },
                        {
                            targets: 4,
                            data: 'email'
                        },
                        {
                            targets: 5,
                            data: 'date'
                        }
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
                    order: [[5, 'desc']],
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
                    checkbox: index,
                    name: '<span class="sp-doc-name" data-file-name=' + value[1] +' data-file-hash=' + value[0] +'>' + value[1] + '</span>',
                    date: moment(date).format('DD-MM-YYYY HH:mm'),
                };
                fileArr.push(obj);
            });

            $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
            if (!($.fn.dataTable.isDataTable('.sp-doc-table'))) {
                $('.sp-doc-table').DataTable({
                    select: {
                        style: 'multi',
                    },
                    data: fileArr,
                    columnDefs: [
                        {
                            targets: 0,
                            data: 'checkbox',
                            checkboxes: {
                                selectRow: true
                            }
                        },
                        {
                            targets: 1,
                            data: 'name'
                        },
                        {
                            targets: 2,
                            data: 'date'
                        }
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
                if ($('li.current').text() === 'current step: 3. Generated Links'){
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
                url: '/api/v1/channels',
                type: 'post',
                dataType: 'json',
                contentType: 'application/json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
                },
                data: JSON.stringify({
                    'data': data
                }),
                success: function (data) {
                    if (typeof data === 'string' && '<!DOCTYPE html>' === data.substring(0, 15)) {
                        window.location = '/login';
                    } else {
                        sp.customerFileLinksGenerator.renderCustomerChoice(data, files);
                        new UserEvent('GENERATED_DOCUMENT_LINK').send();
                    }
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

            $.each(data, function (index, customer) {
                var customerTableData = {};

                var documentName = '';
                var documentLink = '';
                $.each(customer.files, function(index, fileData) {

                    customerTableData.email = '<span class="sp-send-documents__email-address">' + customer.customerEmail + '</span>';
                    documentName +=
                        '<span class="sp-send-documents__file-name">' + sp.customerFileLinksGenerator.getDocumentName(fileData.fileHash, files) + '</span><br>';

                    documentLink +=
                        '<span class="sp-send-documents__file-link">' + SP.VIEWER_URL_WITHOUT_FILELINK + fileData.fileLink + '</span><br>';

                    customerTableData.document = documentName;
                    customerTableData.link = documentLink;

                    customerTableData.copy = '<button class="btn btn-white btn-sm sp-mail-all__button sp-copy-all">' +
                        '<i class="fa fa-copy sp-mail__icon"></i><span> Copy</span>' +
                        '</button>';

                    customerTableData['sp-file-name-' + (index + 1)] = sp.customerFileLinksGenerator.getDocumentName(fileData.fileHash, files);
                    customerTableData['sp-file-link-' + (index + 1)] = SP.VIEWER_URL_WITHOUT_FILELINK + fileData.fileLink;
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
        setDocSettings: $(function () {

            $('#sp-save-doc-settings-changes').on('click', function() {
                var docSettingsData = {
                    viewerOpenDocumentEmailEnabled: $('#sp-enable-alert-emails__checkbox').prop('checked'),
                    viewerEventEmailEnabled: $('#sp-enable-notification-emails__checkbox').prop('checked'),
                    'notificationEmail': $('#sp-document-settings__modal [name=notificationEmail]').val(),
                    receiveCustomerEmailEnabled: $('.user__receive-customer-email').prop('checked')
                };

                $.ajax({
                    url: '/api/v1/user/email-configuration',
                    type: 'post',
                    contentType: 'application/json',
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
                    },
                    data: JSON.stringify(docSettingsData),
                    success: function(data) {
                        if (typeof data === 'string' && '<!DOCTYPE html>' === data.substring(0, 15)) {
                            window.location = '/login';
                        } else {
                            $('#sp-document-settings__modal .sr-only').click();
                            swal('Success!', 'Your changes have been saved', 'success');
                        }
                    },
                    error: function() {
                        swal('Error!', 'Your changes were not saved', 'error');
                    }
                });
            });
        }),
    },

    view: {
        salesAnalytics: {
            setNavBar: function() {
                $.getJSON('/api/v1/analytics', {action: 'getCustomersFilesList'}, function(data) {
                    var customersFilesList = data.customersFilesList;
                    if (0 < customersFilesList.length) {

                        // Arrange the data for future processing.
                        var customers = {};
                        $.each(customersFilesList, function (i, v) {
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
                                + '</div>'
                            );

                        $.each(customers, function (i, v) {
                            $('#sp-nav-sales-analytics__li > ul')
                                .append('<li class="sp-analytics-customer-name__li"><a class="sp-word-wrap" data-customer-email="' + i + '">' + v.customerName + '</a></li>')
                                .append('<ul class="nav nav-third-level" data-customer-email="' + i + '">');

                            $.each(v.files, function (j, u) {
                                $('#sp-nav-sales-analytics__li ul ul[data-customer-email="' + i + '"]')
                                    .append('<li class="sp-sales-analytics-filename__li"><a class="sp-customer-file__a sp-word-wrap" data-customer-email="'
                                        + i + '" data-file-hash="' + u.fileHash + '">' + u.fileName + '</a></li>');
                            });
                        });

                        //Search
                        sp.view.salesAnalytics.search();

                        /**
                         * CSS overflow styling
                         */
                        var scrollCont = $('<div></div>', {class: 'sp-analytics-container__div', id: 'sp-sales-analytics-scroll'});
                        $('#sp-nav-sales-analytics__li').append(scrollCont);
                        scrollCont.append($('#sp-sales-analytics__ul'));
                    }
                });
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

            setMetrics: function(customerEmail, fileHash) {
                $.getJSON(
                    '/api/v1/analytics',
                    {
                        action: 'getFileCustomerData',
                        fileHash: fileHash,
                        customerEmail: customerEmail
                    },
                    function(data) {
                        // Build dashboard.
                        sp.metric.getViewerWidgetMetrics(data.fileCustomerData[0], customerEmail);

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
            }
        }
    },

    notifications: {
        tableNotifications: 'notificationsTable',
        getNotifications: function() {
            $.getJSON('/api/v1/analytics', {action: 'getNotifications'}, function(data) {
                sp.notifications.displayTableNotifications(data.notifications);
            });
        },

        /**
         * Display Notifications in the Notifications Table.
         *
         * All salesman notifications (up to 1000) are displayed in a DataTable.
         *
         * @function setActionValue - Set an event name based on the event name from
         * the customer_events table.
         * @param {object} notifications - The notifications data.
         */
        displayTableNotifications: function(notifications) {
            var tableData = [];
            var action = '';
            var customer = '';

            $.each(notifications, function(index, notification) {

                // If it is an Ask Question widget event.
                if (notification.event === 'VIEWER_WIDGET_ASK_QUESTION') {
                    if (typeof notification.messageText !== 'undefined' || typeof notification.messageReplyEmail !== 'undefined') {
                        var replyEmail = '';
                        if (typeof notification.messageReplyEmail !== 'undefined' && '' !== notification.messageReplyEmail) {
                            replyEmail = notification.messageReplyEmail;
                        } else {
                            if (notification.customerEmail === 'default@example.com') {
                                replyEmail = 'Generic Link';
                            } else {
                                replyEmail = notification.customerEmail;
                            }
                        }
                        action =
                            '<span>' + replyEmail + " " + setActionValue(notification.event) + ': </span><br>' +
                            '<span><em>' + notification.messageText + '</em></span><br>';
                        customer = notification.customerEmail;
                    }
                } else if (notification.event = 'OPEN_SLIDES') {
                    if (typeof notification.enteredEmailAddress !== 'undefined') {
                        customer = notification.enteredEmailAddress + ' (via: ' + notification.customerEmail + ')';
                    } else {
                        customer = notification.customerEmail;
                    }

                    action = setActionValue(notification.event);
                } else {
                    customer = notification.customerEmail;
                    action = setActionValue(notification.event);
                }

                var date = moment.utc(notification.time).toDate();

                date = moment.utc(notification.time).toDate();

                var tableDataObj = {
                    time: moment(date).format('DD-MM-YYYY HH:mm'),
                    customer: customer,
                    action: action,
                    document: notification.documentName
                };

                delete date;

                /**
                 * If the message email address is empty and it is a generic link, set customer email to Generic Link.
                 */
                if (typeof notification.enteredEmailAddress !== 'undefined'
                    && notification.customerEmail === 'default@example.com') {
                    tableDataObj.customer = notification.enteredEmailAddress + ' (via: Generic Link)';

                } else if (typeof notification.enteredEmailAddress === 'undefined'
                    && notification.customerEmail === 'default@example.com') {
                    tableDataObj.customer = 'Generic Link';
                }

                tableData.push(tableDataObj);
            });

            $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
            if (!($.fn.dataTable.isDataTable('.sp-notifications__table'))) {
                $('.sp-notifications__table').DataTable({
                    data: tableData,
                    buttons: [
                        {
                            extend: 'csv',
                            filename: 'SlidePiper Notifications',
                            text: 'Export to CSV'
                        },
                        {
                            extend: 'print'
                        }
                    ],
                    columns: [
                        {data: 'time'},
                        {data: 'customer'},
                        {data: 'action'},
                        {data: 'document'}
                    ],
                    dom: '<"sp-datatables-search-left"f><"html5buttons"B>ti',
                    paging: false,
                    order: [0, 'desc'],
                    scrollY: '50vh',
                });
            } else {
                $('.sp-notifications__table').DataTable()
                    .clear()
                    .columns.adjust()
                    .rows.add(tableData)
                    .draw();
            }

            /**
             * @param {string} dbAction - The event from the customer_events table.
             */
            function setActionValue(dbAction) {
                var action = '';

                switch(dbAction) {
                    case 'OPEN_SLIDES':
                        action = 'Opened File';
                        break;

                    case 'VIEWER_WIDGET_ASK_QUESTION':
                        action = 'sent you a message';
                        break;
                }

                return action;
            }
        },
    }
};
// End sp.

$(document).ready(function() {
    // Init js tooltip
    $('.sp-doc-settings-info__icon').tooltip({delay: {show: 100, hide: 200}, placement: 'auto' });

    // Load Help modal.
    $('[data-target="#sp-help-salesmen__modal"]').click(function() {
        $('#sp-help-salesmen__modal').load('assets/modal/help-button/main.html');
        new UserEvent('CLICKED_HELP_BUTTON').send();
    });
});

/**
 * Class for sending user events.
 */
UserEvent = function UserEvent(eventType, extraData) {
    this.eventType = eventType;
    this.extraData = extraData;
}

UserEvent.prototype = {
    send: function() {
        var payload = {
            type: this.eventType,
            data: this.extraData
        };

        var xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/v1/events');
        xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(payload));
        xhr.onload = function() {
            if (typeof xhr.response === 'string' && '<!DOCTYPE html>' === xhr.response.substring(0, 15)) {
                window.location = '/login';
            } else if (xhr.status === 403 || xhr.status === 500) {
                window.location = '/login';
            }
        };
    }
}

// Change password.
document.querySelector('.user-change-password').addEventListener('submit', function(event) {
    event.preventDefault();

    var xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/v1/user/change-password');
    xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
    xhr.send(new FormData(event.target));
    xhr.onload = function() {
        if (typeof xhr.response === 'string' && '<!DOCTYPE html>' === xhr.response.substring(0, 15)) {
            window.location = '/login';
        } else if (xhr.status === 204) {
            swal("Success!", "You successfully changed your password", "success");
        } else if (xhr.status === 403 || xhr.status === 500) {
            window.location = '/login';
        } else {
            swal("Error!", xhr.response, "error");
        }
        $('.close').click();
    };
});