    //     files: [],
function getFilesList(requestOrigin) {
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

            fileCallback(data, requestOrigin);

        }
    );
}

function fileCallback(data, requestOrigin) {
    // do something with data
    /**
     * @params {data - obj} This is the data received from the server
     * @params {requestOrigin - String} The request origin routes the the sending of the data either for the
     *          file upload, or to the send document wizard
     */

    if (requestOrigin === 'fileUploadDashboard'){
        sortDocsInDocsMgmtPanel(data);
    }
    else if (requestOrigin === 'customerFileLinksGenerator') {
        formatFile(data);

    }
}

/**
 * @params {data - obj} This is the file data received from the server, which has
 *          been passed through the callback function.
 * The data will now be printed to 'Documents & Customers, Upload Documents'
 *
 */
function sortDocsInDocsMgmtPanel(data) {
    var filesArr = [];
    $.each(data['filesList'], function (index, value) {
        var date = moment.utc(value[2]).toDate();
        var checked = "";
        var processChecked = sp.escapeHtml(value[4]) === '0' ? false : true;

        if(sp.escapeHtml(value[5]) == 1) {
            checked = "checked";
        }

        if(sp.escapeHtml(value[4]) == 1) {
            processChecked = "checked";
        }
        var obj = {
            'date': moment(date).format('DD-MM-YYYY HH:mm'),
            'document': '<span class="sp-file-mgmt-file-name" data-file-hash="' + sp.escapeHtml(value[0]) +'">' + sp.escapeHtml(value[1]) + '</span>',
            'options': '<span>'
            + '<a><span class="label label-primary sp-file-update" data-toggle="modal" data-target="#sp-modal-update-file" data-file-hash="' + sp.escapeHtml(value[0]) + '">Update</span></a>'
            + '<a href="#"><span class="label label-danger sp-file-delete" data-file-hash="' + sp.escapeHtml(value[0]) + '">Delete</span></a></span>'
            + '<a><span style="margin-left: 10px;" class="sp-document__clone label label-info" data-document-friendly-id="' + sp.escapeHtml(value[0]) + '" data-document-name="' + sp.escapeHtml(value[1]) + '">Clone</span></a>'
            + '<a><span data-toggle="modal" data-target="#sp-viewer-widgets-modal" style="margin-left: 10px;" class="label label-success sp-file-customize" data-file-hash="' + sp.escapeHtml(value[0]) + '" data-is-process-mode="' + sp.escapeHtml(value[4]) + '">Customize</span></a>'
            + '<a class="sp-preview-file-link"><span id="sp-preview-file-' + sp.escapeHtml(index) + '" style="margin-left: 10px;" class="label label-warning" data-is-process-mode="' + sp.escapeHtml(value[4]) + '">Preview</span></a>'
            +'<div data-id="' + sp.escapeHtml(value[0]) +  '" class="material-switch pull-right options-wrapper">'
            +'<span class="authLabel">MFA on/off</span>'
            +'<input class="twofactorauth-switch" id="someSwitchOptionPrimary-' + sp.escapeHtml(index) + '" name="double-auth-is-enabled" name="someSwitchOption-' + sp.escapeHtml(index) + '" type="checkbox" ' + checked + '/>'
            +'<label for="someSwitchOptionPrimary-' + sp.escapeHtml(index) + '" class="label-primary"></label></div>'
            +'<div data-id="' + sp.escapeHtml(value[0]) +  '" class="material-switch pull-right options-wrapper">'
            +'<span class="processModeLabel">Mode Portal/Process</span>'
            +'<input class="processMode-switch" id="procSwitchOptionPrimary-' + sp.escapeHtml(index) + '" name="process-mode-is-enabled" name="procSwitchOption-' + sp.escapeHtml(index) + '" type="checkbox"' + processChecked + '/>'
            +'<label for="procSwitchOptionPrimary-' + sp.escapeHtml(index) + '" class="label-primary"></label>'
            + '</div>'
            +'</span>'
        };
        filesArr.push(obj);

        setFileLinkAttribute(
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
        var isProcessMode = $(this).attr('data-is-process-mode');
        var processModeChecked = $(this).closest("td").find(".processMode-switch")[0].checked;
        $('#sp-viewer-widgets-modal').load('assets/modal/viewer-widgets-wizard/main.html', function () {
            $('.sp-widgets-customisation__spinner').addClass('sp-widgets-customisation__spinner-show');

            $.getScript('assets/js/plugins/spectrum/spectrum.js', function() {
                $('#sp-question-widget__color-picker').spectrum({
                    appendTo: '#sp-viewer-widgets-modal',
                    chooseText: 'Choose',
                    cancelText: 'Cancel',
                    preferredFormat: 'hex',
                    showAlpha: true,
                    showInput: true,
                });

                $('#sp-share-widget__color-picker').spectrum({
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
                    $('#sp-save-test-widgets-settings__button').attr('data-is-process-mode', processModeChecked);
                    if(processModeChecked){
                        $('a[href = "#sp-tab-10"],a[href = "#sp-tab-2"],a[href = "#sp-tab-11"],a[href = "#sp-tab-4"],a[href = "#sp-tab-7"],a[href = "#sp-tab-8"]').addClass('hidden-block');
                        $('input[name^="hopper-widget-is-enabled"], input[name^="horizontal-hopper-widget-start-page"]').closest('div').addClass('hidden-block');
                    }
                    else {
                        $('a[href = "#sp-tab-10"],a[href = "#sp-tab-2"],a[href = "#sp-tab-11"],a[href = "#sp-tab-4"],a[href = "#sp-tab-7"],a[href = "#sp-tab-8"]').removeClass('hidden-block');
                    }
                    sp.viewerWidgetsModal.getWidgetsSettings(fileHash, isProcessMode);

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
}

function deleteFile(fileHash) {
    $.ajax({
        url: '/api/v1/documents/' + fileHash,
        type: 'DELETE',
        cache: false,
        processData: false,
        contentType: false,
        beforeSend: function(xhr) {
            xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
        },
    }).done(function(data) {
            if (typeof data === 'string' && '<!DOCTYPE html>' === data.substring(0, 15)) {
                window.location = '/login';
            } else {
                getFilesList('fileUploadDashboard');
                swal("Deleted!", "Your file has been deleted.", "success");
            }
        });
}

/**
 * Add data-file-link attribute containing a user file link to an HTML element.
 *
 * @param {String} fileHash - A file hash.
 * @param {String} customerEmail - A customer email.
 * @param {String} salesmanEmail - A salesman email.
 * @param {String} targetId - The id attribute of a target HTML element.
 */
function setFileLinkAttribute(fileHash, customerEmail, targetId) {
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
}

/* Customers mgmt. */
function getCustomersList(requestOrigin) {
    $.getJSON(
        '/api/v1/analytics',
        {action: 'getCustomersList'},
        function(data) {
            /**
             * @see comment on line 341
             */
            customerCallback(data, requestOrigin);
        });
}

function customerCallback(data, requestOrigin) {
    /**
     * @see similar callback function above
     */
    if (requestOrigin === 'fileUploadDashboard'){
        sortForDocUpload(data);
    }
    else if (requestOrigin === 'customerFileLinksGenerator') {
        formatCustomers(data);
    }
    else if (requestOrigin === 'customerDocumentsGenerator') {
        customerDocumentsFormatCustomers(data);
    }
}

function sortForDocUpload(data) {
    var nameArr = [];
    $.each(data['customersList'], function (i, row) {

        var date = moment.utc(row[4]).toDate();
        var obj = {
            'date': moment(date).format('DD-MM-YYYY HH:mm'),
            'name':  '<span id="sp-customer-first-name__td">' + sp.escapeHtml(row[0]) + '</span> <span id="sp-customer-last-name__td">' + sp.escapeHtml(row[1]) + '</span></span>' ,
            'company': '<span id="sp-customer-company__td">' + sp.escapeHtml(row[2]) + '</span>',
            'email':  '<span class="contact-type"><i class="fa fa-envelope"> </i></span>' + '         '  + sp.escapeHtml(row[3]) + '',
            'options': '<td><a href="#"><span class="label label-primary sp-add-update-customer sp-customer-update" data-add-update="update" data-toggle="modal" data-target="#sp-modal-add-update-customer" data-customer-email="' + sp.escapeHtml(row[3]) + '">Update</span></a><a href="#"><span class="label label-danger sp-customer-delete" data-customer-email="' + sp.escapeHtml(row[3]) + '">Delete</span></a></td>',
            'group': '<span id="sp-customer-group__td">' + sp.escapeHtml(row[5]) + '</span>',
            'id': '<span id="sp-customer-id__td">' + sp.escapeHtml(row[7]) + '</span>',
            'phone': '<span id="sp-customer-phone__td">' + sp.escapeHtml(row[8]) + '</span>'
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
                {data: 'id'},
                {data: 'phone'},
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
}

function addUpdateCustomer(event) {
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
        // data[$(this).attr('name')] = $(this).val();
        if($(this).attr('name') === "customerPhone"){
            data[$(this).attr('name')] = $('#phoneNumber').intlTelInput("getNumber");
        } else{
            data[$(this).attr('name')] = $(this).val();
        }
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
                getCustomersList('fileUploadDashboard');
                getCustomersList('customerFileLinksGenerator');
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
}

function deleteCustomer(customerEmail) {
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
            getCustomersList('fileUploadDashboard');
        }
    });
}

/**
 * This object handles the wizard where a user can choose customers
 * and documents they'd like to send them
 */

/**
 * This function is the configuration for the wizard - @see jQuery Steps www.jquery-steps.com/
 * Immediatley invoked i.e. when the page loads - this is because initialising the jQuery steps
 * causes bugs that stop it from working
 * @returns false or true, which highlights the current index of the wizard, allowing for errors to be
 * thrown if the user has not checked a box, and wants to move to the next part
 */
        function wizardConfig() {
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
                    }

                    $('#sp-customer-table').DataTable()
                        .search('').draw();

                    $('#sp-doc-table').DataTable()
                        .search('').draw();

                    if (0 === currentIndex && (! $('#sp-customer-table tbody input[type="checkbox"]').is(':checked'))){
                        sp.error.handleError('You must select at least one customer to continue');
                        return false;
                    } else if (1 === currentIndex && (! $('#sp-doc-table tbody input[type="checkbox"]').is(':checked'))) {
                        sp.error.handleError('You must select at least one document to continue');
                        return false;
                    } else {
                        return true;
                    }
                },
                onStepChanged: function(event, currentIndex) {
                    switch(currentIndex) {
                        case 0:
                            $('#sp-customer-table').DataTable()
                                .columns.adjust().draw();
                            break;

                        case 1:
                            $('#sp-doc-table').DataTable()
                                .columns.adjust().draw();
                            break;

                        case 2:
                            $('#sp-send-table').DataTable()
                                .columns.adjust().draw();
                            break;
                    }
                }
            });
        }

/**
 * This function formats and prints customers to the document sending wizard using DataTables API
 * @params {data - object} This is the data on the customers recevied from the server
 * This object contains both customer and file data @see formatFile()
 */
function formatCustomers(data) {
    var nameArr = [];

    $.each(data['customersList'], function (index, value) {
        var date = moment.utc(value[4]).toDate();

        var obj = {
            checkbox: index,
            name: sp.escapeHtml(value[0]) + ' ' + sp.escapeHtml(value[1]),
            company: sp.escapeHtml(value[2]),
            email: '<span data-email=' + sp.escapeHtml(value[3]) +' class="sp-email"> ' + sp.escapeHtml(value[3]) + '</span>',
            date:  moment(date).format('DD-MM-YYYY HH:mm'),
            group: sp.escapeHtml(value[5])
        };
        nameArr.push(obj);
    });

    $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
    if (!($.fn.dataTable.isDataTable('#sp-customer-table'))) {
        $('#sp-customer-table').DataTable({
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
        $('#sp-customer-table').DataTable()
            .clear()
            .rows.add(nameArr)
            .draw();
    }
}

/**
 * This function ensure the wizard is always at the top, the scrollbar often
 * makes this not possible
 */
function scrollTop() {
    $('#document-wizard-t-0, #document-wizard-t-1, #document-wizard-t-2, #document-wizard a[href="next"], #document-wizard a[href="previous"]')
        .on('click', function () {
            $('.content').animate({scrollTop: 0}, 1, 'linear');
        });
}

/**
 * This function formats and renders documents to the wizard, using the DataTables API
 * @params {data-obj} - This is the files data received from the server
 */
function formatFile(data) {
    var fileArr = [];

    $.each(data['filesList'], function (index, value) {
        var date = moment.utc(value[2]).toDate();

        var obj = {
            checkbox: index,
            name: '<span class="sp-doc-name" data-file-name="' + sp.escapeHtml(value[1]) + '" data-file-hash="' + sp.escapeHtml(value[0]) + '">' + sp.escapeHtml(value[1]) + '</span>',
            date: moment(date).format('DD-MM-YYYY HH:mm'),
        };
        fileArr.push(obj);
    });

    $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
    if (!($.fn.dataTable.isDataTable('#sp-doc-table'))) {
        $('#sp-doc-table').DataTable({
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
        $('#sp-doc-table').DataTable()
            .clear()
            .rows.add(fileArr)
            .draw();
    }

    toggleBtnAttr();
}

function toggleBtnAttr() {
    if ($('#document-wizard li.current').text() === 'current step: 2. Select Documents'){
        $('#document-wizard a[href="#next"]').attr('id', 'sp-send-docs__button');
    }
}

/**
 *  Listener to save which boxes have been checked i.e. which documents the
 *  user wants to send, and to whom.
 *  $('#document-wizard-t-x') is a selector on the inspinia wizard object
 *        @see http://webapplayers.com/inspinia_admin-v2.5/form_wizard.html#
 *  $('a[href="next"]') is also an INSPINIA generated selector
 */

function checkboxListener() {
    $('#document-wizard-t-2').addClass('sp-enumerate-customers-files__button');
    $('#document-wizard-t-1').addClass('sp-enumerate-customers-files__button');
    $('#sp-send-docs__button').addClass('sp-enumerate-customers-files__button');
    $('.sp-enumerate-customers-files__button').on('click', function (e) {

        // This checks If wizard-step is document selector tab in order to start saving the
        // chosen sections.
        if ($('#document-wizard li.current').text() === 'current step: 3. Generated Links'){
            var customerArr = [];
            var fileArr = [];
            var files = [];

            $('#sp-customer-table').DataTable()
                .search('').draw();

            $('#sp-doc-table').DataTable()
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
            sortDocsAndCustomersForServer(customerArr, fileArr, files);
        }
    });
}

/**
 * Create obj to send.
 * Each email address becomes attached to all the documents
 */
function sortDocsAndCustomersForServer(customers, documents, files) {
    var dataToSend = [];
    $.each(customers, function (i, v) {
        var obj = {
            customerEmail: v,
            fileHashes: documents
        };
        dataToSend.push(obj);
    });
    sendDocsAndCustomersToServer(dataToSend, files);
}

function sendDocsAndCustomersToServer(dataToSend, files) {
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
                renderCustomerChoice(data, files);
                new UserEvent('GENERATED_DOCUMENT_LINK').send();
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}


/**
 * Create 'Send Documents' step in wizard.
 *
 * Create DataTable of customers, document name, and file links.
 * The DataTable includes functionality to export the table as a CSV.
 *
 * @param {object} files - The files data - The file name and fileHash.
 * @param {object} data - The selected customers and the corresponding fileHash and fileLink from the DB.
 */
function renderCustomerChoice(data, files) {
    var customerFileLinks = [];
    var dataTableColumns = [];

    /**
     * Remove and add the table HTML and reinitialise DataTable.
     *
     * Selecting documents and customers to be sent creates a table with as many columns, but then selecting
     * another would require more columns. This would be an issue for the DataTable already created, thus it is
     * better to create a new one.
     */
    if ($.fn.dataTable.isDataTable('#sp-send-table')) {
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
            .append('<th>sp-file-name-' + sp.escapeHtml(index + 1) + '</th>')
            .append('<th>sp-file-link-' + sp.escapeHtml(index + 1) + '</th>');
    });

    $.each(data, function (index, customer) {
        var customerTableData = {};

        var documentName = '';
        var documentLink = '';
        $.each(customer.files, function(index, fileData) {

            customerTableData.email = '<span class="sp-send-documents__email-address">' + sp.escapeHtml(customer.customerEmail) + '</span>';
            documentName +=
                '<span class="sp-send-documents__file-name">' + sp.escapeHtml(getDocumentName(fileData.fileHash, files)) + '</span><br>';

            documentLink +=
                '<span class="sp-send-documents__file-link">' + SP.VIEWER_URL_WITHOUT_FILELINK + sp.escapeHtml(fileData.fileLink) + '</span><br>';

            customerTableData.document = documentName;
            customerTableData.link = documentLink;

            customerTableData.copy = '<button class="btn btn-white btn-sm sp-mail-all__button sp-copy-all">' +
                '<i class="fa fa-copy sp-mail__icon"></i><span> Copy</span>' +
                '</button>';

            customerTableData['sp-file-name-' + (index + 1)] = sp.escapeHtml(getDocumentName(fileData.fileHash, files));
            customerTableData['sp-file-link-' + (index + 1)] = SP.VIEWER_URL_WITHOUT_FILELINK + sp.escapeHtml(fileData.fileLink);
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

    if (! $.fn.dataTable.isDataTable('#sp-send-table')) {
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

    copyAll();
    $('.sp-send-email__export-info').tooltip({delay: {show: 100, hide: 200}, placement: 'auto' });
}


/**
 * This function allows the user to copy all documents being
 * sent to a particular email address
 *
 * Uses clipboard js https://clipboardjs.com/
 * @returns the array of links that need to be copied
 */
function copyAll() {

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
}

/**
 * Get the file name by fileHash.
 *
 * File-hash is linked to file-name in an object - so name can be retrieved by hash
 * @param {string} hash - the file hash
 * @param {arr of objs} - the file objects containing k/v pair of hash and document name
 *
 * @returns {string} fileName - The file name.
 */
function getDocumentName(hash, files) {
    var fileName = '';

    $.each(files, function () {
        if (this.hash === hash){
            fileName = this.name;
        }
    });

    return fileName;
}