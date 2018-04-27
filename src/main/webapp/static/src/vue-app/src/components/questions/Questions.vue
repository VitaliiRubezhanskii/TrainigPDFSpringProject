<template>
  <div
    class="question-container"
  >
    <div
      class="sp-right-side-widgets"
      @click="showModal"
    >
      <button
        class="widget sp-widget-button sp-widget-font-fmaily sp--direction-ltr"
        id="sp-widget3"
        :style="{backgroundColor: `${ widget.isCustomButtonColorEnabled ? widget.buttonColor : 'rgb(27, 24, 98)' }`, color: 'rgb(255, 255, 255)'}"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
          style="height: 27%;position: absolute;top: 50%;left: 6%;transform: translateY(-50%);"
        >
          <path
            style="fill:#fff;"
            d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32z"
          />
        </svg>
        <div>
          {{widget.buttonText}}
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import swal from 'sweetalert2';
import value from "jquery-validation";
import { modalQuestions }  from '../../helper/functions.js';

export default{
  props: ["widget"],
  data() {
    return {
      url: window.SP.API_URL,
    }
  },
  methods: {
    showModal(){
      modalQuestions(
        this.url,
        this.widget.buttonText,
        this.widget.customEmailLabel,
        this.widget.customMessageLabel,
        this.widget.cancelButtonText,
        this.widget.confirmButtonText,
        this.widget.customEmailValidationErrorMessage
      );
    }
  },
  computed: {
    isRender(){
      return this.widget.widgetData.find(w => w.widgetId === 3) && this.widget.widgetData.find(w => w.widgetId === 3).isEnabled;
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
  top: 160px;
}

.sp-widget-button {
  background-color: #1aaee4;
  border: none;
  border-radius: 50px 0 0 50px;
  box-shadow: 0px 8.5px 5.67px rgba(35, 31, 32, 0.3);
  color: #fff;
  display: block;
  font-size: 0.9em;
  font-weight: bold;
  min-height: 60px;
  padding: 10px 0;
  outline: none;
  margin: 0;
 }

.sp-widget-button:hover {
  background-color: #47beea;
  box-shadow: 0px 3.5px 4px rgba(35, 31, 32, 0.4);
  cursor: pointer;
}

.sp-widget-button div {
  display: inline-block;
  margin-left: 25px;
  vertical-align: middle;
  width: 120px;
}

.sp-widget-button i {
  display: inline-block;
  font-size: 1.5em;
  vertical-align: middle;
  padding-left: 10px;
}


</style>
