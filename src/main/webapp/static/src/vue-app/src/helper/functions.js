import Vue from 'vue';
import VueSweetalert2 from 'vue-sweetalert2';
import $ from 'jquery';

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
 function modalQuestions(url,title,emailLabel,messageLabel,canselText,confirmText,emailError){
  return Vue.swal({
    title: title,
    html:`<form id="widget3-form" class="sp-widget-font-fmaily">
          <div class="form-group">
          <label for="sp-widget3-message" class="sp-widget3-label">${ messageLabel? messageLabel:'Enter your message:' }</label>
          <textarea class="swal2-textarea" id="sp-widget3-message" rows="5" autofocus></textarea>
          </div>
          <label for="sp-widget3-email" class="sp-widget3-label"><span>* </span>${ emailLabel? emailLabel:'Enter your email address:' }</label>
          </form>`,
    input: 'email',
    cancelButtonText: `${canselText?canselText:'Cansel'}`,
    showCancelButton: true,
    confirmButtonText: `${confirmText?confirmText:'Submit'}`,
    showLoaderOnConfirm: true,
    // preConfirm: (/^[0-9a-z-\.]+\@[0-9a-z-]{2,}\.[a-z]{2,}$/i.test(email)) => {
    // return fetch(`//api.github.com/users/${url}`)
    //   .then(response => response.json())
    //   .catch(error => {
    //     swal.showValidationError(
    //       `${emailError?emailError:'Invalid email address'}`
    //     )
    //   })
    // } ,
    preConfirm: (email,textarea) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (!/^[0-9a-z-\.]+\@[0-9a-z-]{2,}\.[a-z]{2,}$/i.test(email)) {
            Vue.swal.showValidationError(
              `${ emailError? emailError : 'Enter a valid email address' }`
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
function postData(data,url){
  return fetch(`${url}/viewer/event`, {
    method: 'POST',
    credentials: "include",
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: encodeURIComponent(JSON.stringify(data))
  }).then(res=>res.json())
}
export {
  modalTestimonials,
  modalQuestions
};
