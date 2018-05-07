<template >
  <div
    id="sp-widget5__horizontal-hopper-container"
    v-goToPage
  >
    <div
      v-for="(e, index) in widget.items"
      class="sp-widget5__horizontal-hop"
      :class="{ active: page === index + 1 }"
      :data-page-horizontal-hop="e.hopperPage"
    >
      <p
        class="sp-widget5__horizontal-hop-text"
        :data-page-horizontal-hop="e.hopperPage">
          {{ e.hopperText }} 
      </p>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import { animateScroll } from '../../helper/functions';

export default{
  props: ['widget', 'page'],
  directives: {
    goToPage: {
      inserted: function (el, b, c) {
      //$(el).children()[0].className = "sp-widget5__horizontal-hop active";
        $(el).on('click',function(e){
          c.context.$emit("go-page",{ page: Number(e.target.getAttribute('data-page-horizontal-hop'))});
          animateScroll();
        })
      }
    },
  },
}
</script>

<style>
p {
  margin: 0;
  padding: 0;
}

#sp-widget5__horizontal-hopper-container {
  display: flex;
  position: relative;
  overflow: scroll;
  margin: 0 auto;
  padding-right: 22px;
  margin-bottom: 10px;
}

#sp-widget5__horizontal-hopper-container::-webkit-scrollbar {
  display: none;
  position: relative;
}

.sp-widget5__horizontal-hop {
  height: 40px;
  min-width: 150px;
  background-color: rgb(27, 24, 98);
  color: rgb(255, 255, 255);
  position: relative;
  margin-right: 3px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex:   1   1   100px;
  justify-content: center;
  font-size: 14px;
}
.sp-widget5__horizontal-hop::after {
  content: "";
  position: absolute;
  width: 0;
  top: 0;
  right: -25px;
  z-index: 1;
  height: 0;
  border-style: solid;
  border-width: 20px 0 20px 25px;
  border-color: transparent transparent transparent rgb(27, 24, 98);;
}
.sp-widget5__horizontal-hop::before {
  content: "";
  position: absolute;
  width: 0;
  left: 0;
  height: 0;
  border-style: solid;
  border-width: 20px 0 20px 25px;
  border-color: transparent transparent transparent #ffffff;
}
.sp-widget5__horizontal-hop-text {
  padding: 0 0 0 30px;
  word-wrap: break-word;
  line-height: 0.9;
  align-self: center;
}
#sp-widget5__horizontal-hopper-container div:first-child::before{
  display: none;
}
.active{
  background-color: #ec971f;
}
.sp-widget5__horizontal-hop.active::after {
  border-color: transparent transparent transparent #ec971f;
}
</style>
