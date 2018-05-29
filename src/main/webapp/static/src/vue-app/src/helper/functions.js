import Vue from 'vue';
import VueSweetalert2 from 'vue-sweetalert2';
import $ from 'jquery';
import sp from '../constants/spViewer.js';

 function modalTestimonials(testimonials, personName, personTitle, imageUrl){
  return (Vue.swal({
              html: `<div><i class="fa fa-quote-left"></i>${testimonials}<i class="fa fa-quote-right"></i></div>
                      <div id="sp-widget6__person-name">${personName}</div>
                      <div id="sp-widget6__person-title">${personTitle}</div>`,
              imageUrl: imageUrl,
              imageWidth: 200,
              imageAlt: 'Custom image',
              animation: false,
  }));
}

 function modalQuestions(url,title,emailLabel,messageLabel,cancelText,confirmText,emailError){
   let customEmailLabel = emailLabel ? emailLabel : 'Enter your email address:';
   let customMessageLabel = messageLabel? messageLabel:'Enter your message:';
   let cancelButtonText = cancelText ? cancelText : 'Cancel';
   let confirmButtonText = confirmText?confirmText:'Submit';
  return Vue.swal({
    title: title,
    html:`<form id="widget3-form" class="sp-widget-font-fmaily">
          <div class="form-group">
          <label for="sp-widget3-message" class="sp-widget3-label">${ customMessageLabel }</label>
          <textarea class="swal2-textarea" id="sp-widget3-message" rows="5" autofocus></textarea>
          </div>
          <label for="sp-widget3-email" class="sp-widget3-label"><span>* </span>${ customEmailLabel }</label>
          </form>`,
    input: 'email',
    cancelButtonText: `${cancelButtonText}`,
    showCancelButton: true,
    confirmButtonText: `${confirmButtonText}`,
    showLoaderOnConfirm: true,
    preConfirm: (email) => {
    let data = {
        type: sp.viewer.eventName.viewerWidgetAskQuestion,
        channelFriendlyId: sp.viewer.linkHash,
        sessionId: SP.SESSION_ID,
        param_1_varchar: $('#sp-widget3').text(),
        param_2_varchar: $('#sp-widget3-message').val(),
        param_3_varchar: $('#sp-widget3-email').val(),
        param_4_varchar: confirmButtonText,
        param_5_varchar: cancelButtonText,
        param_6_varchar: customMessageLabel,
        param_7_varchar: customEmailLabel,
        param_8_varchar: 'Invalid email address',
        param_9_varchar: 'right',
        param_10_varchar: title,
    }
    return postData(data, url)
      .catch(error => {
        Vue.swal.showValidationError(
          `Request failed: ${error}`
        )
      })
    },
    allowOutsideClick: () => !swal.isLoading()
  }).then((result) => {
    if (result.value) {
      Vue.swal("Success!", "Your message has been sent.", "success");
    }
  });
}

function modalLinkAndTask(url){
  Vue.swal({
    cancelButtonText: 'Close',
    html: `<iframe class="link-task" style="height: 75vh" frameborder="0" src="${url}" allow="geolocation; microphone; camera"></iframe>`,
    showConfirmButton: false,
    showCancelButton: true,
    width: 800,
  })
}

function postData(data,url){
  return fetch(`${url}/viewer/event`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: JSON.stringify(data)
  })
}

function animateScroll(){
  return $('#sp-widget5__horizontal-hopper-container').animate({ scrollLeft: $('#sp-widget5__horizontal-hopper-container>div.active')[0].offsetLeft + $('#sp-widget5__horizontal-hopper-container>div.active')[0].offsetWidth/2 - $('#sp-widget5__horizontal-hopper-container')[0].offsetWidth / 2},'fast');
}
export {
  modalTestimonials,
  modalQuestions,
  modalLinkAndTask,
  animateScroll
};
