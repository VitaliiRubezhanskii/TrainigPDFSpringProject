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
    sp.fileHash = $(this).attr('data-file-hash');

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

// Delete file.
$(document).on('click', '.sp-file-delete', function() {
    sp.fileHash = $(this).attr('data-file-hash');
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
                deleteFile(sp.fileHash);
            }
        });
});

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
                        getFilesList('fileUploadDashboard');
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
function findByDocumentFriendlyId(documentFriendlyId) {
    return $.getJSON('/api/v1/widgets?fileHash=' + documentFriendlyId);
}

// Tasks.
// Get all tasks.
function getAll() {
    $.getJSON('/api/v1/tasks', function(data) {
        data.forEach(function(task) {
            if (typeof task.customer !== 'undefined') {
                task.customer.name = task.customer.firstName + ' ' + task.customer.lastName + ' (' + task.customer.email + ')';
            }
        });

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
                    {
                        data: 'dueAt'
                    },
                    {
                        data: 'completedAt'
                    },
                    {
                        data: 'customer.name',
                        defaultContent: 'Not set',
                        render: $.fn.dataTable.render.text()
                    },
                    {
                        data: 'customer.company',
                        defaultContent: 'Not set',
                        render: $.fn.dataTable.render.text()
                    },
                    {
                        data: 'document.name',
                        defaultContent: 'Not set',
                        render: $.fn.dataTable.render.text()
                    },
                    {
                        data: 'data.pageNumber',
                        defaultContent: 'Not set',
                        render: $.fn.dataTable.render.text()
                    },
                    {
                        data: 'data.taskMessage',
                        defaultContent: 'Not set',
                        render: $.fn.dataTable.render.text()
                    },
                    {
                        data: 'link'
                    }
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
                            var disabled = '';
                            if (row.initializedAt > -1) {
                                disabled = 'disabled';
                            }
                            return '<button class="tasks__task-update btn btn-primary btn-xs" data-toggle="modal" data-target=".tasks__task-modal" data-link="' + sp.escapeHtml(data) + '" ' + disabled + '>Update</button> <button class="tasks__task-delete btn btn-danger btn-xs" data-link="' + sp.escapeHtml(data) + '" ' + disabled + '>Delete</button>'
                        },
                        targets: 7
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
}
function get(link, callback) {
    $.getJSON(link, function (data) {
        callback(data);
    });
}

// Create / Update task.
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('tasks__task-create')) {
        clearTask();
        $('.tasks__task-form [name=requestLink]').val('/api/v1/tasks');
        $('.tasks__task-form [name=requestType]').val('POST');
        $('.tasks__task-form [name=successMessage]').val('created');
    }

    if (event.target.classList.contains('tasks__task-update')) {
        get(event.target.getAttribute('data-link'), populateTask);
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
        findByDocumentFriendlyId(friendlyId).then(function(data) {getHopperWidget(data, createMilestone)});
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
        findByDocumentFriendlyId(friendlyId).then(function(data) {getHopperWidget(data, createMilestone)});
    });

    // Page number.
    $('.tasks__task-form [name=pageNumber]').val('');

    // Task message.
    $('.tasks__task-form [name=taskMessage]').val('');
}

document.querySelector('.tasks__task-form-document').onchange = function() {
    $('.tasks__task-form [name=pageNumber]').val('');

    var friendlyId = this.options[this.selectedIndex].getAttribute('data-friendly-id');
    findByDocumentFriendlyId(friendlyId).then(function(data) {getHopperWidget(data, createMilestone)});
};

document.querySelector('.tasks__task-form-milestone').onchange = function() {
    $('.tasks__task-form [name=pageNumber]').val(this.value);
};

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
                getAll();
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
                            getAll();
                        }
                    }).fail(function () {
                        swal('Error!', 'Please contact support@slidepiper.com for assistance', 'error');
                    });
                }
            }
        );
    }
});

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

/* Customers mgmt. */

// Upload customers.
$('#sp-upload-customers__button').click(function(event) {
    if ($('#sp-modal-upload-customers input[type="file"]').val() === ''){
        sp.error.handleError('You must select a file to upload');
    } else {
        uploadCustomers(event);
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
});

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

        $('#sp-modal-add-update-customer input[name="customerID"]').
        val($('[data-customer-email="' + $(this).attr('data-customer-email') + '"]')
            .closest('tr').find('#sp-customer-id__td').text());

        var separator = $("#phoneNumber").intlTelInput("getSelectedCountryData").dialCode.length + 1;

        $('#sp-modal-add-update-customer input[name="customerPhone"]').
        val($('[data-customer-email="' + $(this).attr('data-customer-email') + '"]')
            .closest('tr').find('#sp-customer-phone__td').text().substr(separator));
    }
});

$('#sp-add-update-customer__form').submit(function(event) {
    addUpdateCustomer(event);
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
                deleteCustomer(customerToDelete);
                swal("Deleted!", customerToDelete + " has been deleted.", "success");

            }
        });
});