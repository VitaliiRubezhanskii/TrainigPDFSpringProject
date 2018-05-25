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
                        window.sp.tasks.getAll();
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
            var hopperTitle = document.querySelector('.sp-hopper-metric__title');
            hopperTitle.textContent = 'Loading...';
            hopperTitle.style.display = 'block';

            var hopperItems = document.querySelector('.sp-hopper-metric__items');
            while (hopperItems.hasChildNodes()) {
                hopperItems.removeChild(hopperItems.lastChild);
            }

            $('.sp-hopper-metric__save-button').remove();

            if (typeof fileData != 'undefined' && typeof fileData[1] != 'undefined' && parseInt(fileData[1]) > 0) {
                $.getJSON('/api/v1/widgets/?fileHash=' + fileData[0] + '&type=5', function(data) {
                    if (data.items.length === 0) {
                        hopperTitle.textContent = 'N/A';
                    } else {
                        var hopperMetric = document.querySelector('.sp-hopper-metric');
                        hopperMetric.setAttribute('data-link', data.link);

                        var ul = document.createElement('ul');
                        ul.className = 'todo-list small-list m-t';
                        data.items.forEach(function(item) {
                            var li = document.createElement('li');
                            var a = document.createElement('a');
                            a.classList = 'sp-hopper-metric__item check-link';
                            var i = document.createElement('i');
                            i.classList = 'sp-hopper-metric__item-status';
                            switch (item.status) {
                                case 'finished':
                                    i.classList += ' sp-hopper-metric__item-status--checked fa fa-check-square';
                                    break;
                                default:
                                    i.classList += ' sp-hopper-metric__item-status--unchecked fa fa-square-o';
                                    break;
                            }
                            a.appendChild(i);
                            li.appendChild(a);

                            var span = document.createElement('span');
                            span.classList = 'sp-hopper-metric__item-content m-l-xs';
                            if ('finished' === item.status) {
                                span.classList += ' todo-completed';
                            }

                            span.setAttribute('data-hopper-text', item.hopperText);
                            span.setAttribute('data-hopper-page', item.hopperPage);

                            span.textContent = item.hopperText;
                            li.appendChild(span);
                            ul.appendChild(li);
                        });
                        hopperItems.appendChild(ul);

                        var saveButton = document.createElement('button');
                        saveButton.classList = 'btn btn-success m-t-sm sp-hopper-metric__save-button';
                        saveButton.disabled = true;
                        saveButton.textContent = 'Save';
                        hopperMetric.appendChild(saveButton);

                        hopperTitle.style.display = 'none';
                    }
                }).fail(function() {
                    hopperTitle.textContent = 'N/A';
                });
            } else {
                hopperTitle.textContent = 'N/A';
            }



//////////////////////////// Upload button data.
           /* var uploadTitle = document.querySelector('.sp-link-metric__title');
            uploadTitle.textContent = 'Loading...';
            uploadTitle.style.display = 'block';

            var uploadItems = document.querySelector('.sp-link-metric__items');
            while (uploadItems.hasChildNodes()) {
                uploadItems.removeChild(uploadItems.lastChild);
            }

            $('.sp-link-metric__save-button').remove();

            if (typeof fileData != 'undefined' && typeof fileData[1] != 'undefined' && parseInt(fileData[1]) > 0) {
                $.getJSON('/api/v1/widgets/?fileHash=' + fileData[0] + '&type=12', function(data) {
                    if (data.items.length === 0) {
                        uploadTitle.textContent = 'N/A';
                    } else {
                        var uploadMetric = document.querySelector('.sp-link-metric');
                        uploadMetric.setAttribute('data-link', data.link);

                        var ul = document.createElement('ul');
                        ul.className = 'todo-list small-list m-t';
                        data.items.forEach(function (item) {
                            var li = document.createElement('li');
                            var a = document.createElement('a');
                            a.classList = 'sp-link-metric__item check-link';
                            var i = document.createElement('i');
                            i.classList = 'sp-link-metric__item-status';
                            a.appendChild(i);
                            li.appendChild(a);

                            var span = document.createElement('span');
                            span.classList = 'sp-link-metric__item-content m-l-xs';

                            span.setAttribute('data-icon', item.icon);
                            span.setAttribute('data-page-to', item.pageTo);
                            span.setAttribute('data-page-from', item.pageFrom);
                            span.setAttribute('data-button-text-1', item.buttonText1);
                            span.setAttribute('data-button-text-2', item.buttonText2);

                            span.textContent = item.buttonText1;
                            li.appendChild(span);
                            ul.appendChild(li);
                        });
                        uploadItems.appendChild(ul);

                        var saveButton = document.createElement('button');
                        saveButton.classList = 'btn btn-success m-t-sm sp-link-metric__save-button';
                        saveButton.disabled = true;
                        saveButton.textContent = 'Save';
                        uploadMetric.appendChild(saveButton);

                        uploadTitle.style.display = 'none';
                    }
                }).fail(function() {
                    uploadTitle.textContent = 'N/A';
                });
            } else {
                uploadTitle.textContent = 'N/A';
            }*/
