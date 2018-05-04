<template >
  <div id="sp-widget5__horizontal-hopper-container" v-hopper v-goToPage v-scroll />
</template>

<script>
import $ from "jquery";

export default{
  directives: {
    hopper: {
      inserted: function (el, b, c) {
      let escapeHtml = function(input) {
          let entityMap = {
              '&': '&#38;',
              '<': '&#60;',
              '>': '&#62;',
              '"': '&#34;',
              "'": '&#39;',
              '/': '&#47;',
              '`': '&#96;',
              '=': '&#61;'
          };
          return String(input).replace(/[&<>"'`=\/]/g, function(char) {
              return entityMap[char];
          });
      };
        c.context.widget.filter(el => el)[0].data.items.map(e => {
          $(el).append(
             '<div class="sp-widget5__horizontal-hop" ' + '" data-page-horizontal-hop="' + escapeHtml(e.hopperPage) + '">' +
             '<p class="sp-widget5__horizontal-hop-text"'+ '" data-page-horizontal-hop="' + escapeHtml(e.hopperPage) + '">' + escapeHtml(e.hopperText) + '</p>' +
             '</div>'
          );
        })
      }
    },
    goToPage: {
      inserted: function (el, b, c) {
      $(el).children()[0].className = "sp-widget5__horizontal-hop active";
        $(el).on('click',function(e){
          document.getElementById(e.target.getAttribute('data-page-horizontal-hop')).scrollIntoView();
          if($(".active")[0]) {
            $(".active")[0].className = "sp-widget5__horizontal-hop";
          }
          if(e.target.className == "sp-widget5__horizontal-hop") {
            e.target.className = "sp-widget5__horizontal-hop active";
          } else {
            e.target.parentElement.className = "sp-widget5__horizontal-hop active"
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
  props: [
    'widget'
  ],
  data() {
    return {
    }
  }
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
  margin-bottom: 20px;
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
  width: 60%;
}
.active{
  background-color: #ec971f;
}
.sp-widget5__horizontal-hop.active::after {
  border-color: transparent transparent transparent #ec971f;
}
</style>

