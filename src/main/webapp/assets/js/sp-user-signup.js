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
        
        var fullName = $('[name=fullName]').val();
        var firstName = fullName.split(' ')[0];
        var lastName = fullName.split(' ').slice(1).join(' ');
        
        formData.append('first-name', firstName);
        formData.append('last-name', lastName);
        formData.append('email', $('[name=email]').val());
        formData.append('password', $('[name=password]').val());
        formData.append('signupCode', $('[name=signup-code]').val());
        formData.append('email-client', 'not-set');
        
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
                Cookies.set('SalesmanEmail', $('input[type=email]').val(), { expires: 90 });
                fbq('track', 'CompleteRegistration');
                ga('send', 'event', {
                  eventCategory: 'button',
                  eventAction: 'signup'
                });
                setTimeout(function() {
                  location.href = '/dashboard';
                }, 2000);
                break;

              default:
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
  },
};

sp.userSignup.init();