////////////////////////////////////////////////////////////////////////////////


            // Link data.
            var linkTitle = document.querySelector('.sp-link-metric__title');
            linkTitle.textContent = 'Loading...';
            linkTitle.style.display = 'block';

            var linkItems = document.querySelector('.sp-link-metric__items');
            while (linkItems.hasChildNodes()) {
                linkItems.removeChild(linkItems.lastChild);
            }

            $('.sp-link-metric__save-button').remove();

            if (typeof fileData != 'undefined' && typeof fileData[1] != 'undefined' && parseInt(fileData[1]) > 0) {
                $.getJSON('/api/v1/widgets/?fileHash=' + fileData[0] + '&type=9', function(data) {
                    if (data.items.length === 0) {
                        linkTitle.textContent = 'N/A';
                    } else {
                        var linkMetric = document.querySelector('.sp-link-metric');
                        linkMetric.setAttribute('data-link', data.link);

                        var ul = document.createElement('ul');
                        ul.className = 'todo-list small-list m-t';
                        data.items.forEach(function (item) {
                            var li = document.createElement('li');
                            var a = document.createElement('a');
                            a.classList = 'sp-link-metric__item check-link';
                            var i = document.createElement('i');
                            i.classList = 'sp-link-metric__item-status';
                            switch (item.status) {
                                case 'completed':
                                    i.classList += ' sp-link-metric__item-status--checked fa fa-check-square';
                                    break;
                                default:
                                    i.classList += ' sp-link-metric__item-status--unchecked fa fa-square-o';
                                    break;
                            }
                            a.appendChild(i);
                            li.appendChild(a);

                            var span = document.createElement('span');
                            span.classList = 'sp-link-metric__item-content m-l-xs';
                            if ('completed' === item.status) {
                                span.classList += ' todo-completed';
                            }

                            span.setAttribute('data-icon', item.icon);
                            span.setAttribute('data-link', item.link);
                            span.setAttribute('data-layout', item.layout);
                            span.setAttribute('data-page-to', item.pageTo);
                            span.setAttribute('data-page-from', item.pageFrom);
                            span.setAttribute('data-button-text-1', item.buttonText1);
                            span.setAttribute('data-button-text-2', item.buttonText2);

                            span.textContent = item.buttonText1;
                            li.appendChild(span);
                            ul.appendChild(li);
                        });
                        linkItems.appendChild(ul);

                        var saveButton = document.createElement('button');
                        saveButton.classList = 'btn btn-success m-t-sm sp-link-metric__save-button';
                        saveButton.disabled = true;
                        saveButton.textContent = 'Save';
                        linkMetric.appendChild(saveButton);

                        linkTitle.style.display = 'none';
                    }
                }).fail(function() {
                    linkTitle.textContent = 'N/A';
                });
            } else {
                linkTitle.textContent = 'N/A';
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
                                    + '<p class="sp-widget-ask-question-metric-email"><strong>' + sp.escapeHtml(value[2]) + '</strong></p>'
                                    + '<div class="sp-widget-ask-question-metric-message">' + sp.escapeHtml(value[1]).replace(/\r\n|\r|\n/g, '<br>') + '</div>'
                                    + '<small class="block"><i class="fa fa-clock-o"></i> ' + sp.escapeHtml(value[0]) + '</small>'
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
                                        var tooltipColorKey = '<span class="sp-chart__chartjs-tooltip-color-key" style="' + sp.escapeHtml(style) + '"></span>';

                                        innerHtml += '<tr><td>' + tooltipColorKey + sp.escapeHtml(body) + '</td></tr><br>';
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
});

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
        utilsScript: ""
    });

    $("#phoneNumber").mask("(000) 000-0000");

    document.querySelector( "#sp-add-update-customer__form" )
        .addEventListener( "invalid", function( event ) {
            event.preventDefault();
        }, true );

    $("#phoneNumber").on("change input paste propertychange", ()=>{
        event.preventDefault();
        if($("#phoneNumber").val().length !== 14){
            $(".error").css({display: 'block', color: 'red'});
            $("#phoneNumber").css({border: '1px solid red'});
        } else{
            $(".error").css({display: 'none'});
            $("#phoneNumber").css({border: '1px solid #e5e6e7'});
        }
    });

    $('input[name^="customerID"]').on("change input paste propertychange",()=>{
        event.preventDefault();
        if($('input[name^="customerID"]').val().length > 9){
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

    $(".closeModal").on("click",()=>{
        $(".error, .errorId, .errorEmail").css({display: 'none'});
        $("#phoneNumber, input[name^='customerID'], input[name^='customerEmail']").css({border: '1px solid #e5e6e7'});
        $("#sp-add-update-customer__form")[0].reset();
    });

    $(".sp-add-update-customer").on("click", ()=>{
        $("#sp-add-update-customer__form")[0].reset();
    });

    $("#sp-add-update-customer__form").on("propertychange change blur click keyup input paste",function(){
        var phoneNumber = $("#phoneNumber").val().length;
        var customerId = $('input[name^="customerID"]').val().length;
        var email = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test($('input[name^="customerEmail"]').val());
        if(email === true && customerId <=9 && phoneNumber === 14){
            $("#sp-modal-add-update-customer__button").prop("disabled", false);
        } else {
            $("#sp-modal-add-update-customer__button").prop("disabled", true);
        }
    });
})
