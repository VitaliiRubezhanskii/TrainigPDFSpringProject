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
.sp-right-side-widgets {
  max-width: 230px;
  position: fixed;
  right: 0;
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
