function init() {
    customerDocumentsWizardConfig();
    documentsCheckboxListener();
    wizardConfig();
    checkboxListener();
}
var sp = sp || {};
sp = {
    fileHash: null,
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

            if (data.email_support_show_alert_enabled) {
                $('#sp-enable-support-emails__checkbox').prop('checked', true);
            } else {
                $('#sp-enable-support-emails__checkbox').prop('checked', false);
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
                            + sp.escapeHtml(filesList[i][0]) + '">' + sp.escapeHtml(filesList[i][1]) + '</a></li>');
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
                an.metric.getViewerWidgetMetrics(data.fileData[0]);
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

            // Customize Toolbar.
            $('[data-target="#sp-toolbar-settings__modal"]').on('click', function () {
                $('#sp-toolbar-settings__modal').load('assets/modal/navbar-customization/main.html');
                new UserEvent('CLICKED_TOOLBAR_SETTINGS').send();
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
                        getFilesList(requestOrigin);
                        getCustomersList(requestOrigin);
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
                        getCustomersList(requestOrigin);
                        getFilesList(requestOrigin);
                        break;

                    case 'sp-notifications-table':
                        sp.notifications.getNotifications(sp.notifications.tableNotifications);
                        break;

                    case 'navigation__tasks':
                        $('.tasks').show();
                        getAll();
                        break;

                    case 'sp-customer-documents':
                        requestOrigin = 'customerDocumentsGenerator';
                        $('.sp-customer-documents-container-hidden').removeClass('sp-customer-documents-container-hidden');
                        $('#document-wizard-t-0').click();
                        getCustomersList(requestOrigin);
                        break;
                }

                function resetDashboardData() {
                    $('#sp-widget-total-views').text('0');
                    $('#sp-widget-bounce-rate, #sp-widget-average-view-duration, #sp-widget-average-pages-viewed, #sp-widget-top-exit-page, #sp-widget-users-cta').text('N/A');

                    $('.sp-hopper-metric__items').empty();
                    $('.sp-hopper-metric__title').text('N/A').show();
                    $('.sp-link-metric__items').empty();
                    $('.sp-link-metric__title').text('N/A').show();
                    $('#sp-widget-video-youtube-metric-total-number-plays').text('N/A');
                    $('#sp-widget-ask-question-metric').hide();
                    $('#sp-widget-total-count-likes').text('N/A');
                    $('#sp-widget-count-unique-views').text('N/A');

                    an.chart.averageViewDurationData = {};
                    if (typeof an.chart.fileBar !== 'undefined') {
                        an.chart.fileBar.destroy();
                    }

                    an.chart.totalViewsData = {};
                    if (typeof an.chart.fileLine !== 'undefined') {
                        an.chart.fileLine.destroy();
                    }

                    if (typeof an.chart.visitorsMap !== 'undefined') {
                        an.chart.visitorsMap.clearChart();
                    }
                }
            }

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
                    receiveCustomerEmailEnabled: $('.user__receive-customer-email').prop('checked'),
                    supportEmailEnabled: $('#sp-enable-support-emails__checkbox').prop('checked')
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
                                .append('<li class="sp-analytics-customer-name__li"><a class="sp-word-wrap" data-customer-email="' + sp.escapeHtml(i) + '">' + sp.escapeHtml(v.customerName) + '</a></li>')
                                .append('<ul class="nav nav-third-level" data-customer-email="' + sp.escapeHtml(i) + '">');

                            $.each(v.files, function (j, u) {
                                $('#sp-nav-sales-analytics__li ul ul[data-customer-email="' + sp.escapeHtml(i) + '"]')
                                    .append('<li class="sp-sales-analytics-filename__li"><a class="sp-customer-file__a sp-word-wrap" data-customer-email="'
                                        + sp.escapeHtml(i) + '" data-file-hash="' + sp.escapeHtml(u.fileHash) + '">' + sp.escapeHtml(u.fileName) + '</a></li>');
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
                        an.metric.getViewerWidgetMetrics(data.fileCustomerData[0], customerEmail);

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
                        action = replyEmail + " " + setActionValue(notification.event) + ': ' + notification.messageText;
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
                        {
                            data: 'customer',
                            render: $.fn.dataTable.render.text()
                        },
                        {
                            data: 'action',
                            render: $.fn.dataTable.render.text()
                        },
                        {
                            data: 'document',
                            render: $.fn.dataTable.render.text()
                        }
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
                        action = 'Opened portal';
                        break;

                    case 'VIEWER_WIDGET_ASK_QUESTION':
                        action = 'sent you a message';
                        break;
                }

                return action;
            }
        },
    },
    
    escapeHtml: function(input) {
        var entityMap = {
            '&': '&#38;',
            '<': '&#60;',
            '>': '&#62;',
            '"': '&#34;',
            "'": '&#39;',
            '/': '&#47;',
            '`': '&#96;',
            '=': '&#61;'
        };

        return String(input).replace(/[&<>"'`=\/]/g, function(char) {
            return entityMap[char];
        });
    }
};
// End sp.

