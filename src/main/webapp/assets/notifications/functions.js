var sp = sp || {};

sp.notifications = {
    unreadCount: 0,
    toolbarNotifications: 'notificationsToolbar',
    tableNotifications: 'notificationsTable',
    
    init: function() {
      sp.notifications.getNotifications(sp.notifications.toolbarNotifications);
    },
    
    /**
     * Get Notifications from the DB.
     * 
     * @param {string} subAction - Get notifications data for the toolbar or for the table.
     */
    getNotifications: function(subAction) {
        $.getJSON(
          'ManagementServlet',
          {
            action: 'getNotifications',
            subAction: subAction,
            salesmanEmail: sp.config.salesman.email
          },
          function(data) {
            switch(subAction) {
              case 'notificationsToolbar':
                sp.notifications.displayToolbarNotifications(data.notifications);
                break;
                
              case 'notificationsTable':
                sp.notifications.displayTableNotifications(data.notifications);
                break;
            }
          }
        );
    },
    
    /**
     * Display Notifications in the Toolbar.
     * 
     * @function setActionValue - Set an event name based on the event name from
     * the customer_events table.
     * @param {object} notifications - The notifications data.
     */
    displayToolbarNotifications: function(notifications) {
      $('#sp-notifications__list-container li').remove();
      
      sp.notifications.unreadCount = 0;
      $.each(notifications, function(index, value) {
        $('#sp-notifications__list-container').append(
            '<li data-id=' + value.id + ' class="sp-notifications">' +
               '<div class="dropdown-messages-box">' +
               '<div class="container-fluid">' +
                 '<div class="media-body row">' +
                    '<div class="col-xs-8 sp-notifications__text-container">' +
                      '<strong class="sp-notifications__customer-email">' + value.customerEmail + ' </strong> ' + setActionValue(value.event) + ' <strong class="sp-notifications__document-name">' + value.documentName + '</strong>.<br>' +
                    '</div>' +
                    '<div class="col-xs-4 sp-notifications__date-container">' +
                      '<small class="pull-right sp-notifications__time-elapsed">' + moment(value.timestamp).from(moment(value.currentTime)) + '</small>' +
                      '<div data-toggle="tooltip" class="sp-notifications__read-button sp-notifications__button-hidden"></div>' +
                    '</div>' +
                 '</div>' +
                 '</div>' +
               '</div>' +
            '</li>'
        );  
        
        var notificationItem = $('[data-id=' + value.id + '] .sp-notifications__customer-email');
        
        if (typeof value.enteredEmailAddress !== 'undefined'
        	&& value.customerEmail === 'default@example.com') {
        	$(notificationItem).text(value.enteredEmailAddress + ' (via: Generic Link)');
        } else if (typeof value.enteredEmailAddress === 'undefined'
        	&& value.customerEmail === 'default@example.com') {
        	$(notificationItem).text('Generic Link');
        } else if (typeof value.enteredEmailAddress !== 'undefined') {
        	$(notificationItem).text(value.enteredEmailAddress + ' (via: ' + value.customerEmail + ')');
        }
        
        // Display message reply email if it is a notification for Ask Question widget.
        if ((typeof value.messageReplyEmail !== 'undefined' && '' !== value.messageReplyEmail) && 'VIEWER_WIDGET_ASK_QUESTION' === value.event) {
          $('[data-id=' + value.id + '] .sp-notifications__customer-email').text(value.messageReplyEmail);
        }
        
        if (value.isRead) {
          $('[data-id=' + value.id + ']')
              .find('.sp-notifications__read-button').remove();
        } else {
          $('[data-id=' + value.id + ']')
              .addClass('sp-notifications__unread')
              .find('.sp-notifications__read-button').addClass('sp-notifications__is-unread');
          
          sp.notifications.unreadCount++;
          $('#sp-notifications__count').text(sp.notifications.unreadCount);
        }
      });
      
      // init dotdotdot ellipsis - will work if toolbar is open. Otherwise init on click on toolbar icon.
      $('.sp-notifications__text-container').dotdotdot();   
      
      // init tooltip
      $('.sp-notifications__is-unread').tooltip({delay: {show: 100, hide: 200}, title: 'Mark As Read', placement: 'left'});
      
      $('.sp-notifications__unread').hover(function() {
        $(this)
          .find('.sp-notifications__read-button')
          .removeClass('sp-notifications__button-hidden');
      }, function() {
        $(this)
          .find('.sp-notifications__read-button')
          .addClass('sp-notifications__button-hidden');
      });
      
      /**
       * @param {string} dbAction - The event from the customer_events table.
       */
      function setActionValue(dbAction) {
        var action = '';
        
        switch(dbAction) {
          case 'OPEN_SLIDES':
            action = 'opened';
            break;
            
          case 'VIEWER_WIDGET_ASK_QUESTION':
            action = 'sent you a message on';
            break;
          }
          
        return action;
      }
      
      sp.notifications.seeAll();
      
      $('.sp-notifications__read-button').click(function() {
        sp.notifications.markAsRead($(this));
      });
      
      $('#sp-notifications__header-mark-all-read').click(function() {
        $('.sp-notifications__read-button').each(function() {
          sp.notifications.markAsRead($(this));
        });
      });
    },
    
    /**
     * Mark an individual or all notifications as read, and update the customer_events table.
     * 
     * @param {object} button - the jQuery selector $(this) of the 'Mark As Read' button that has been clicked.
     */
    markAsRead: function(markAsReadButton) {
        var id = $(markAsReadButton).closest('li').attr('data-id');
        $(markAsReadButton)
          .tooltip('destroy')
          .closest('li').removeClass('sp-notifications__unread');
        
        $(markAsReadButton).remove();
        
        sp.notifications.unreadCount--;
        if (0 === sp.notifications.unreadCount) {
          $('#sp-notifications__count').hide();
        } else {
          $('#sp-notifications__count').text(sp.notifications.unreadCount);
        }
        
        $.ajax({
          url: 'ManagementServlet',
          type: 'post',
          data: JSON.stringify({
            action: 'setNotificationRead',
            id: id
          })
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
    
    /**
     * Click on 'See All' in Toolbar Notifications to view the Notifications table.
     */
    seeAll: function() {
      $('#sp-notifications__see-all').click(function() {
        $('.sp-dashboard, .sp-nav-section ul').hide();
        $('.sp-nav-section').removeClass('active');
        $('#sp-notifications-table').show();
        $('#sp-nav-notifications').addClass('active');
        
        sp.notifications.getNotifications(sp.notifications.tableNotifications);
      });
    }
};


/**
 * Avoid dropdown menu close on click inside
 */
$(document).on('click', 'body', function(event) {
  
  if ($('#sp-notifications__nav i').is(event.target) 
   || $('#sp-notifications__nav a').is(event.target)
   || $('#sp-notifications__count').is(event.target)) {
    $('#sp-notifications__nav').toggleClass('open');
    
    // init dotdotdot ellipsis plugin.
    $('.sp-notifications__text-container').dotdotdot();       

  } else if (! $('#sp-notifications__list-container').is(event.target)
      && ! $('.sp-notifications__read-button').is(event.target)
      && ! $('#sp-notifications__list-container li').is(event.target)
      && ! $('#sp-notifications__list-container div').is(event.target)
      && ! $('#sp-notifications__list-container ul').is(event.target)
      && ! $('#sp-notifications__list-container strong').is(event.target)
      && ! $('#sp-notifications__list-container small').is(event.target)
      && ! $('#sp-notifications__header').is(event.target)
      && ! $('#sp-notifications__header span').is(event.target)) {
       $('#sp-notifications__nav').removeClass('open');
  }
});
