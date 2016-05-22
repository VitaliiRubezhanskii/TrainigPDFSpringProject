/**
 * Add a salesman to the DB.
 */

var sp = sp || {};

sp = {
  signup: {
    init: function() {
      $(document).ready(function() {
         sp.signup.newUser();
      });
    },
    
    newUser: function() { 
      $('#sp-signup__form').submit(function () {
        var formData = {
            action: 'setSalesman'
         };
         $('input:not([type=submit]), select').each(function(index){
           formData[$(this).attr('id')] = this.value;
         });
        
        $.ajax({
          async: false,
          type: 'POST',
          url: 'ManagementServlet',
          contentType : 'application/json; charset=utf-8',
          dataType: 'json',
          data: JSON.stringify(formData),
        }).done(function(data) {
          switch (data.statusCode) {
            case 200:
              alert('The user was added successfuly.');
              $('input:not([type=submit])').val('');
              $('select').val('gmail');
              window.open(
                  'mailto:'   + formData.email
                + '?subject=' + encodeURIComponent('Welcome to SlidePiper - Beta Test License!')
     
                + '&body='    + encodeURIComponent('Dear ' + formData['first-name'] + ',\r\n\r\n'

                              + 'I would like to personally welcome you as a SlidePiper Beta user. We look forward to working with you to understand and customize this tool to give you more value.\r\n\r\n'
                    
                              + 'With this beta version you will be able to send tracked documents that have call to action buttons and chat.\r\n'
                              + 'You can then view the analytics that are generated from the viewing of the document. There will be updates giving more features as we finish the development and testing.\r\n\r\n'
                    
                              + 'Your username is:\r\n'
                              + formData.email + '.\r\n\r\n'
                              + 'Your initial Password is:\r\n'
                              + '12345678\r\n\r\n'
                              + 'To login follow this link:\r\n'
                              + 'http://www.slidepiper.com/login.html\r\n\r\n'
                    
                              + 'I have made a 3 minute video to walk you through the product and help get you started.\r\n'
                              + 'See this link: https://youtu.be/tk-_PgWTASU\r\n\r\n'
                                 
                              + 'Please feel free to reach out with any questions or support that you need.\r\n\r\n'  
                    
                              + 'Best Regards\r\n\r\n'
                    
                              + 'Sivan Bender - Founder & CEO\r\n'
                              + '054-681-5095\r\n'
                              + 'sivanb@slidepiper.com'
                  )
                );
              break;

            case 100:
              alert('The user ' + formData.email + ' already exists.');
              break;
              
            case 101:
              alert('The user was not added. Magic inccorect.');
              break;
              
            default:
              alert('The user was not added. Error code: ' + data.statusCode + '.');
          }
          
        }).fail(function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus + ': ' + errorThrown);
        });
        event.preventDefault();
      });
    }
  }
};

sp.signup.init();