$(document).ready(function() {
    init();
    // Init js tooltip
    $('.sp-doc-settings-info__icon').tooltip({delay: {show: 100, hide: 200}, placement: 'auto' });

    // Load Help modal.
    $('[data-target="#sp-help-salesmen__modal"]').click(function() {
        $('#sp-help-salesmen__modal').load('assets/modal/help-button/main.html');
        new UserEvent('CLICKED_HELP_BUTTON').send();
    });
    // send switcher state
    $('body')
        .on('change', '.twofactorauth-switch', function (e) {
            var documentId = $(this).closest('.options-wrapper').data('id');
            var targetElement = e.target;
            var targetElementsChecked = targetElement.checked ? 'ON' : 'OFF';
            var conditionalMessage = targetElement.checked ? "i – Double authentication requires a customer id and cellular number. Then you must make a link for each customer and send it to them.":"i – Turning off double authentication will make this portal public to anyone with a portal link";
                swal({
                    title: 'Please confirm to turn ' +  targetElementsChecked + ' double authentication for this portal?',
                    type: "warning",
                    text:'<div class="info-block" data-title= "' + conditionalMessage + '"><i class="fa fa-info" aria-hidden="true"></i></div>',
                    html: true,
                    confirmButtonText: 'Yes, turn ' + targetElementsChecked,
                    showCancelButton: true,
                    closeOnConfirm: true,
                    cancelButtonColor: "#DC3545",
                    closeOnCancel: true,
                    allowOutsideClick: true,

                },
                function(isConfirm){
                    if (isConfirm) {
                        saveAuthSettings({ isMFAEnabled: targetElement.checked }, documentId);
                    } else {
                        targetElement.checked ? targetElement.checked = false :  targetElement.checked = true;
                    }
                });
            $('.sweet-alert button.cancel').addClass('cancel-red');
        });

    $('body')
        .on('change', '.processMode-switch', function (e) {
            var documentId = $(this).closest('.options-wrapper').data('id');
            var targetElement = e.target;
            swal({
                    title: `Please confirm turning ${targetElement.checked? 'process':'portal'} mode`,
                    type: "warning",
                    text:`<div class="info-block" data-title= "${targetElement.checked ? "i – Process mode is usually used to run a 'to-do' process with tasks and a process bar. Widgets available in this mode are: process Hopper, Questions widget, Video, Testimonial, Task widget":"i – Portal mode is usually used to run a presentation style or informational portal. widgets available in this mode are: Navigation Hopper and horizontal, Questions widget, Video, Testimonial, Task widget, Like widget, Calendly widget and Code widget"}"><i class="fa fa-info" aria-hidden="true"></i></div>`,
                    html: true,
                    confirmButtonText: `Yes, turn on ${targetElement.checked? 'process':'portal'} mode`,
                    showCancelButton: true,
                    closeOnConfirm: true,
                    cancelButtonColor: "#DC3545",
                    closeOnCancel: true,
                    allowOutsideClick: true,

                },
                function(isConfirm){
                    if (isConfirm) {
                        saveAuthSettings({isProcessMode: targetElement.checked }, documentId);
                    } else {
                        targetElement.checked ? targetElement.checked = false :  targetElement.checked = true;
                    }
                });
            $('.sweet-alert button.cancel').addClass('cancel-red');
        });
});

