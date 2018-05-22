function customerDocumentsWizardConfig() {
    $('#customer-document-wizard').steps({
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

            $('#sp-documents-customer-table').DataTable()
                .search('').draw();

            if (0 === currentIndex && (! $('#sp-documents-customer-table tbody input[type="checkbox"]').is(':checked'))){
                sp.error.handleError('You must select at least one customer to continue');
                return false;
            } else if (1 === currentIndex && (! $('#sp-documents-doc-table tbody input[type="checkbox"]').is(':checked'))) {
                sp.error.handleError('You must select at least one portal to continue');
                return false;
            } else {
                return true;
            }
        },
        onStepChanged: function(event, currentIndex) {
            switch(currentIndex) {
                case 0:
                    $('#sp-documents-customer-table').DataTable()
                        .columns.adjust().draw();
                    break;
            }
        }
    });
}

function customerDocumentsFormatCustomers(data) {
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
    if (!($.fn.dataTable.isDataTable('#sp-documents-customer-table'))) {
        $('#sp-documents-customer-table').DataTable({
            select: {
                style: 'multi'
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

            ],
            dom: '<"sp-datatables-search-left"f>ti',
            order: [[5, 'desc']],
            scrollY: '15vh',
            paging: false
        });
    } else {
        $('#sp-documents-customer-table').DataTable()
            .clear()
            .rows.add(nameArr)
            .draw();
    }
}

/**
 * This function formats and renders documents to the wizard, using the DataTables API
 * @params {data-obj} - This is the files data received from the server
 */
function customerDocumentsFormatFile(data) {
    var fileArr = [];

    $.each(data['portalsList'], function (index, value) {
        var date = moment.utc(value[2]).toDate();

        var obj = {
            checkbox: index,
            name: '<span class="sp-doc-name" data-file-name="' + sp.escapeHtml(value[1]) + '" data-file-hash="' + sp.escapeHtml(value[0]) + '">' + sp.escapeHtml(value[1]) + '</span>',
            date: moment(date).format('DD-MM-YYYY HH:mm'),
            customer: '<span class="sp-customer-email" data-customer-email="' + sp.escapeHtml(value[4]) + '">' + sp.escapeHtml(value[4]) + '</span>'
        };
        fileArr.push(obj);
    });

    $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
    if (!($.fn.dataTable.isDataTable('#sp-documents-doc-table'))) {
        $('#sp-documents-doc-table').DataTable({
            select: {
                style: 'multi'
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
                },
                {
                    targets: 3,
                    data: 'customer'
                }
            ],
            dom: '<"sp-datatables-search-left"f>ti',
            order: [[2, 'desc']],
            scrollY: '15vh',
            paging: false
        });
    } else {
        $('#sp-documents-doc-table').DataTable()
            .clear()
            .rows.add(fileArr)
            .draw();
    }
    toggleNextBtnAttr();
}

function toggleNextBtnAttr() {
    if ($('#customer-document-wizard li.current').text() === 'current step: 2. Select Portals'){
        $('#customer-document-wizard a[href="#next"]').attr('id', 'sp-send-customer-docs__button');
    }
}

/**
 *  Listener to save which boxes have been checked i.e. from what customer and
 *  specific portal user wants to get documents.
 *  $('#customer-document-wizard-t-x') is a selector on the inspinia wizard object
 *        @see http://webapplayers.com/inspinia_admin-v2.5/form_wizard.html#
 *  $('a[href="next"]') is also an INSPINIA generated selector
 */

