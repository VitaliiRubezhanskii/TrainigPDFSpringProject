<template>
<div class="question-container">
  <div class="sp-right-side-widgets" v-modal>
    <button class="widget sp-widget-button sp-widget-font-fmaily sp--direction-ltr" id="sp-widget3" style="background-color: rgb(27, 24, 98); color: rgb(255, 255, 255);">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 33%;
                                                                             height: 33%;
                                                                             position: absolute;
                                                                             top: 50%;
                                                                             left: 3%;
                                                                             transform: translateY(-50%);">
        <path style="fill:#fff;" d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32z"></path>
      </svg>
      <div>
        Any Questions? Click Here
      </div>
    </button>
  </div>

<div class="modal"></div>

</div>
</template>
<script>
import swal from 'sweetalert2';
import $ from "jquery";

export default{
  directives: {
    modal: {
    inserted: function (el, b, c) {
      $(".sp-right-side-widgets").on("click",() => {
         event.preventDefault();
         /*swal("Success!", "Your message has been sent.", "success");*/
         swal({
         customClass: 'sp--direction-ltr',
         confirmButtonText: "Submit",
         cancelButtonText: "Cancel",
         showCancelButton: true,
         showConfirmButton: true,
         html: '<form id="widget3-form" class="sp-widget-font-fmaily">' +
               '<div class="form-group">' +
               '<label for="sp-widget3-message" class="sp-widget3-label">Enter your message:</label>' +
               '<textarea class="swal2-textarea" id="sp-widget3-message" rows="5" autofocus></textarea>' +
               '</div>' +
               '<div class="form-group">' +
               '<label for="sp-widget3-email" class="sp-widget3-label"><span>* </span>Enter your email address:</label>' +
               '<input type="text" name="widget3Email" class="swal2-input" id="sp-widget3-email">' +
               '<p class="sp-widget3-label">You must provide a valid email address.</p>' +
               '<span class="form-control-feedback fa"></span>' +
               '</div>' +
               '</form>',
         title: "Any Questions? Click Here",
        })
       });
     }
    }
  }
    }
</script>
<style>
input,
textarea {
  margin: 0 !important;
}

.sp-widget3-label {
  float: left;
  font-weight: bold;
  margin-bottom: 2px;
  margin-top: 15px;
}

.sp-right-side-widgets {
  max-width: 230px;
  position: fixed;
  right: 0;
  width: 20%;
}

.sp-widget-button {
  background-color: #1aaee4;
  border: none;
  border-radius: 50px 0 0 50px;
  box-shadow: 0px 8.5px 5.67px rgba(35, 31, 32, 0.3);
  color: #fff;
  display: block;
  font-size: 1.2em;
  font-weight: bold;
  min-height: 90px;
  padding: 20px 0;
  width: 100%;
  outline: none;
 }

.sp-widget-button:hover {
  background-color: #47beea;
  box-shadow: 0px 3.5px 4px rgba(35, 31, 32, 0.4);
  cursor: pointer;
}

.sp-widget-button div {
  display: inline-block;
  margin-left: 16px;
  vertical-align: middle;
  width: 120px;
}

.sp-widget-button i {
  display: inline-block;
  font-size: 2em;
  vertical-align: middle;
}
</style>

<div class="swal2-container">
  <div class="swal2-overlay" tabindex="-1" style="display: block; opacity: 1;"></div>
  <div class="swal2-modal sp--direction-ltr show-swal2" style="display: block; width: 500px; padding: 20px; margin-left: -250px; background: rgb(255, 255, 255); margin-top: -208px;" tabindex="-1">
    <div class="swal2-icon swal2-error" style="display: none;">
      <span class="x-mark">
        <span class="line left"></span>
        <span class="line right"></span>
      </span>
    </div>
  <div class="swal2-icon swal2-question" style="display: none;">
    ?
  </div>
  <div class="swal2-icon swal2-warning" style="display: none;">
    !
  </div>
  <div class="swal2-icon swal2-info" style="display: none;">
    i
  </div>
  <div class="swal2-icon swal2-success" style="display: none;">
    <span class="line tip"></span> <span class="line long"></span>
    <div class="placeholder"></div> <div class="fix"></div>
  </div>
  <img class="swal2-image" style="display: none;">
  <h2>Any Questions? Click Here</h2>
  <div class="swal2-content" style="display: block;">
    <form id="widget3-form" class="sp-widget-font-fmaily" novalidate="novalidate">
      <div class="form-group">
        <label for="sp-widget3-message" class="sp-widget3-label">
          Enter your message:</label>
        <textarea class="swal2-textarea" id="sp-widget3-message" rows="5" autofocus=""></textarea>
      </div>
      <div class="form-group">
        <label for="sp-widget3-email" class="sp-widget3-label">
        <span>
          *
         </span>
          Enter your email address:
        </label>
        <input type="text" name="widget3Email" class="swal2-input" id="sp-widget3-email">
        <span class="form-control-feedback fa"></span>
      </div>
     </form>
    </div>
    <input class="swal2-input" style="display: none;">
    <select class="swal2-select" style="display: none;"></select>
    <div class="swal2-radio" style="display: none;"></div>
      <label class="swal2-checkbox" style="display: none;">
      <input type="checkbox" id="swal2-checkbox">
      </label>
      <textarea class="swal2-textarea" style="display: none;"></textarea>
      <div class="swal2-validationerror" style="display: none;"></div>
      <hr class="swal2-spacer" style="display: block;">
      <button class="swal2-confirm styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">
        Submit
      </button>
      <button class="swal2-cancel styled" style="display: inline-block; background-color: rgb(170, 170, 170);">
        Cancel
       </button>
       <span class="swal2-close" style="display: none;">
        ×
       </span>
  </div>
 </div>
