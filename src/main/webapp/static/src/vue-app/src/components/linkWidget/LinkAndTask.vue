<template>
    <button
    :class="widget.status" @click="showLink"
      class="widget sp-widget-button sp-widget-button9 sp-widget-font-fmaily sp--direction-ltr sp-widget9"
      style="background-color: rgb(27, 24, 98); color: rgb(255, 255, 255); margin: 0 20px 0 0;">
      <i :class="'fa '+ widget.icon"></i>
      <div
        class="sp-widget9__text"
      >
        <p> {{ widget.buttonText1 }}</p>
        <p>{{ widget.buttonText2 }}</p>
      </div>
    </button>

</template>

<script>
import { modalLinkAndTask }  from '../../helper/functions.js';

export default{
  props:  ["widget"],
  methods: {
    showLink(){
      this.widget.layout === "external-link"? window.open(this.widget.link): modalLinkAndTask(this.widget.link);
    }
  }
}
</script>

<style scoped>
.sp-widget3-label {
  float: left;
  font-weight: bold;
  margin-bottom: 2px;
  margin-top: 15px;
}

.sp-right-side-widgets {
  max-width: 230px;
  position: absolute;
  right: 0;
  z-index: 4;
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


.sp-widget-button9{
  border-radius: 50px !important;
}
.completed{
  opacity: 0.5;
}
.sp-widget-button div {
  margin-left: 0;
  padding: 0 30px 0 10px;
  width: 155px;
}
</style>