function saveAuthSettings(data, fileHash) {
    $.ajax({
        url:'/api/v1/documents/' + fileHash,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        beforeSend: function(xhr) {
            xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
        },
        error: function() {
            swal('Error', 'Something went wrong. Your settings weren\'t saved.', 'error');
        }
    });
}


/**
 * Class for sending user events.
 */
UserEvent = function UserEvent(eventType, extraData) {
    this.eventType = eventType;
    this.extraData = extraData;
};

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

// Dashboard Hopper / Milestone status change
$(document).on('click', '.sp-hopper-metric__save-button', function() {
    var items = [];
    $('.sp-hopper-metric__item').each(function() {
        var item = {};
        if ($(this).find('.sp-hopper-metric__item-status').hasClass('sp-hopper-metric__item-status--checked')) {
            item.status = 'finished';
        } else {
            item.status = 'unfinished';
        }
        item.hopperPage = $(this).next('.sp-hopper-metric__item-content').attr('data-hopper-page');
        item.hopperText = $(this).next('.sp-hopper-metric__item-content').attr('data-hopper-text');

        items.push(item);
    });

    var data = {
        type: '5',
        items: items
    };

    $.ajax({
        url: document.querySelector('.sp-hopper-metric').getAttribute('data-link'),
        method: 'PATCH',
        beforeSend: function(xhr) {
            xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
        },
        contentType : 'application/json',
        data: JSON.stringify(data)
    }).done(function() {
        swal("Success!", "You successfully changed the status of the Hopper / Milestone", "success");
    });

    $('.sp-hopper-metric__save-button').prop('disabled', true);
});


// Dashboard Link / Task status change
$(document).on('click', '.sp-link-metric__save-button', function() {
    var items = [];
    $('.sp-link-metric__item').each(function() {
        var item = {};
        if ($(this).find('.sp-link-metric__item-status').hasClass('sp-link-metric__item-status--checked')) {
            item.status = 'completed';
        }
        item.icon = $(this).next('.sp-link-metric__item-content').attr('data-icon');
        item.link = $(this).next('.sp-link-metric__item-content').attr('data-link');
        item.layout = $(this).next('.sp-link-metric__item-content').attr('data-layout');
        item.pageTo = $(this).next('.sp-link-metric__item-content').attr('data-page-to');
        item.pageFrom = $(this).next('.sp-link-metric__item-content').attr('data-page-from');
        item.buttonText1 = $(this).next('.sp-link-metric__item-content').attr('data-button-text-1');
        item.buttonText2 = $(this).next('.sp-link-metric__item-content').attr('data-button-text-2');

        items.push(item);
    });

    var data = {
        type: '9',
        items: items
    };

    $.ajax({
        url: document.querySelector('.sp-link-metric').getAttribute('data-link'),
        method: 'PATCH',
        beforeSend: function(xhr) {
            xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
        },
        contentType : 'application/json',
        data: JSON.stringify(data)
    }).done(function() {
        swal("Success!", "You successfully changed the status of the Link / Task", "success");
    });

    $('.sp-link-metric__save-button').prop('disabled', true);
});

$(document).on('click', '.sp-hopper-metric__item', function() {
    /**
     * @see inspinia.js - Small todo handler
     */
    var button = $(this).find('i');
    var label = $(this).next('span');
    button.toggleClass('fa-check-square fa-square-o sp-hopper-metric__item-status--checked sp-hopper-metric__item-status--unchecked');
    label.toggleClass('todo-completed');

    $('.sp-hopper-metric__save-button').prop('disabled', false);
    return false;
});

$(document).on('click', '.sp-link-metric__item', function() {
    /**
     * @see inspinia.js - Small todo handler
     */
    var button = $(this).find('i');
    var label = $(this).next('span');
    button.toggleClass('fa-check-square fa-square-o sp-link-metric__item-status--checked sp-link-metric__item-status--unchecked');
    label.toggleClass('todo-completed');

    $('.sp-link-metric__save-button').prop('disabled', false);
    return false;
});

