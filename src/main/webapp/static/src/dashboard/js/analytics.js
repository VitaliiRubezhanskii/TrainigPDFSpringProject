var an = an || {};
an = {
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
            an.metric.getFileMetrics(fileData);

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

            an.chart.getFileLine(fileData, customerEmail);
            an.chart.getFileBar(fileData, customerEmail);
            an.chart.getFileVisitorsMap(fileData, customerEmail);
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
                if (!$.isEmptyObject(an.chart.averageViewDurationData)) {
                    an.chart.loadBarChart(an.chart.averageViewDurationData);
                }

                if (!$.isEmptyObject(an.chart.totalViewsData)) {
                    an.chart.loadFileLine(an.chart.totalViewsData);
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
                        an.chart.averageViewDurationData = data;
                        an.chart.loadBarChart(data);
                    }
                );
            } else {
                an.chart.averageViewDurationData = {};

                if (typeof an.chart.fileBar !== 'undefined') {
                    an.chart.fileBar.destroy();
                }
            }
        },

        loadBarChart: function(data) {
            if (typeof an.chart.fileBar !== 'undefined') {
                an.chart.fileBar.destroy();
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

                an.chart.fileBar = new Chart.Bar(ctx, {
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
                        an.chart.totalViewsData = data;
                        an.chart.loadFileLine(data);
                    }
                );
            } else {
                an.chart.totalViewsData = {};

                if (typeof an.chart.fileLine !== 'undefined') {
                    an.chart.fileLine.destroy();
                }
            }
        },

        loadFileLine: function(data) {
            if (typeof an.chart.fileLine !== 'undefined') {
                an.chart.fileLine.destroy();
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

                an.chart.fileLine = new Chart.Line(ctx, {
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

                    if (typeof an.chart.visitorsMap == 'undefined') {
                        an.chart.visitorsMap = new google.visualization.GeoChart(document.getElementById('sp-google-geochart'));
                    }

                    an.chart.visitorsMap.draw(mapData, options);

                    $(window).on('resize', function () {
                        an.chart.visitorsMap = new google.visualization.GeoChart(document.getElementById('sp-google-geochart'));
                        an.chart.visitorsMap.draw(mapData, options);
                    });
                });
            } else {
                if (typeof an.chart.visitorsMap !== 'undefined') {
                    an.chart.visitorsMap.clearChart();
                }
            }
        }
    }  
};