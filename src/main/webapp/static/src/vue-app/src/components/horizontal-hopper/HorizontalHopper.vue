<template >
  <div id="sp-widget5__horizontal-hopper-container" v-goToPage v-scroll>
    <div v-for="e in widget.items" class="sp-widget5__horizontal-hop" :data-page-horizontal-hop="e.hopperPage">
      <p class="sp-widget5__horizontal-hop-text" :data-page-horizontal-hop="e.hopperPage"> {{ e.hopperText }} </p>
    </div>
  </div>
</template>

<script>
import $ from "jquery";

export default{
  props: ['widget'],
  directives: {
    goToPage: {
      inserted: function (el, b, c) {
      $(el).children()[0].className = "sp-widget5__horizontal-hop active";
        $(el).on('click',function(e){
          c.context.$emit("go-page",{ page: Number(e.target.getAttribute('data-page-horizontal-hop'))});
          document.getElementById(e.target.getAttribute('data-page-horizontal-hop')).scrollIntoView();
          if($(".active")[0]) {
            $(".active")[0].className = "sp-widget5__horizontal-hop";
          }
          if(e.target.className == "sp-widget5__horizontal-hop") {
            e.target.className = "sp-widget5__horizontal-hop active";
          } else {
            e.target.parentElement.className = "sp-widget5__horizontal-hop active";
          }
        })
      }
    },
    scroll:{
      inserted: function (el, b, c) {
       $(el).on("mousewheel",function(e){
          if(e.originalEvent.wheelDelta /120 > 0) {
              $(this).scrollLeft($(this).scrollLeft() + 100);
          }
          else{
              $(this).scrollLeft($(this).scrollLeft() - 100);
          }
        });
        $(el).on("click",() => {
          $(el).animate({ scrollLeft: $('#sp-widget5__horizontal-hopper-container>div.active')[0].offsetLeft + $('#sp-widget5__horizontal-hopper-container>div.active')[0].offsetWidth/2 - $(el)[0].offsetWidth / 2},'fast');
        })
      }
    }
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
  overflow: hidden;
  margin: 0 auto;
  margin-bottom: 15px;
  padding-right: 22px;
}
.sp-widget5__horizontal-hop {
  min-height: 40px;
  background-color: rgb(27, 24, 98);
  color: rgb(255, 255, 255);
  position: relative;
  margin-right: 3px;
  box-sizing: border-box;
  cursor: pointer;
  flex:   1   1   100px;
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
  padding: 0 30px 0 30px;
  line-height: 40px;
}
#sp-widget5__horizontal-hopper-container div:first-child::before{
  display: none;
}
#holder canvas{
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  width: 100%;
}
.active{
  background-color: #ec971f;
}
.sp-widget5__horizontal-hop.active::after {
  border-color: transparent transparent transparent #ec971f;
}
</style>