$(function() {
    $("#phoneNumber").intlTelInput({
        allowDropdown: true,
        autoHideDialCode: true,
        autoPlaceholder: "polite",
        customPlaceholder: null,
        dropdownContainer: "",
        excludeCountries: [],
        formatOnDisplay: true,
        geoIpLookup: null,
        hiddenInput: "",
        initialCountry: "",
        nationalMode: true,
        onlyCountries: [],
        placeholderNumberType: "MOBILE",
        preferredCountries: ["il","us", "gb"],
        separateDialCode: false,
        utilsScript: "../../../../assets/js/plugins/phone/build/js/utils.js"
    });

    // $("#phoneNumber").mask("(000) 000-0000");

    document.querySelector( "#sp-add-update-customer__form" )
        .addEventListener( "invalid", function( event ) {
            event.preventDefault();
        }, true );

    $("#phoneNumber").on("change input paste propertychange", function(){
        event.preventDefault();
        if(!$("#phoneNumber").intlTelInput("isValidNumber")){
            $(".error").css({display: 'block', color: 'red'});
            $("#phoneNumber").css({border: '1px solid red'});
        } else{
            $(".error").css({display: 'none'});
            $("#phoneNumber").css({border: '1px solid #e5e6e7'});
        }
    });

    $('input[name^="customerFirstName"]').on("change input paste propertychange", ()=>{
        event.preventDefault();
    if(!/^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/.test($('input[name^="customerFirstName"]').val())){
        $(".errorName").css({display: 'block', color: 'red'});
        $('input[name^="customerFirstName"]').css({border: '1px solid red'});
    } else{
        $(".errorName").css({display: 'none'});
        $('input[name^="customerFirstName"]').css({border: '1px solid #e5e6e7'});
    }
});

    $('input[name^="customerLastName"]').on("change input paste propertychange", ()=>{
        event.preventDefault();
    if(!/^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/.test($('input[name^="customerLastName"]').val())){
        $(".errorLastName").css({display: 'block', color: 'red'});
        $('input[name^="customerLastName"]').css({border: '1px solid red'});
    } else{
        $(".errorLastName").css({display: 'none'});
        $('input[name^="customerLastName"]').css({border: '1px solid #e5e6e7'});
    }
});

    $('input[name^="customerID"]').on("change input paste propertychange",()=>{
        event.preventDefault();
    if(!/^[0-9]{0,10}$/.test($('input[name^="customerID"]').val())){
        $(".errorId").css({display: 'block', color: 'red'});
        $('input[name^="customerID"]').css({border: '1px solid red'});
    } else{
        $(".errorId").css({display: 'none'});
        $('input[name^="customerID"]').css({border: '1px solid #e5e6e7'});
    }
});

    $('input[name^="customerEmail"]').on("change input paste propertychange",()=>{
        event.preventDefault();

    if(!/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test($('input[name^="customerEmail"]').val())){
        $(".errorEmail").css({display: 'block', color: 'red'});
        $('input[name^="customerEmail"]').css({border: '1px solid red'});
    } else{
        $(".errorEmail").css({display: 'none'});
        $('input[name^="customerEmail"]').css({border: '1px solid #e5e6e7'});
    }
});

    $(".sp-add-update-customer").on("click", ()=>{
        $(".error, .errorId, .errorEmail, .errorName, .errorLastName").css({display: 'none'});
    $("#phoneNumber, input[name^='customerID'], input[name^='customerEmail'], input[name^='customerFirstName'], input[name^='customerLastName']").css({border: '1px solid #e5e6e7'});
    $("#sp-add-update-customer__form")[0].reset();
});

    $("#sp-add-update-customer__form").on("propertychange change blur click keyup input paste",function(){
        var firstName = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/.test($('input[name^="customerFirstName"]').val());
        var lastName = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/.test($('input[name^="customerLastName"]').val());
        var email = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test($('input[name^="customerEmail"]').val());
        if(email === true && firstName === true && lastName === true){
            $("#sp-modal-add-update-customer__button").prop("disabled", false);
        } else {
            $("#sp-modal-add-update-customer__button").prop("disabled", true);
        }
    });
})