function documentsCheckboxListener() {
    $('#customer-document-wizard-t-2').addClass('sp-get-customer-files__button');
    $('#customer-document-wizard-t-1').addClass('sp-get-customer-files__button');
    $('#sp-send-customer-docs__button').addClass('sp-get-customer-files__button');
    $('.sp-get-customer-files__button').on('click', function (e) {

        if ($('#customer-document-wizard li.current').text() === 'current step: 2. Select Portals') {
            var customerArr = [];
            //This saves all the chosen email addresses.
            $(':checked').closest('tr').find('[data-email]').each(function (i, v) {
                var email = $(this).text();
                customerArr.push(email.slice(1, email.length));
            });
            getPortalsListForCustomers(customerArr);
        }

        // This checks If wizard-step is document selector tab in order to start saving the
        // chosen sections.
        if ($('#customer-document-wizard li.current').text() === 'current step: 3. Customer Documents'){
            var files = [];

            $('#sp-documents-customer-table').DataTable()
                .search('').draw();

            $('#sp-documents-doc-table').DataTable()
                .search('').draw();

            // This saves all the document hashes & customers into a file array.
            $('#sp-documents-doc-table :checked').closest('tr')
                .each(function (i, v) {
                    var fileObj = {
                        customer: $(this).find('[data-customer-email]').text(),
                        hash: $(this).find('[data-file-hash]').attr('data-file-hash')
                    };
                    files.push(fileObj);
                });
            prepareDataForGettingFileListForCustomers(files);
        }
    });
}

    /**
     * Create obj to send.
     */
function prepareDataForGettingFileListForCustomers(files) {
    var dataToSend = [];

    var group_to_values = files.reduce(function (obj, item) {
        obj[item.customer] = obj[item.customer] || [];
        obj[item.customer].push(item.hash);
        return obj;
    }, {});

    var dataToSend = Object.keys(group_to_values).map(function (key) {
        return {customer: key, hash: group_to_values[key]};
    });

    getDocumentsList(dataToSend);
}

function portalDocumentsFormatFile(data) {
    var fileArr = [];

    $.each(data['filesList'], function (index, value) {

        var obj = {
            name: '<span class="sp-doc-name" data-file-name="' + sp.escapeHtml(value[2]) + '" data-file-hash="' + sp.escapeHtml(value[3]) + '">' + sp.escapeHtml(value[2]) + '</span>',
            portal: '<span class="sp-doc-name" data-portal-name="' + sp.escapeHtml(value[1]) + '" data-portal-hash="' + sp.escapeHtml(value[4]) + '">' + sp.escapeHtml(value[1]) + '</span>',
            customer: '<span class="sp-customer-email" data-customer-email="' + sp.escapeHtml(value[0]) + '">' + sp.escapeHtml(value[0]) + '</span>'
        };
        fileArr.push(obj);
    });

    $.fn.dataTable.moment('DD-MM-YYYY HH:mm');
    if (!($.fn.dataTable.isDataTable('#sp-documents-for-portal-table'))) {
        $('#sp-documents-for-portal-table').DataTable({
            select: {
                style: 'multi'
            },
            data: fileArr,
            columnDefs: [
                {
                    targets: 0,
                    data: 'customer'
                },
                {
                    targets: 1,
                    data: 'portal'
                },
                {
                    targets: 2,
                    data: 'name'
                }
            ],
            dom: '<"sp-datatables-search-left"f>ti',
            order: [[2, 'desc']],
            scrollY: '15vh',
            paging: false
        });
    } else {
        $('#sp-documents-for-portal-table').DataTable()
            .clear()
            .rows.add(fileArr)
            .draw();
    }
}

// get all portals generated for specific customer
function getPortalsListForCustomers(customerArr) {
    $.ajax({
        url: '/api/v1/customer-portals',
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        data: {"customers" : JSON.stringify(customerArr)},
        success: function (data) {
            portalsCallback(data);

        },
        error: function (err) {
            console.log(err);
        }
    });
}

function portalsCallback(data) {
    // do something with data
    /**
     * @params {data - obj} This is the data received from the server
     */
    customerDocumentsFormatFile(data);
}

// get all documents uploaded by customer on specific portals
function getDocumentsList(dataArr) {
    $.ajax({
        url: '/api/v1/customer-documents',
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function(xhr) {
            xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
        },
        data: {"data": JSON.stringify(dataArr)},
        success: function (data) {
            /**
             * Request Origin is a handler to decide where to send the data from the getDocumentsList function
             * There are two choices - either to send the file data to the fileupload dashboard (Files & Customers),
             * or to send it to the customerFileLinkGenerator which allows the user to choose customers and documents
             * to send out.
             */
            callback(data);
        },
        error: function (err) {
            console.log(err);
        }
    });
}

function callback(data) {
    // do something with data
    /**
     * @params {data - obj} This is the data received from the server
     */

    portalDocumentsFormatFile(data);
}