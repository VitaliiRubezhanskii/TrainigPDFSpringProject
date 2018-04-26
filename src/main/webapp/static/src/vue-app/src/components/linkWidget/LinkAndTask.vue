<template>
  <div class="sp-right-side-widgets1" :class="widget.status" @click="showLink">
    <button class="widget sp-widget-button sp-widget-font-fmaily sp--direction-ltr sp-widget9" style="background-color: rgb(27, 24, 98); color: rgb(255, 255, 255); margin-top: 20px;">
      <i :class="'fa '+ widget.icon"></i>
      <div class="sp-widget9__text">
        <p> {{ widget.buttonText1 }}</p>
        <p>{{ widget.buttonText2 }}</p>
      </div>
    </button>
  </div>
</template>

<script>
import $ from "jquery";

export default{
  props:  ["widget"],
   methods: {
    showLink(){
      window.open(this.widget.link);
    }
   }
  }
</script>

<style>
.completed{
  opacity: 0.5;
}
.sp-right-side-widgets1 {
  max-width: 200px;
}

#sp-widget9 {
  transition: transform 1s ease-in-out;
}

.sp-widget9__transition {
  transform: translateX(100%);
}

.sp-widget9__text p:nth-child(2) {
  margin-top: 5px;
}


</style>
