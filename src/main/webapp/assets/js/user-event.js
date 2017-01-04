/**
 * Class for sending user events.
 */
UserEvent = function UserEvent(eventType, extraData){
  this.eventType = eventType;
  this.extraData = extraData;
}

UserEvent.prototype = {
  send: function() {
    var data = {
      eventType: this.eventType,
      extraData: this.extraData,
      email: sp.config.salesman.email
    };
    
    $.ajax({
      contentType: 'application/json',
      method: 'POST',
      url: '//' + location.host + '/v1/events',
      data: JSON.stringify(data)
    });
  }
}
