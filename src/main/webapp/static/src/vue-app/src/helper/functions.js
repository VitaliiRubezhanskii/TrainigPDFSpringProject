import Vue from 'vue';
import VueSweetalert2 from 'vue-sweetalert2';


// Vue.use(VueSweetalert2);

 function modalTestimonials(testimonials, personName, personTitle, imageUrl){
  return (Vue.swal({
              html: `<div><i class="fa fa-quote-left"></i>${testimonials}<i class="fa fa-quote-right"></i></div>
                      <div id="sp-widget6__person-name">${personName}</div>
                      <div id="sp-widget6__person-title">${personTitle}</div>`,
              imageUrl: imageUrl,
              imageWidth: 200,
              imageAlt: 'Custom image',
              animation: false
  }));
}
 function modalQuestions(){
  return Vue.swal({
    title: 'Any Questions? Click Here',
    html:'<form id="widget3-form" class="sp-widget-font-fmaily">' +
          '<div class="form-group">' +
          '<label for="sp-widget3-message" class="sp-widget3-label">Enter your message:</label>' +
          '<textarea class="swal2-textarea" id="sp-widget3-message" rows="5" autofocus></textarea>' +
          '</div>' +
          '<label for="sp-widget3-email" class="sp-widget3-label"><span>* </span>Enter your email address:</label>' +

          '</form>',
    input: 'email',
    showCancelButton: true,
    confirmButtonText: 'Submit',
    showLoaderOnConfirm: true,
    preConfirm: (email,textarea) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (!/^[0-9a-z-\.]+\@[0-9a-z-]{2,}\.[a-z]{2,}$/i.test(email)) {
            Vue.swal.showValidationError(
              'You must provide a valid email address.'
            )
          }
          resolve()
        }, 2000)
      })
    },
    allowOutsideClick: () => !swal.isLoading()
  }).then((result) => {
    if (result.value) {
      Vue.swal("Success!", "Your message has been sent.", "success");
    }
  });
}
export {
  modalTestimonials,
  modalQuestions
};
