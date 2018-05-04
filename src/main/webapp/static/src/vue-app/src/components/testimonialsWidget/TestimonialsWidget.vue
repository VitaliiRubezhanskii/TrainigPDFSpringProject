<template>
  <div class="sp-right-side-widgets6" @click="showModal">
    <div class="widget" id="sp-widget6__button">
      <div id="sp-widget6__button-counter">1</div>
      <div id="sp-widget6__button-person-image" :style="{ backgroundImage: `url('${widget.personImage}')`, backgroundColor: 'rgb(0, 150, 136)' }">
        <i v-if="!widget.personImage" class="fa fa-user fa-inverse" style="display: inline;"></i>
      </div>

    </div>
  </div>
</template>
<script>

import $ from "jquery";
import { modalTestimonials } from '../../helper/functions.js';

export default{
  props: ["widget"],
  methods: {
    showModal(){
      modalTestimonials(this.widget.testimonial,this.widget.personName,this.widget.personTitle,this.widget.personImage);
    }
  }
}
</script>

<style>

.sp-right-side-widgets6 {
  max-width: 230px;
  position: fixed;
  right: 0px;
  top: 55px;
  z-index: 3;
}
#sp-widget6__button {
  cursor: pointer;
  height: 90px;
  margin: 0 auto;
  position: relative;
  width: 90px;
}

#sp-widget6__button-counter {
  background-color: #e62117;
  border-radius: 50%;
  color: #fff;
  height: 20px;
  font-size: 14px;
  left: 0;
  line-height: 20px;
  position: absolute;
  text-align: center;
  top: 15px;
  width: 20px;
  z-index: 1;
  box-shadow: 0 0 0 2px #fff;
}

#sp-widget6__button-person-image {
  background-color: transparent;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  box-shadow: 0px 8px 8px rgba(35, 31, 32, 0.3);
  height: 75px;
  margin: 0 auto;
  left: 0;
  position: absolute;
  right: 5px;
  width: 75px;
}

#sp-widget6__button i {
  display: none;
  font-size: 2em;
  height: 100%;
  left: 1px;
  line-height: 90px;
  position: absolute;
  text-align: center;
  top: -9px;
  width: 100%;
}

#sp-widget6__person-image {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 50%;
  height: 100px;
  margin: 0 auto;
  width: 100px;
  margin: 15px auto 20px;
}

#sp-widget6__person-name {
  font-size: 20px;
  font-weight: bold;
  margin-top: 30px;
}

#sp-widget6__person-title {
  margin-top: 10px;
}
.swal2-popup .swal2-image {
  border-radius: 50%;
  height: 100px;
  width: 100px;
}
</style>
