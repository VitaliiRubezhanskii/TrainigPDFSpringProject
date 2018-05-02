<template>
  <div class="widget sp--direction-ltr" id="sp-widget1" v-video>
    <div id="sp-widget1-tab">
      <i class="fa fa-video-camera"></i>
      <div class="sp-widget-font-fmaily">{{ widget.videoTitle }}</div>
    </div>
    <i id="sp-widget1-fa-chevron" class="fa fa-chevron-up"></i>
    <div id="sp-widget1-video-container" style="display: none;">
      <iframe
        id="sp-widget1-youtube-player"
        frameborder="0"
        allowfullscreen="1"
        allow="autoplay;
        encrypted-media"
        title="YouTube video player"
        width="640" height="360"
        :src="widget.videoSource + '?playlist=' + widget.videoSource.match(/[^/]+$/g)[0] + '&loop=1'"
        style="visibility: visible; display: inline;"
      >
      </iframe>
    </div>
  </div>
</template>

<script>
import $ from "jquery";

export default{
  props: ["widget"],
  directives: {
    video: {
      inserted: function (el, b, c) {
        $(el).on("click", (event)=>{
          $(".fa-chevron-up").toggleClass('fa-chevron-down');
          $("#sp-widget1-video-container").toggle({display: 'block'});
        });
      }
    }
  }
}
</script>

<style>

#sp-widget1 {
  background-color: white;
  border: 1px solid #8D8D8D;
  border-top-right-radius: 5px;
  bottom: 0;
  color: #0074A6;
  cursor: pointer;
  left: 0;
  padding: 7px 7px 0;
  position: fixed;
  z-index: 3;
  text-align: left;
  margin: 0;
}

#sp-widget1-tab {
  display: inline-block;
  height: 22px;
  margin-bottom: 3px;
  width: 360px;
}

#sp-widget1 .fa {
  vertical-align: middle;
}

#sp-widget1-tab .fa-video-camera {
  margin-right: 10px;
}

#sp-widget1 .fa-chevron-up,
#sp-widget1 .fa-chevron-down {
  float: right;
}

#sp-widget1-tab div {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
  width: 75%;
}

#sp-widget1-video-container {
  display: none;
}

#sp-widget1 iframe {
  display: none;
  height: 270px;
  width: 480px;
}
</style>
