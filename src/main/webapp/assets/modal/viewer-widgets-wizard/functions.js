var sp = sp || {};

sp.widgets = {
    widget3: {
        init: (function() {
            $('#sp-question-widget__advanced').contents().click(function() {
                $('.sp-question-widget__advanced-container').slideToggle(function() {
                    $('#sp-question-widget__advanced').find('i').toggleClass('fa-caret-left fa-caret-down');
                });
            });

            var widgetLocationCheckboxes = $('#sp-question-widget__widget-location [type="checkbox"]');
            $(widgetLocationCheckboxes).click(function() {
                var isBothUnchecked = true;

                $(widgetLocationCheckboxes).each(function() {
                    if ($(this).is(':checked')) {
                        isBothUnchecked = false;
                    }
                });

                if (isBothUnchecked) {
                    $('[name="question-widget-is-enabled"]').prop('checked', false);
                } else {
                    $('[name="question-widget-is-enabled"]').prop('checked', true);
                }
            });

            $('[name="question-widget-is-enabled"]').click(function() {
                if ($(this).is(':checked')) {
                    $('[name="spQuestionWidgetLocationRightSide"]').prop('checked', true);
                }
            });

            $('[name="spQuestionWidgetButtonColorChooser"]').click(function() {
                sp.widgets.widget3.colorPickerHandler();
            });

            $(document).on('spWidgetsReady', function() {
                sp.widgets.widget3.colorPickerHandler();
            });

            $('#sp-question-widget__help-button').click(function() {
                new UserEvent(UserEventType.CLICKED_HELP_BUTTON, {widgetId: 3}).send();
            });
        })(),

        colorPickerHandler: function() {
            if ($('.spQuestionWidgetIsDefaultButtonColorEnabled').is(':checked')) {
                $('#sp-question-widget__color-picker').spectrum('disable');
            } else {
                $('#sp-question-widget__color-picker').spectrum('enable');
            }
        },
    },
    widget6: {
        item: '<hr>' + $('#sp-tab-6 .sp-widget-item').html(),

        init: (function() {
            /* Add Item */
            $('#sp-tab-6 .sp-widget__add-item').click(function() {
                sp.widgets.widget6.addItem();
            });

            /* Delete Item */
            $(document).on('click', '#sp-tab-6 .sp-widget__delete-item', function() {
                $(this).closest('.sp-widget-item').remove();
            });

            // Set person image.
            $(document).on('change', '.sp-testimonials-widget__input-person-image', function() {
                var $file = $(this);
                var file = this.files[0];
                var reader = new FileReader();

                reader.addEventListener('load', function() {
                    $file.closest('.sp-widget-item').find('.sp-testimonials-widget__person-image')
                        .removeClass('fa fa-user fa-4x')
                        .css('background-image', 'url(' + reader.result + ')');

                    $file.closest('.sp-widget-item').find('[name="person-image"]')
                        .val(reader.result);
                }, false);

                if (file) {
                    reader.readAsDataURL(file);
                }
            });
        })(),

        /**
         * Add a testimonial item to the widget setting panel.
         */
        addItem: function() {
            $('#sp-tab-6 .container-fluid')
                .append('<div class="sp-widget-item">' + this.item + '</div>');
        },

        /**
         * Load saved testimonials to the widget setting panel.
         */
        displayItems: function(widgetData) {

            // Display is enabled.
            $('#sp-testimonials-widget--is-enabled')
                .prop('checked', widgetData.isEnabled)
                .closest('div').removeClass('sp-hide-is-enabled');

            // Display items.
            var items = widgetData.items;
            $.each(items, function(index, item) {
                $.each(item, function(key, value) {
                    switch (key) {
                        case 'page':
                            $('.sp-widget-item [name="page"]')[index].value = value;
                            break;

                        case 'personImage':
                            if ('' !== value) {
                                $('.sp-testimonials-widget__person-image')[index]
                                    .className = 'sp-testimonials-widget__person-image';

                                $('.sp-testimonials-widget__person-image')[index]
                                    .style.backgroundImage = 'url(' + value + ')';

                                $('.sp-widget-item [name="person-image"]')[index].value = value;
                            }
                            break;

                        case 'personName':
                            $('.sp-widget-item [name="person-name"]')[index].value = value;
                            break;

                        case 'personTitle':
                            $('.sp-widget-item [name="person-title"]')[index].value = value;
                            break;

                        case 'testimonial':
                            $('.sp-widget-item [name="testimonial"]')[index].value = value;
                            break;
                    }
                });

                if (index < items.length - 1) {
                    sp.widgets.widget6.addItem();
                }
            });
        },

        /**
         * Save testimonials from the widget setting panel.
         */
        saveItems: function(fileHash) {
            var widgetSetting = {
                data: {
                    widgetId: 6,
                    isEnabled: $('#sp-testimonials-widget--is-enabled').prop('checked'),
                    items: []
                }
            };

            /* Validation */
            var validationCode = 0;
            var items = [];
            var itemsPages = [];
            $('#sp-tab-6 .sp-widget-item').each(function() {

                /* Validate Item */
                var jqueryObjectsToValidate = [
                    $(this).find('[name="page"]'),
                    $(this).find('[name="person-name"]'),
                    $(this).find('[name="person-title"]'),
                    $(this).find('[name="testimonial"]')
                ];

                var emptyJqueryObects =
                    sp.data.getEmptyJqueryObjects(jqueryObjectsToValidate);

                // All item properties are empty.
                if (jqueryObjectsToValidate.length === emptyJqueryObects.length) {

                    // Items have been saved at least once.
                    if (! $('#sp-testimonials-widget--is-enabled').parent().hasClass('sp-hide-is-enabled')) {
                        sp.error.handleError('You must fill all fields.');
                        validationCode = 1;
                    }
                    return false;

                    // At least one item property is empty.
                } else if (emptyJqueryObects.length > 0) {
                    sp.error.handleError('You must fill all fields.');
                    validationCode = 1;
                    return false;

                    // No item property is empty.
                } else {
                    var page = parseInt($(this).find('[name="page"]').val());
                    var personName = $(this).find('[name="person-name"]').val();
                    var personImage = $(this).find('[name="person-image"]').val();
                    var personTitle = $(this).find('[name="person-title"]').val();
                    var testimonial = $(this).find('[name="testimonial"]').val();

                    if (-1 !== itemsPages.indexOf(page)) {
                        sp.error.handleError('You can only enter one testimonial per page.');
                        validationCode = 1;
                        return false;
                    }
                    itemsPages.push(page);

                    /* Save Item */
                    var item = {
                        page: page,
                        personImage: personImage,
                        personName: personName,
                        personTitle: personTitle,
                        testimonial: testimonial
                    };

                    items.push(item);
                    validationCode = 2;
                }
            });

            if (0 === validationCode || 2 === validationCode) {
                widgetSetting.data.items = items;

                // Set isEnabled to true if items are valid and saved for the first time.
                if (2 === validationCode
                    && $('#sp-testimonials-widget--is-enabled').parent().hasClass('sp-hide-is-enabled')) {

                    widgetSetting.data.isEnabled = true;
                }

                return widgetSetting;
            } else {
                return undefined;
            }
        }
    },

    widget7: {
        init: (function() {
            // Set person image.
            $(document).on('change', '.sp-form-widget__input-form-image', function() {
                var $file = $(this);
                var file = this.files[0];
                var reader = new FileReader();

                reader.addEventListener('load', function() {
                    $file.closest('.sp-widget-item').find('.sp-form-widget__form-image')
                        .removeClass('fa fa-picture-o fa-4x')
                        .css('background-image', 'url(' + reader.result + ')');

                    $file.closest('.sp-widget-item').find('[name="formImage"]')
                        .val(reader.result);
                }, false);

                if (file) {
                    reader.readAsDataURL(file);
                }
            });

            $('[name="formSelectType"]').on('change', function(event) {
                switch($(event.currentTarget).attr('id')) {
                    case 'sp-form-widget__upload-form-radio':
                        $('.sp-form-widget__image-elements').hide();
                        $('.sp-form-widget__form-elements').show();
                        $('.sp-form-widget__form-image').parent().prev('label').text('Company Logo');
                        break;

                    case 'sp-form-widget__upload-image-radio':
                        $('.sp-form-widget__image-elements').show();
                        $('.sp-form-widget__form-elements').hide();
                        $('.sp-form-widget__form-image').parent().prev('label').text('Image');
                        break;
                }
            });
        })()
    },

    widget8: {
        html: $('#sp-tab-8 .sp-widget-item').html(),
        addItem: function() {
            $('#sp-tab-8 .container-fluid').append(
                '<div class="sp-widget-item">' +
                sp.widgets.widget8.html +
                '</div>'
            );

            // Set Code Location radio name attribute.
            var codeLocationOptions = ['beforeClosingHead', 'afterOpeningBody', 'beforeClosingBody'];
            $('#sp-tab-8 .sp-widget-item').each(function(index, item) {
                $(item)
                    .find('[name*="codeLocation"]').attr('name', 'codeLocation-' + index)
                    .each(function(ind) {
                        $(this).attr('data-code-location-' + index, codeLocationOptions[ind]);
                    });
            });
        },
        init: (function() {

            // Add.
            $(document).off('click', '#sp-tab-8 .sp-widget__add-item').on('click', '#sp-tab-8 .sp-widget__add-item', function() {
                sp.widgets.widget8.addItem();
            });

            // Delete.
            $(document).on('click', '#sp-tab-8 .sp-widget__delete-item', function() {
                $(this).closest('.sp-widget-item').remove();
            });
        })(),

        validate: function() {
            var isEmpty = false;

            $('#sp-tab-8 .sp-widget-item').each(function() {
                if ('' === $(this).find('textarea').val()) {
                    isEmpty = true;
                } else {
                    isEmpty = false;
                }
            });

            return isEmpty;
        }
    },
        ////////////////////////////////
    widget9: {
        html: $('#sp-tab-9 .sp-widget-item').html(),
        init: (function() {

            // Add item.
            $(document).off('click', '#sp-tab-9 .sp-widget__add-item').on('click', '#sp-tab-9 .sp-widget__add-item', function() {
                $('#sp-tab-9 .sp-widget-item').append(sp.widgets.widget9.html);
            });

            // Delete item.
            $(document).on('click', '#sp-tab-9 .sp-widget__delete-item', function() {
                $(this).closest('.sp-link-widget__item').remove();
            });
        })(),

        /**
         * If url doesn't have //, i.e. the url provided is missing a protocol such as http://.
         *
         * @params {string} url - The link given by the user for the link widget.
         * @returns {string} url - If the url did not have a protocol attached, it is returned with a protocol,
         * otherwise it is returned as it was received.
         */
        urlHttpConfig: function(url) {

            if (! url.match(/^.+?:|^#/)) {
                url = 'http://' + url;
            }

            return url;
        },
        validate: function() {
            var isEmpty = false;

            // buttonText2 is not a required field.
            $('#sp-tab-9 form').find('input[data-item-setting="buttonText1"], input[data-item-setting="link"], input[data-item-setting="pageFrom"], input[data-item-setting="pageTo"]').each(function() {

                if ('' === $(this).val()) {
                    isEmpty = true;
                } else {
                    isEmpty = false;
                    return false;
                }
            });

            return isEmpty;
        },
        isWidgetPageOrderValid: function() {
            return Array.prototype.slice.call(document.querySelectorAll('#sp-tab-9 form')).every(function(element) {
                var pageFrom = parseInt($(element).find('[data-item-setting="pageFrom"]').val());
                var pageTo = parseInt($(element).find('[data-item-setting="pageTo"]').val());

                if (pageFrom > pageTo) {
                    $(element).find('[data-item-setting="pageFrom"]').addClass('sp-widget-form-error');
                    $(element).find('[data-item-setting="pageTo"]').addClass('sp-widget-form-error');
                    sp.error.handleError('You cannot set the widget to hide before it shows.');
                    sp.viewerWidgetsModal.openErrorTab();

                    return false;
                } else {
                    return true;
                }
            });
        },
    },
    widget10: {
        init: (function() {
            $('#sp-email-required-widget__help-button').click(function() {
                new UserEvent(UserEventType.CLICKED_HELP_BUTTON, {widgetId: 10}).send();
            });
        })(),
    },
    widget11: {
        imageFileName: null,
        init: (function() {

            $('[name="spShareWidgetButtonColorChooser"]').click(function() {
                sp.widgets.widget11.colorPickerHandler();
            });

            $(document).on('spWidgetsReady', function() {
                sp.widgets.widget11.colorPickerHandler();
            });

            $(document).on('change', '.sp-share-widget__input-share-image', function() {
                var $file = $(this);
                var file = this.files[0];
                var reader = new FileReader();

                reader.addEventListener('load', function() {
                    $file.closest('.sp-widget-item').find('.sp-share-widget__share-image')
                        .removeClass('fa fa-picture-o fa-4x')
                        .css({
                            'background-image': 'url(' + reader.result + ')',
                            height: '100px',
                        });

                    $('[name="spShareWidgetShareImageBase64"]').val(reader.result);
                }, false);

                if (file) {
                    sp.widgets.widget11.imageFileName = file.name;
                    reader.readAsDataURL(file);
                }
            });
        })(),

        colorPickerHandler: function() {
            if ($('.spShareWidgetIsDefaultButtonColorEnabled').is(':checked')) {
                $('#sp-share-widget__color-picker').spectrum('disable');
            } else {
                $('#sp-share-widget__color-picker').spectrum('enable');
            }
        },

        setDefaultTitle: function(fileHash) {
            if ($('[name="spShareWidgetShareTitle"]').val() === '') {
                var fileName = $('.sp-file-mgmt-file-name[data-file-hash=' + fileHash + ']').text();
                fileName = fileName.substring(0, fileName.lastIndexOf("."));

                $('[name="spShareWidgetShareTitle"]').val(fileName);
            }
        }
    }
};

sp.viewerWidgetsModal = {
    /**
     * Get a file widget settings from the DB.
     *
     * @param {string} fileHash - The file hash.
     *
     * @param {boolean} isProcessMode - if process mode is enabled.
     */
    getWidgetsSettings: function(fileHash) {//, processModeChecked) {
        var widgetSettingsData = null;
        $.getJSON(
            '/api/v1/widgets',
            {
                fileHash: fileHash
            },
            function(data) {
                widgetSettingsData = data;
                sp.viewerWidgetsModal.displayWidgetsSettings(widgetSettingsData, fileHash);
                sp.viewerWidgetsModal.setSaveButtons(fileHash);
                //sp.viewerWidgetsModal.setProcessMode(processModeChecked);
            }
        );

        sp.widgets.widget11.setDefaultTitle(fileHash);

        // Show widgets when loaded.
        var intervalCount = 0;
        var interval = 200;
        var setIntervalToDisplayWidgetsSettings = setInterval(function() {
            intervalCount += interval;
            if (widgetSettingsData && intervalCount >= 1000) {
                $('.sp-widgets-customisation__spinner').removeClass('sp-widgets-customisation__spinner-show');
                $('#sp-viewer-widgets-modal .tabs-container').removeClass('sp-hidden');
                $(document).trigger('spWidgetsReady');
                clearInterval(setIntervalToDisplayWidgetsSettings);
            }
        }, interval);
    },

    /**
     * @param {object} widgetData - The widget settings for this file, received from
     * the ManagementServlet.
     */
    displayWidgetsSettings: function(widgetsSettings, fileHash) {
        $.each(widgetsSettings, function(index, value) {
            var widget = JSON.parse(value.widgetData);

            if (typeof widget.data !== 'undefined') {
                if (typeof widget.data.items !== 'undefined'
                    && typeof widget.data.items[0] !== 'undefined'
                    && typeof widget.data.items[0].widgetId !== 'undefined'
                    && 11 === widget.data.items[0].widgetId) {
                    displayShareWidget(widget.data, fileHash);
                } else {
                    switch (widget.data.widgetId) {
                        case 1:
                            if (widget.data.items.length > 0) {
                                displayVideoSettings(widget.data);
                            }
                            break;

                        case 2:
                            displayCalendlySettings(widget.data);
                            break;

                        case 3:
                            displayAskQuestionSettings(widget.data);
                            break;

                        case 4:
                            displayLikeWidgetSettings(widget.data);
                            break;

                        case 5:
                            if (widget.data.items.length > 0) {
                                displayHopperWidget(widget.data);
                            }
                            break;

                        case 6:
                            if (widget.data.items.length > 0) {
                                sp.widgets.widget6.displayItems(widget.data);
                            }
                            break;

                        case 7:
                            if (widget.data.items.length > 0) {
                                displayFormWidget(widget.data);
                            }
                            break;

                        case 8:
                            if (widget.data.items.length > 0) {
                                displayCodeWidget(widget.data);
                            }
                            break;

                        case 9:
                            if (widget.data.items.length > 0) {
                                displayLinkWidget(widget.data);
                            }
                            break;

                        case 10:
                            if (widget.data.items.length > 0) {
                                displayEmailRequiredWidget(widget.data);
                            }
                            break;

                        case 11:
                            if (widget.data.items.length > 0) {
                                displayShareWidget(widget.data, fileHash);
                            }
                            break;
                    }
                }
            }
        });

        /**
         * Display a Video widgets settings in the modal window.
         *
         * Check for items.length  > 0 - If widget was once defined but then deleted, a widgetId
         * will still exist in the DB although there will be no settings available.
         *
         * @param {string} widget - The widget settings.
         */
        function displayVideoSettings(widget) {

            for (var i = 0; i < widget.items.length - 1; i++) {
                sp.viewerWidgetsModal.renderAddVideoRows();
            }

            $('[name="video-widget-is-enabled"]')
                .prop('checked', widget.isEnabled)
                .closest('div').removeClass('sp-hide-is-enabled');

            $('.sp-video-widget-data-row').each(function(index) {
                $(this).find('[data-video]').each(function() {
                    switch($(this).attr('data-video')) {
                        case 'videoSource':
                            $(this).val(widget.items[index].videoSource);
                            break;

                        case 'videoTitle':
                            $(this).val(widget.items[index].videoTitle);
                            break;

                        case 'videoPageStart':
                            $(this).val(widget.items[index].videoPageStart);
                            break;
                    }
                });
            });
        }

        /**
         * Display settings for Calendly Widget in the modal window.
         *
         * @param {object} widget - The settings for the Calendly widget.
         */
        function displayCalendlySettings(widget) {
            $('[name="calendly-widget-is-enabled"]')
                .prop('checked', widget.isEnabled)
                .closest('div').removeClass('sp-hide-is-enabled');

            $('[name="calendly-widget-username"]').val(widget.items[0].userName);
            $('[name="calendly-widget-button-text"]').val(widget.items[0].buttonText);
        }


        /**
         * Display settings for Question Widget.
         *
         * @param {object} widget - The settings for the Question widget in the modal window.
         */
        function displayAskQuestionSettings(widget) {
            $('[name="question-widget-is-enabled"]')
                .prop('checked', widget.isEnabled)
                .closest('div').removeClass('sp-hide-is-enabled');

            if (typeof widget.items[0].buttonText !== 'undefined') {
                $('[name="question-widget-text"]').val(widget.items[0].buttonText);
            }

            if (typeof widget.items[0].cancelButtonText !== 'undefined') {
                $('[name="spQuestionWidgetCancelButtonText"]').val(widget.items[0].cancelButtonText);
            }

            if (typeof widget.items[0].formTitle !== 'undefined') {
                $('[name="spQuestionWidgetFormTitle"]').val(widget.items[0].formTitle);
            }

            if (typeof widget.items[0].formMessage !== 'undefined') {
                $('[name="spQuestionWidgetFormMessage"]').val(widget.items[0].formMessage);
            }

            if (typeof widget.items[0].confirmButtonText !== 'undefined') {
                $('[name="spQuestionWidgetConfirmButtonText"]').val(widget.items[0].confirmButtonText);
            }

            if (typeof widget.items[0].customMessageLabel !== 'undefined') {
                $('[name="spQuestionWidgetCustomMessageLabel"]').val(widget.items[0].customMessageLabel);
            }

            if (typeof widget.items[0].customEmailLabel !== 'undefined') {
                $('[name="spQuestionWidgetCustomEmailLabel"]').val(widget.items[0].customEmailLabel);
            }

            if (typeof widget.items[0].customEmailValidationErrorMessage !== 'undefined') {
                $('[name="spQuestionWidgetCustomEmailValidationErrorMessage"]').val(widget.items[0].customEmailValidationErrorMessage);
            }

            if (typeof widget.items[0].location !== 'undefined'
                && typeof widget.items[0].location.right !== 'undefined') {
                $('[name="spQuestionWidgetIsLocationRight"]').prop('checked', widget.items[0].location.right);
            }

            if (typeof widget.items[0].location !== 'undefined'
                && typeof widget.items[0].location.bottom !== 'undefined') {
                $('[name="spQuestionWidgetIsLocationBottom"]').prop('checked', widget.items[0].location.bottom);
            }

            //location
            if (typeof widget.items[0].locationProcessMode !== 'undefined'
                && typeof widget.items[0].locationProcessMode.top !== 'undefined') {
                $('#rightTop').prop('checked', widget.items[0].locationProcessMode.top);
            }

            if (typeof widget.items[0].locationProcessMode !== 'undefined'
                && typeof widget.items[0].locationProcessMode.bottom !== 'undefined') {
                $('#rightBottom').prop('checked', widget.items[0].locationProcessMode.bottom);
            }
            ///////

            if (typeof widget.items[0].isDefaultButtonColorEnabled !== 'undefined') {
                $('.spQuestionWidgetIsDefaultButtonColorEnabled').prop('checked', widget.items[0].isDefaultButtonColorEnabled);
            }

            if (typeof widget.items[0].isDefaultButtonColorEnabled !== 'undefined') {
                $('.spQuestionWidgetIsCustomButtonColorEnabled').prop('checked', widget.items[0].isCustomButtonColorEnabled);
            }

            if (typeof widget.items[0].buttonColor !== 'undefined') {
                $('[name="spQuestionWidgetButtonColor"]')
                    .val(widget.items[0].buttonColor)
                    .spectrum('set', widget.items[0].buttonColor);
            }

            sp.widgets.widget3.colorPickerHandler();
        }

        function displayLikeWidgetSettings(widget) {
            $('[name="like-widget-is-enabled"]').prop('checked', widget.isEnabled),
                $('[name="like-widget-counter-is-enabled"]').prop('checked', widget.items[0].isCounterEnabled);
        }


        /**
         * Display settings for Widget 5 - Hopper Widget
         *
         * Check for items.length  > 0  - If widget was once defined but then deleted, a widgetId
         * will still exist in the DB although there will be no settings available.
         *
         * @param {object} widget - The settings for the Hopper widget.
         */
        function displayHopperWidget(widget) {
            for (var i = 0; i < widget.items.length - 1; i++) {
                $('#sp-hopper-customize__container').append(
                    '<div class="row sp-hopper-widget__row">' +
                    sp.viewerWidgetsModal.hopperHtml +
                    '</div>'
                );
            }

            $('[name="hopper-widget-is-enabled"]')
                .prop('checked', widget.isEnabled)
                .closest('div').removeClass('sp-hide-is-enabled');

            $('[name="horizontal-hopper-widget-start-page"]')
                .prop('checked', widget.startFromFirstPage)
                .closest('div').removeClass('sp-hide-is-enabled');

            var checked = $('#sp-save-test-widgets-settings__button').attr('data-is-process-mode') === 'true'? true : widget.isHorizontalHopperEnabled;

            if($('#sp-save-test-widgets-settings__button').attr('data-is-process-mode') === 'true'){
                $('[name="horizontal-hopper-widget-is-enabled"]').attr('disabled',true);
            }

            $('[name="horizontal-hopper-widget-is-enabled"]')
                .prop('checked', checked)
                .closest('div').removeClass('sp-hide-is-enabled');

            $('.sp-hopper-widget__row').each(function(index) {
                $(this).find('[data-item-setting]').each(function() {
                    if ('hopperText' === $(this).attr('data-item-setting') || 'hopperPage' === $(this).attr('data-item-setting')) {
                        $(this).val(widget.items[index][$(this).attr('data-item-setting')]);
                    }

                    if ('status' === $(this).attr('data-item-setting') && 'finished' === widget.items[index][$(this).attr('data-item-setting')]) {
                        $(this).prop('checked', true);
                    }
                });
            });
        }

        /**
         * Display settings for the Form widget.
         *
         * @params {object} widget - The form widget settings.
         */
        function displayFormWidget(widget) {
            $('[name="form-widget-is-enabled"]')
                .prop('checked', widget.isEnabled)
                .closest('div').removeClass('sp-hide-is-enabled');

            $('#sp-tab-7 [name*="form"]').each(function(index) {
                if ($(this).attr('name') === 'formImage') {
                    $('.sp-form-widget__form-image')
                        .removeClass('fa fa-picture-o fa-4x')
                        .css('background-image', 'url(' + widget.items[0][$(this).attr('name')] + ')');
                }

                if ('formSelectType' === $(this).attr('name')) {
                    $('[data-widget-type=' + widget.items[0][$(this).attr('name')] + ']')
                        .prop('checked', true)
                        .change();
                }

                if ('formWidgetPlacement' === $(this).attr('name')
                    && typeof widget.items[0][$(this).attr('name')] !== 'undefined') {
                    $('[data-widget-placement=' + widget.items[0][$(this).attr('name')] + ']')
                        .prop('checked', true)
                        .change();
                }

                $(this).val(widget.items[0][$(this).attr('name')]);
            });

            $('[name="isWidgetButtonPulseEnabled"]').prop('checked', widget.items[0]['isWidgetButtonPulseEnabled']);
        }

        function displayCodeWidget(widget) {
            for (var i = 0; i < widget.items.length - 1; i++) {
                sp.widgets.widget8.addItem();
            }

            $('[name="sp-code-widget__is-enabled"]')
                .prop('checked', widget.isEnabled)
                .closest('div').removeClass('sp-hide-is-enabled');

            $('#sp-tab-8 .sp-widget-item').each(function(index) {
                $(this).find('[name*="code"]').each(function() {
                    if ('codeLocation' === $(this).attr('name')) {
                        if ($(this).val() === widget.items[index][$(this).attr('name')]) {
                            $(this).prop('checked', true);
                        }
                    } else {
                        $(this).val(widget.items[index][$(this).attr('name')]);
                    }
                });
            });
        }

        /**
         * Display settings for Link Widget
         *
         * @params {object} widget - The Link Widget settings.
         */
        function displayLinkWidget(widget) {
            $('[name="sp-link-widget--is-enabled"]')
                .prop('checked', widget.isEnabled)
                .closest('div').removeClass('sp-hide-is-enabled');

            for (var i = 0; i < widget.items.length - 1; i++) {
                $('#sp-tab-9 .sp-widget-item').append(
                    sp.widgets.widget9.html
                );
            }

            // Link data.
            $('#sp-tab-9 .sp-link-widget__item').each(function(index) {
                $(this).find('[data-item-setting]').each(function() {

                    if ('buttonText1' === $(this).attr('data-item-setting')) {
                        $(this).parents('.sp-link-widget__item').find('.sp-link-widget__item-title')
                            .text(widget.items[index]['buttonText1']);
                    }

                    if ('status' === $(this).attr('data-item-setting')) {
                        if ('completed' === widget.items[index]['status']) {
                            $(this).parents('.sp-link-widget__item').find('.sp-link-widget__item-status').val('completed');
                        }
                    } else if ('icon' === $(this).attr('data-item-setting')) {
                        if (typeof widget.items[index][$(this).attr('data-item-setting')] !== 'undefined'
                            && $(this).attr('data-icon') === widget.items[index][$(this).attr('data-item-setting')]) {
                            $(this).prop('checked', true);
                        }
                    } else if ('layout' === $(this).attr('data-item-setting')) {
                        if (typeof widget.items[index][$(this).attr('data-item-setting')] !== 'undefined'
                            && $(this).attr('data-layout') === widget.items[index][$(this).attr('data-item-setting')]) {
                            $(this).prop('checked', true);
                        }
                    } else {
                        $(this).val(widget.items[index][$(this).attr('data-item-setting')]);
                    }
                });
            });
        }

        function displayEmailRequiredWidget(widget) {
            $('[name="sp-email-required-widget--is-enabled"]').prop('checked', widget.isEnabled);
            $('[name="spEmailRequiredWidgetFormTitle"]').val(widget.items[0].formTitle);
        }

        function displayShareWidget(widget, fileHash) {

            if (typeof widget.isEnabled !== 'undefined') {
                $('[name="sp-share-widget--is-enabled"]').prop('checked', widget.isEnabled);
            } else {
                $('[name="sp-share-widget--is-enabled"]').prop('checked', widget.items[0].enabled);
            }

            $('[name="spShareWidgetButtonText"]').val(widget.items[0].buttonText);

            if (typeof widget.items[0].isButtonColorCustom !== 'undefined') {
                if (widget.items[0].isButtonColorCustom) {
                    $('.spShareWidgetIsDefaultButtonColorEnabled').prop('checked', false);
                    $('.spShareWidgetIsCustomButtonColorEnabled').prop('checked', true);
                } else {
                    $('.spShareWidgetIsDefaultButtonColorEnabled').prop('checked', true);
                    $('.spShareWidgetIsCustomButtonColorEnabled').prop('checked', false);
                }
            }

            if (typeof widget.items[0].buttonColor !== 'undefined') {
                $('[name="spShareWidgetButtonColor"]')
                    .val(widget.items[0].buttonColor)
                    .spectrum('set', widget.items[0].buttonColor);
            }

            if (typeof widget.items[0].title !== 'undefined') {
                $('[name="spShareWidgetShareTitle"]').val(widget.items[0].title);
            } else {
                var fileName = $('.sp-file-mgmt-file-name[data-file-hash=' + fileHash + ']').text();
                fileName = fileName.substring(0, fileName.lastIndexOf("."));

                $('[name="spShareWidgetShareTitle"]').val(fileName);
            }

            if (typeof widget.items[0].description !== 'undefined') {
                $('[name="spShareWidgetShareDescription"]').val(widget.items[0].description);
            }

            if (typeof widget.items[0].imageUrl !== 'undefined') {
                $('.sp-share-widget__share-image')
                    .removeClass('fa fa-picture-o fa-4x')
                    .css({
                        'background-image': 'url(' + widget.items[0].imageUrl + ')',
                        height: '100px',
                    });

                $('[name="spShareWidgetShareImageUrl"]').val(widget.items[0].imageUrl);

                if (typeof widget.items[0].url !== 'undefined') {
                    $('[name="spShareWidgetShareUrl"]').val(widget.items[0].url);
                }
            }

            if (typeof widget.items[0].imageFileName !== 'undefined') {
                sp.widgets.widget11.imageFileName = widget.items[0].imageFileName;
            }

            sp.widgets.widget11.colorPickerHandler();
        }
    },

    /**
     * 1) Set Save buttons.
     * 2) Add data-file-hash attribute for the save and save & test buttons.
     * 3) Save widgets settings, and if clicked on 'Save & Test' button open a file link.
     */
    setSaveButtons: function(fileHash) {

        // 1)
        $('#sp-save-widgets-settings__button, #sp-save-test-widgets-settings__button')
            .attr('data-file-hash', fileHash);

        // 2)
        setFileLinkAttribute(
            fileHash,
            'test@example.com',
            'sp-save-test-widgets-settings__button'
        );

        // 3)
        $('#sp-save-widgets-settings__button, #sp-save-test-widgets-settings__button')
            .on('click', function () {
                sp.viewerWidgetsModal.validateWidgetsSettings(
                    $(this).attr('data-file-hash'), $(this).attr('id'));
            });
    },

    /**
     * Validate a file widgets settings.
     *
     * @param {string} fileHash - The file hash.
     * @param {string} targetId - The id of the target (clicked) HTML element.
     *
     * @var {object} settings - An array containing the widgets settings.
     *
     * This function calls sp.viewerWidgetsModal.allInputsFilled, to remove the error border-color
     * if all the inputs have now been filled upon submit.
     *
     * If any of the input fields aren't empty in panel in the Customize Modal then call the relevant function
     * to save the settings for this widget.
     *
     * These functions return an object containing the widget data, if there was a validation error, the function
     * returns undefined, which then halts the sp.viewerWidgetsModal.postWidgetSettings from being called.
     *
     */
    validateWidgetsSettings: function(fileHash, targetId) {
        var settings = [];

        $('.sp-viewer-widgets-modal input').removeClass('sp-widget-form-error');

        if (! sp.viewerWidgetsModal.isInputEmpty(3)
            || ! $('[name="question-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            settings.push(sp.viewerWidgetsModal.saveAskQuestionWidgetSettings(fileHash));
        }

        if (! sp.viewerWidgetsModal.isInputEmpty(1)
            || ! $('[name="video-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            settings.push(sp.viewerWidgetsModal.saveVideoWidgetSettings(fileHash));
        }

        if (! sp.viewerWidgetsModal.isInputEmpty(2)
            || ! $('[name="calendly-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            settings.push(sp.viewerWidgetsModal.saveCalendlyWidgetSettings(fileHash));
        }

        settings.push(sp.viewerWidgetsModal.saveLikeWidgetSettings(fileHash));

        if (! sp.viewerWidgetsModal.isInputEmpty(5)
            || ! $('[name="hopper-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            settings.push(sp.viewerWidgetsModal.saveHopperWidget(fileHash));
        }

        var testimonialsWidgetSettings = sp.widgets.widget6.saveItems(fileHash);
        if (typeof testimonialsWidgetSettings === 'undefined') {
            settings.push(undefined);
        } else if (testimonialsWidgetSettings.data.items.length > 0 ) {
            settings.push(testimonialsWidgetSettings);
        }

        if (! sp.viewerWidgetsModal.isInputEmpty(7)
            || ! $('[name="form-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            settings.push(sp.viewerWidgetsModal.saveFormWidget(fileHash));
        }

        if (! sp.widgets.widget8.validate()
            || ! $('[name="sp-code-widget__is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            settings.push(sp.viewerWidgetsModal.saveCodeWidget(fileHash));
        }

        if (! sp.widgets.widget9.validate()
            || ! $('[name="sp-link-widget--is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            settings.push(sp.viewerWidgetsModal.saveLinkWidget(fileHash));
        }

        settings.push(sp.viewerWidgetsModal.emailRequiredWidget(fileHash));

        settings.push(sp.viewerWidgetsModal.saveShareWidget(fileHash));

        var data = {
            action: 'setWidgetsSettings',
            widgetsSettings: settings,
            fileHash: fileHash
        };

        /**
         * If the user entered invalid information, the functions to find widget settings
         * will have returned undefined.
         */
        var isValidWidgetSettings = false;
        $.each(settings, function(index, setting) {
            if (typeof setting === 'undefined') {
                isValidWidgetSettings = false;
                return false;
            } else {
                isValidWidgetSettings = true;
            }
        });

        if (isValidWidgetSettings) {
            $('.tabs-container').contents().hide();
            $('#sp-save-widgets-settings__button, #sp-save-test-widgets-settings__button')
                .attr('disabled', 'true');
            $('#' + targetId).text('Saving...');
            $('.sp-widgets-customisation__spinner').addClass('sp-widgets-customisation__spinner-show');

            // var isProcessModeEnabled = {
            //     isProcessMode: $('[name="process-mode-is-enabled"]').prop('checked')
            // };

           // function docsSavedCallback(result) {
                // Setting attribute to current value
                //$("#sp-files-management span[data-file-hash='" + fileHash + "'][data-target='#sp-viewer-widgets-modal']").attr('data-is-process-mode', +isProcessModeEnabled.isProcessMode);
                sp.viewerWidgetsModal.postWidgetSettings(data, fileHash, targetId);
            //}
           // postDocumentSettings(isProcessModeEnabled, fileHash, docsSavedCallback);
        } else if (0 === settings.length) {
            $('button[data-dismiss="modal"]').click();
            swal('No settings were saved.', '', 'info');
        }
    },

    /**
     * Post widget settings to ManagementServlet
     *
     * @param {object} data - The widget settings data.
     * @param {string} fileHash - The document fileHash.
     * @param {number} targetId - The ID of the 'Save' button clicked on.
     */
    postWidgetSettings: function(data, fileHash, targetId) {
        $.ajax({
            url:'/api/v1/widgets',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            beforeSend: function(xhr) {
                xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
            },
        }).done(function(data) {
            if (typeof data === 'string' && '<!DOCTYPE html>' === data.substring(0, 15)) {
                window.location = '/login';
            } else {
                $('button[data-dismiss="modal"]').click();

                // Return modal content to pre-saving state.
                $('.tabs-container').contents().show();
                $('#sp-save-widgets-settings__button, #sp-save-test-widgets-settings__button')
                    .attr('disabled', 'false');

                if (targetId === 'sp-save-widgets-settings__button') {
                    $('#' + targetId).text('Save');
                } else {
                    $('#' + targetId).text('Save & Preview');
                }
                $('.sp-widgets-customisation__spinner').removeClass('sp-widgets-customisation__spinner-show');

                var resultCode = data;

                if (0 == resultCode) {
                    errorCallback();
                } else if (1 == resultCode) {
                    if ('sp-save-widgets-settings__button' == targetId) {
                        swal("Success!", "Your widgets settings have been saved!", "success");
                    } else if ('sp-save-test-widgets-settings__button' == targetId) {
                        window.open($('#' + targetId).attr('data-file-link'));
                    }
                }
            }
        }).fail(function() {
            errorCallback();
        });

        function errorCallback() {
            swal('Error', 'Something went wrong. Your settings weren\'t saved.', 'error');
        }
    },


    /**
     * Validate then save Calendly Widget Settings.
     *
     * If the user hasn't filled the field it will alert them to this by adding the
     * class .sp-widget-form-error which sets the border color to #1ab394.
     *
     * @param {string} fileHash - The fileHash
     * @return {object} calendlyWidgetData - The widget data for Calendly widget
     */
    saveCalendlyWidgetSettings: function(fileHash) {
        var username = $('[name="calendly-widget-username"]').val();

        if (username.indexOf('://') > -1) {
            username = username.split('/').slice(3).join('/');
        }

        if ($('[name="calendly-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            $('[name="calendly-widget-is-enabled"]').prop('checked', true);
        }

        if ('' === $('[name="calendly-widget-username"]').val()) {
            sp.error.handleError('You must fill the field.');
            $('[name="calendly-widget-username"]').addClass('sp-widget-form-error');
        }

        if ('' === $('[name="calendly-widget-button-text"]').val()) {
            sp.error.handleError('You must fill the field.');
            $('[name="calendly-widget-button-text"]').addClass('sp-widget-form-error');
        }

        if ('' === $('[name="calendly-widget-button-text"]').val() || '' === $('[name="calendly-widget-username"]').val()) {
            sp.viewerWidgetsModal.openErrorTab();
            return undefined;
        }

        var calendlyWidgetData = {
            data: {
                widgetId: 2,
                isEnabled: $('[name="calendly-widget-is-enabled"]').prop('checked'),
                items: [
                    {
                        userName: username,
                        buttonText: $('[name="calendly-widget-button-text"]').val()
                    }
                ]
            }
        };

        return calendlyWidgetData;
    },

    /**
     * Validate then save Question Widget Settings.
     *
     * If the user has selected that the widget 'Is Enabled' but haven't entered filled the field,
     * it will alert them to this.
     *
     * @param {string} fileHash - The fileHash
     * @return {object} askQuestionWidgetData - The widget data for Question widget
     */
    saveAskQuestionWidgetSettings: function(fileHash) {

        if ($('[name="question-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            $('[name="question-widget-is-enabled"]').prop('checked', true);
        }

        if ('' === $('[name="question-widget-text"]').val()) {
            sp.error.handleError('You must fill the field.');
            $('[name="question-widget-text"]').addClass('sp-widget-form-error');
            sp.viewerWidgetsModal.openErrorTab();
            return undefined;
        }

        var askQuestionWidgetData = {
            data: {
                widgetId: 3,
                isEnabled: $('[name="question-widget-is-enabled"]').prop('checked'),
                items: [
                    {
                        buttonText: $('[name="question-widget-text"]').val(),
                        formMessage: $('[name="spQuestionWidgetFormMessage"]').val(),
                        confirmButtonText: $('[name="spQuestionWidgetConfirmButtonText"]').val(),
                        cancelButtonText: $('[name="spQuestionWidgetCancelButtonText"]').val(),
                        formTitle: $('[name="spQuestionWidgetFormTitle"]').val(),
                        customMessageLabel: $('[name="spQuestionWidgetCustomMessageLabel"]').val(),
                        customEmailLabel: $('[name="spQuestionWidgetCustomEmailLabel"]').val(),
                        customEmailValidationErrorMessage: $('[name="spQuestionWidgetCustomEmailValidationErrorMessage"]').val(),
                        buttonColor: $('[name="spQuestionWidgetButtonColor"]').val(),
                        isDefaultButtonColorEnabled: $('.spQuestionWidgetIsDefaultButtonColorEnabled').prop('checked'),
                        isCustomButtonColorEnabled: $('.spQuestionWidgetIsCustomButtonColorEnabled').prop('checked'),
                        location: {
                            right: $('[name="spQuestionWidgetIsLocationRight"]').prop('checked'),
                            bottom: $('[name="spQuestionWidgetIsLocationBottom"]').prop('checked'),
                        },
                        locationProcessMode: {
                            top: $('#rightTop').prop('checked'),
                            bottom: $('#rightBottom').prop('checked')
                        },
                    }
                ]
            }
        };

        return askQuestionWidgetData;
    },

    saveLikeWidgetSettings: function(fileHash) {
        var likeWidgetData = {
            data: {
                widgetId: 4,
                isEnabled: $('[name="like-widget-is-enabled"]').prop('checked'),
                items: [
                    {
                        isCounterEnabled: $('[name="like-widget-counter-is-enabled"]').prop('checked')
                    }
                ]
            }
        };

        return likeWidgetData;
    },


    /**
     * Validate then save Hopper widget settings.
     *
     * If one of the fields are empty, it returns undefined, otherwise it returns
     * hopperWidget which contains the settings for this widget.
     *
     * @param fileHash
     * @returns hopperWidget || undefined
     */
    saveHopperWidget: function(fileHash) {

        if ($('[name="hopper-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            $('[name="hopper-widget-is-enabled"]').prop('checked', true);
        }

        var hopperWidget = {
            data: {
                widgetId: 5,
                isEnabled: $('[name="hopper-widget-is-enabled"]').prop('checked'),
                isHorizontalHopperEnabled: $('[name="horizontal-hopper-widget-is-enabled"]').prop('checked'),
                startFromFirstPage: $('[name="horizontal-hopper-widget-start-page"]').prop('checked')
            }
        };

        var items = [];
        var isHopperSettingEmpty = false;
        $('.sp-hopper-widget__row').each(function() {

            var item = {};
            $(this).find('[data-item-setting]').each(function() {
                switch($(this).attr('data-item-setting')) {

                    case 'hopperText':
                    case 'hopperPage':
                        if ('' === $(this).val()) {
                            sp.error.handleError('You must fill the field.');
                            $(this).addClass('sp-widget-form-error');
                            sp.viewerWidgetsModal.openErrorTab();
                            isHopperSettingEmpty = true;
                            return false;
                        } else {
                            item[$(this).attr('data-item-setting')] = $(this).val();
                        }
                        break;
                    case 'status':
                        if ($(this).prop('checked')) {
                            item['status'] = 'finished';
                        } else {
                            item['status'] = 'unfinished';
                        }
                        break;
                }
            });

            items.push(item);
        });

        items.sort(function(a, b) {
            if (parseInt(a.hopperPage) < parseInt(b.hopperPage)) {
                return -1;
            }
            if (parseInt(a.hopperPage) > parseInt(b.hopperPage)) {
                return 1;
            }
            return 0;
        });

        hopperWidget.data.items = items;

        if (! isHopperSettingEmpty) {
            return hopperWidget;
        } else {
            return undefined;
        }
    },


    /**
     * Form widget.
     *
     * Save params for the form widget.
     *
     * @param fileHash
     * @returns {object} formWidget - The widget data.
     */
    saveFormWidget: function(fileHash) {
        if ($('[name="form-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            $('[name="form-widget-is-enabled"]').prop('checked', true);
        }

        var formWidget = {
            data: {
                widgetId: 7,
                isEnabled: $('[name="form-widget-is-enabled"]').prop('checked'),
                items: []
            }
        };

        var isFormWidgetSettingEmpty = false;
        var item = {};
        var fieldsToValidate = [];

        switch($('[name="formSelectType"]:checked').attr('id')) {
            case 'sp-form-widget__upload-form-radio':
                fieldsToValidate = $('#sp-tab-7 .form-group:not(.sp-form-widget__image-elements)').find('input');
                break;

            case 'sp-form-widget__upload-image-radio':
                fieldsToValidate = $('#sp-tab-7 .form-group:not(.sp-form-widget__form-elements)').find('input');
                break;
        }

        $.each(fieldsToValidate, function() {

            if ('' === $(this).val()
                && $(this).attr('name') !== 'formSelectType'
                && $(this).attr('name') !== 'formImage'
                && $(this).attr('name') !== 'formImageMaxWidth'
                && $(this).attr('name') !== 'formImageMaxHeight'
                && $(this).attr('name') !== 'formWidgetPlacement'
                && $(this).attr('name') !== 'formTitle'
                && $(this).attr('type') !== 'file'
                && $(this).attr('name') !== 'isWidgetButtonPulseEnabled'
                && $(this).attr('name') !== 'formAutoLoadTimeout'
                && $(this).attr('name') !== 'formButtonTextLine2') {

                sp.error.handleError('You must fill the field.');
                $(this).addClass('sp-widget-form-error');
                sp.viewerWidgetsModal.openErrorTab();
                isFormWidgetSettingEmpty = true;
            } else if ($(this).attr('name') === 'formSelectType') {
                item[$(this).attr('name')] = $('[name="formSelectType"]:checked').attr('data-widget-type');
            } else if ($(this).attr('name') === 'formWidgetPlacement') {
                item[$(this).attr('name')] = $('[name="formWidgetPlacement"]:checked').attr('data-widget-placement');
            } else if ($(this).attr('name') === 'isWidgetButtonPulseEnabled') {
                item[$(this).attr('name')] = $('[name="isWidgetButtonPulseEnabled"]').prop('checked');
            } else if (typeof $(this).attr('name') !== 'undefined') {
                item[$(this).attr('name')] = $(this).val();
            }
        });

        formWidget.data.items.push(item);

        if (! isFormWidgetSettingEmpty) {
            return formWidget;
        } else {
            return undefined;
        }
    },

    /**
     * Save settings for Code Widget
     *
     * @param {string} fileHash - The file hash.
     * @returns {object} codeWidget - Code Widget settings.
     */
    saveCodeWidget: function(fileHash) {
        if ($('[name="sp-code-widget__is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            $('[name="sp-code-widget__is-enabled"]').prop('checked', true);
        }

        var codeWidget = {
            data: {
                widgetId: 8,
                isEnabled: $('[name="sp-code-widget__is-enabled"]').prop('checked'),
                items: []
            }
        };

        var isCodeWidgetSettingEmpty = false;

        $('#sp-tab-8 .sp-widget-item').each(function(index) {
            var item = {};

            $(this).find('[name*=code]').each(function() {
                switch($(this).attr('name')) {
                    case 'codeContent':
                        if ('' === $(this).val()) {
                            sp.error.handleError('You must fill the field.');
                            $(this).addClass('sp-widget-form-error');
                            sp.viewerWidgetsModal.openErrorTab();
                            isCodeWidgetSettingEmpty = true;
                        } else {
                            item[$(this).attr('name')] = $(this).val();
                        }
                        break;

                    case 'codeLocation':
                        if ($(this).is(':checked')) {
                            item[$(this).attr('name')] = $(this).val();
                        }
                        break;

                    case 'codeDescription':
                        item[$(this).attr('name')] = $(this).val();
                        break;
                }
            });

            codeWidget.data.items.push(item);
        });

        if (! isCodeWidgetSettingEmpty) {
            return codeWidget;
        }
    },

    /**
     * Save and validate settings for the Link Widget
     *
     * If there is a validation error, this function returns undefined, causing all settings
     * to not be saved.
     *
     * @param fileHash
     * @returns linkWidget || undefined
     */
    saveLinkWidget: function(fileHash) {

        if ($('[name="sp-link-widget--is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            $('[name="sp-link-widget--is-enabled"]').prop('checked', true);
        }

        var linkWidget = {
            data: {
                widgetId: 9,
                isEnabled: $('[name="sp-link-widget--is-enabled"]').prop('checked'),
                items: [],
            }
        };

        var isLinkWidgetSettingEmpty = false;

        $('#sp-tab-9 .sp-link-widget__item').each(function() {
            var item = {};

            $(this).find('[data-item-setting]').each(function() {

                if ('' === $(this).val() && $(this).attr('data-item-setting') !== 'buttonText2'
                    && $(this).attr('data-item-setting') !== 'icon'
                    && $(this).attr('data-item-setting') !== 'layout'
                    && $(this).attr('data-item-setting') !== 'status') {

                    sp.error.handleError('You must fill the field.');
                    $(this).addClass('sp-widget-form-error');
                    sp.viewerWidgetsModal.openErrorTab();
                    isLinkWidgetSettingEmpty = true;

                } else if ('link' === $(this).attr('data-item-setting')) {
                    var url = sp.widgets.widget9.urlHttpConfig($(this).val());
                    item[$(this).attr('data-item-setting')] = url;

                } else if ('icon' === $(this).attr('data-item-setting')) {
                    if ($(this).prop('checked')) {
                        item['icon'] = $(this).attr('data-icon');
                    }
                } else if ('layout' === $(this).attr('data-item-setting')) {
                    if ($(this).prop('checked')) {
                        item['layout'] = $(this).attr('data-layout');
                    }
                } else if ('status' === $(this).attr('data-item-setting')) {
                    if ('completed' === $(this).val()) {
                        item['status'] = 'completed';
                    }
                } else {
                    item[$(this).attr('data-item-setting')] = $(this).val();
                }
            });

            linkWidget.data.items.push(item);
        });

        if (! isLinkWidgetSettingEmpty) {

            if (sp.widgets.widget9.isWidgetPageOrderValid()) {
                return linkWidget;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    },

    emailRequiredWidget: function(fileHash) {

        var emailRequiredWidget = {
            data: {
                widgetId: 10,
                isEnabled: $('[name="sp-email-required-widget--is-enabled"]').prop('checked'),
                items: []
            }
        };

        var item = {};
        item.formTitle = $('[name="spEmailRequiredWidgetFormTitle"]').val();

        emailRequiredWidget.data.items.push(item);

        return emailRequiredWidget;
    },

    saveShareWidget: function(fileHash) {

        var shareWidget = {
            data: {
                widgetId: 11,
                isEnabled: $('[name="sp-share-widget--is-enabled"]').prop('checked'),
                items: []
            }
        };

        var item = {};

        item.buttonText = $('[name="spShareWidgetButtonText"]').val();
        item.buttonColor = $('[name="spShareWidgetButtonColor"]').val();
        item.title = $('[name="spShareWidgetShareTitle"]').val();
        item.description = $('[name="spShareWidgetShareDescription"]').val();

        if ($('.spShareWidgetIsCustomButtonColorEnabled').is(':checked')) {
            item.isButtonColorCustom = true;
        } else {
            item.isButtonColorCustom = false;
        }

        if (typeof $('[name="spShareWidgetShareImageBase64"]').val() !== 'undefined'
            && '' !== $('[name="spShareWidgetShareImageBase64"]').val()) {
            item.imageBase64 = $('[name="spShareWidgetShareImageBase64"]').val();
            item.imageFileName = sp.widgets.widget11.imageFileName;
        } else {
            item.imageUrl = $('[name="spShareWidgetShareImageUrl"]').val();
        }

        if ($('[name="spShareWidgetShareUrl"]').val()) {
            item.url = $('[name="spShareWidgetShareUrl"]').val();
        }

        shareWidget.data.items.push(item);

        return shareWidget;
    },

    /**
     * Validate then save Video Widget Settings.
     *
     * This function also contains validation of the user input. For example, it checks
     * that they haven't selected two videos to appear on the same page, or that they have
     * submitted a video without a video URL.
     *
     * Validation checks:
     * 	- Two page starts aren't the same.
     *  - Video page start is not empty.
     *  - Video Source is not empty.
     *  - Video Title is not empty.
     *
     * @param {string} fileHash - The fileHash
     * @return {object} videoWidgetData - The widget data for Video widget
     */
    saveVideoWidgetSettings: function(fileHash) {

        if ($('[name="video-widget-is-enabled"]').closest('div').hasClass('sp-hide-is-enabled')) {
            $('[name="video-widget-is-enabled"]').prop('checked', true);
        }

        var videoWidgetData = {
            data: {
                widgetId: 1,
                isEnabled: $('[name="video-widget-is-enabled"]').prop('checked')
            }
        };

        var items = [];
        var pagesWithVideo = [];
        var pagesOverlapping = false;
        var isVideoSourceEmpty = false;
        var isNumberFieldEmpty = false;
        var isVideoTitleEmpty = false;
        var videoSourceArr = [];
        $('.sp-video-widget-data-row').each(function(index, value) {
            var item = {};
            var pageStart = null;
            $(this).find('[data-video]').each(function(index2, value2) {

                switch($(this).attr('data-video')) {
                    case 'videoSource':
                        var videoSource = $(value2).val();
                        if (! videoSource || '' === videoSource) {
                            sp.error.handleError('You must fill the field.');
                            $(this).addClass('sp-widget-form-error');
                            isVideoSourceEmpty = true;
                            sp.viewerWidgetsModal.openErrorTab();
                        } else {
                            videoSourceArr = sp.viewerWidgetsModal.handleVideoSource(videoSource);
                            item['isYouTubeVideo'] = videoSourceArr[0];
                            item['videoSource'] = videoSourceArr[1];
                        }
                        break;

                    case 'videoTitle':
                        var videoTitle =  $(value2).val();
                        if ('' === videoTitle) {
                            sp.error.handleError('You must fill the field.');
                            $(this).addClass('sp-widget-form-error');
                            isVideoTitleEmpty = true;
                            sp.viewerWidgetsModal.openErrorTab();
                        } else {
                            item['videoTitle'] =  videoTitle;
                        }
                        break;

                    case 'videoPageStart':
                        pageStart = parseInt($(value2).val());
                        pagesOverlapping = sp.viewerWidgetsModal.arePagesOverlapping(pageStart, pagesWithVideo);
                        if (null !== pageStart) {
                            if (isNaN(pageStart)) {
                                $(value2).addClass('sp-widget-form-error');
                                sp.error.handleError('You must fill the field.');
                                sp.viewerWidgetsModal.openErrorTab();
                                isNumberFieldEmpty = true;
                            } else if (pagesOverlapping) {
                                var errorNumber = $(this).val();
                                $(this).closest('#sp-video-customization-options-container').find('[name="video-widget-page-start"]')
                                    .each(function(index, value) {
                                        if ($(value).val() === errorNumber) {
                                            $(value).addClass('sp-widget-form-error');
                                        }
                                    });
                                sp.viewerWidgetsModal.openErrorTab();
                                sp.error.handleError('You must fill the field.');
                            } else {
                                item['videoPageStart'] = pageStart;
                            }
                        }
                        break;
                }
            });
            items.push(item);
        });
        videoWidgetData.data.items = items;
        if (! pagesOverlapping && ! isVideoSourceEmpty && ! isNumberFieldEmpty && ! isVideoTitleEmpty) {
            return videoWidgetData;
        }
    },

    /**
     * Open the tab where there is an input validation error.
     */
    openErrorTab: function() {
        $('#sp-viewer-widgets-modal input').each(function() {
            if ($(this).hasClass('sp-widget-form-error')) {
                $('#sp-viewer-widgets-modal .tab-pane').removeClass('active');
                $(this).closest('.tab-pane').addClass('active');
                var tabId = $(this).closest('.tab-pane').attr('id');
                $('#sp-viewer-widgets-modal .nav-tabs li').removeClass('active');
                $('[href="#' + tabId + '"]').closest('li').addClass('active');
            }
        });
    },

    /**
     * Check if input fields are empty in document cusomization.
     *
     * @return {boolean} isEmpty - returns true if any of the input fields are empty.
     */
    isInputEmpty: function(widgetId) {
        var isEmpty = false;
        $('#sp-tab-' + widgetId).find('input[type="text"]').each(function(index, input) {
            if ('' === $(input).val()) {
                isEmpty = true;
            } else {
                isEmpty = false;
                return false;
            }
        });

        return isEmpty;
    },

    /**
     * HTML for adding a new row for a video widget setting.
     */
    renderAddVideoRows: function() {
        $('#sp-video-customization-options-container').append(
            '<div class="row sp-video-widget-data-row">'
            +'<div class="col-xs-4">'
            + '<input type="text" data-video="videoSource" class="sp-video-widget" name="video-widget-link" placeholder="e.g. https://www.youtube.com/watch?v=tk-_PgWTASU" data-key-id="1" data-key-type="string">'
            + '</div>'

            + '<div class="col-xs-4">'
            + '<input type="text" data-video="videoTitle" class="sp-video-widget" name="video-widget-title" placeholder="e.g. Watch This Video!" data-key-id="2" data-key-type="string">'
            + '</div>'

            + '<div class="col-xs-2 sp-video-widget-page-choice-container">'
            + '<input type="number" placeholder="e.g. 1" data-video="videoPageStart" class="sp-video-widget" name="video-widget-page-start" min="1" data-key-id="7" data-key-type="integer">'
            + '</div>'

            + '<div class="col-xs-2">'
            + '<a class="btn btn-white btn-sm sp-delete-video-widget__a">'
            + '<i class="fa fa-times" aria-hidden="true"></i>'
            + '</a>'
            + '</div>'
            + '<input type="checkbox" class="form-control" style="display: none;" name="video-widget-is-youtube-video" data-key-id="4" data-key-type="boolean">'
            + '</div>'
        );
    },

    /**
     * Convert YouTube, Vimeo or Barclays video link to embed link.
     *
     * @param {string} videoSource - The video URL.
     *
     * @return an [] - Whether the checkbox checking whether the URL is a youtube video is checked
     * and the videoSource.
     */
    handleVideoSource: function(videoSource) {
        if (typeof videoSource !== 'undefined') {
            var domain = null;

            if (videoSource.indexOf("//") > -1) {
                domain = videoSource.split('/')[2];
            } else {
                domain = videoSource.split('/')[0];
            }

            domain = domain.split('.');

            // e.g. If address is www.media.barclays.co.uk
            if (domain.length > 3) {
                domain = domain[domain.length - 3];

                // e.g. If address is www.youtube.com
            } else {
                domain = domain[domain.length - 2];
            }

            if ('youtube' == domain) {
                $('[name="video-widget-is-youtube-video"]').prop('checked', true);
            } else if ('youtu' === domain) {
                $('[name="video-widget-is-youtube-video"]').prop('checked', true);
                videoSource = 'https://www.youtube.com/embed/' + videoSource.split('/')[3];
            } else {
                $('[name="video-widget-is-youtube-video"]').prop('checked', false);
            }

            // Allow for saving a regular YouTube, Vimeo, or Barclays link, and not only an embed one.
            if (typeof domain !== 'undefined') {
                switch(domain) {
                    case 'youtube':
                        if (videoSource.indexOf('?') > -1) {
                            videoSource = 'https://www.youtube.com/embed/' + getParameterByKey('v', videoSource);
                        }
                        break;

                    case 'vimeo':

                        // Video source id is always last part of Vimeo link after the final '/'.
                        videoSource = 'https://player.vimeo.com/video/' + videoSource.split('/')[videoSource.split('/').length - 1];
                        break;

                    case 'barclays':
                        videoSource = '//www.media.barclays.co.uk/player/?id=' + getParameterByKey('?', videoSource);
                        break;
                }
            }

            return [$('[name="video-widget-is-youtube-video"]').prop('checked'), videoSource];

            /**
             * The function returns the value of a URL query string parameter.
             *
             * @param {string} name - Query string key.
             *
             * @return The URL query string parameter's value.
             */
            function getParameterByKey(key, url) {
                var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
                var results = regex.exec('?' + url.split('?')[1]);

                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            };
        }
    },

    /**
     * Check if two page numbers are the same.
     *
     * @param {number} pageStart - The page the video has been selected to start.
     * @param {object} pagesWithVideo - The array containing the current pages selected.
     *
     * If pageStart is already in pagesWithVideo, it means there is a validation error.
     *
     * @return {true} if pages are overlapping.
     */
    arePagesOverlapping: function(pageStart, pagesWithVideo) {
        if ($.inArray(pageStart, pagesWithVideo) === -1) {
            pagesWithVideo.push(pageStart);
        } else {
            return true;
        }
        return false;
    },

    /**
     * Set Process Mode
     * Add data-is-process-mode attribute for the 'Process Mode' checkbox.
     */
    // setProcessMode: function(processModeChecked) {
    //     $('[name="process-mode-is-enabled"]').prop('checked', processModeChecked);
    // }
};

/**
 * Event handlers for adding and deleting widget rows in the 'Customize' modal.
 */
(function addDeleteRows() {
    sp.viewerWidgetsModal.hopperHtml = $('.sp-hopper-widget__row').html();

    // Hopper.
    $(document).off('click', '.sp-add-hopper-widget__a').on('click', '.sp-add-hopper-widget__a', function() {
        $('#sp-hopper-customize__container').append(
            '<div class="row sp-hopper-widget__row">' +
            sp.viewerWidgetsModal.hopperHtml +
            '</div>'
        );
    });

    $(document).on('click', '.sp-delete-hopper-widget__a', function() {
        $(this).closest('.row').remove();
    });

    // Video.
    $(document).off('click', '.sp-add-video-widget__a').on('click', '.sp-add-video-widget__a', function() {
        sp.viewerWidgetsModal.renderAddVideoRows();
    });

    $(document).on('click', '.sp-delete-video-widget__a', function() {
        $(this).closest('.row').remove();
    });
})();


$('.sp-video-link-tooltip').tooltip({delay: {show: 100, hide: 200}, placement: 'top'});

$(document).on('click', '.link-widget__url-upload-button', function() {
    var that = this;

    swal({
        customClass: 'link-widget__file',
        title: 'Upload a File',
        text: 'This will upload a file to our file storage, and populate the Link URL field with the file link',
        type: 'input',
        inputType: 'file',
        showCancelButton: true,
        closeOnConfirm: false,
        showLoaderOnConfirm: true
    }, function(file) {
        if (!file) {
            swal.showInputError("Please choose a file to upload");
        } else {
            var formData = new FormData();
            formData.append('file', $('.link-widget__file input')[0].files[0]);
            formData.append('documentFriendlyId', $('#sp-save-widgets-settings__button').attr('data-file-hash'));

            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/v1/widgets/link');
            xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
            xhr.onload = function(event) {
                if (typeof xhr.response === 'string' && '<!DOCTYPE html>' === xhr.response.substring(0, 15)) {
                    window.location = '/login';
                } else if (xhr.status === 200) {
                    $($(that).parent().children()[0])
                        .val(JSON.parse(event.target.responseText).url)
                        .prop('readonly', true);
                    swal("Success!", "You successfully uploaded a file", "success");
                } else if (xhr.status === 403 || xhr.status === 500) {
                    window.location = '/login';
                } else {
                    swal("Error!", "Clone operation failed. Please contact support@slidepiper.com for assistance", "error");
                }
            };
            xhr.send(formData);
        }
    });
});

/**
 * Post widget settings to ManagementServlet
 *
 * @param {object} data - The document settings data.
 * @param {string} fileHash - The document fileHash.
 */
function postDocumentSettings(data, fileHash, callback) {
    $.ajax({
        url:'/api/v1/documents/' + fileHash,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        beforeSend: function(xhr) {
            xhr.setRequestHeader(SP.CSRF_HEADER, SP.CSRF_TOKEN);
        },
        success: callback,
        error: function() {
            swal('Error', 'Something went wrong. Your settings weren\'t saved.', 'error');
        }
    });
}
