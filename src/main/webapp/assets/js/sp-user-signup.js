var sp = sp || {};

sp = {
  
  userSignup: {
        init: function () {
          $(document).ready(function () {
            sp.userSignup.newUser();
          });
        },
    
        newUser: function () {
          $('#sp-user-signup__form').submit(function (event) {
            if (!event) {
              event = window.event;
            }
            event.stopPropagation();
            event.preventDefault();
            
            var formData = new FormData();
            formData.append('action', 'setSalesman');
            
            $('input:not(submit)').each(function () {
              formData.append($(this).attr('name'), $(this).val());
              console.log($(this).attr('name') + ', ' + $(this).val());
            });

            $.ajax({
              url: 'create-user',
              type: 'post',
              contentType : false,
              processData: false,
              cache: false,
              data: formData,
              success: function (data) {
                switch (data.statusCode){
                  case 200:
                    var eventData = {
                      'email': $('input[type="email"]').val(),
                      'event_name': 'SIGNUP_USER'
                    };
                    sp.userSignup.setUserEvent(eventData);
                    Cookies.set('SalesmanEmail', $('input[type=email]').val(), { expires: 90 });
                    location.href = 'dashboard.html';
                    break;
                  case 100:
                    swal('There was an error with the signup');
                    break;
                }
              },
              error: function (err) {
                console.log(err);
              }
            });
          });
        },
        
        setUserEvent: function (eventData) {
          var data = {
              action: 'setUserEvent',
              data: eventData
          };
          $.post('ManagementServlet', JSON.stringify(data));
        }
      },
};

sp.userSignup.init();