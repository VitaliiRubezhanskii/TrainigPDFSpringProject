<template>
  <div class="sp-right-side-widgets6">
    <div class="widget" id="sp-widget6__button">
      <div id="sp-widget6__button-counter">1</div>
      <div id="sp-widget6__button-person-image" ></div>
      <i class="fa fa-user fa-inverse"></i>
    </div>
  </div>
</template>
<script>

import $ from "jquery";

export default{
  data(){
    return {
      testimonialsData: null,
      sp: window.SP,
      location: window.location.search,
      url: null,
    }
  },
  created() {
    fetch(`${this.sp.API_URL}/viewer/widgets?fileLinkHash=${this.location.slice(3)}`)
      .then(response => response.json())
      .then(data => {
        this.testimonialsData = data.filter(el => {
          return JSON.parse(el.widgetData).data.widgetId === 6
        });
        //this.url = JSON.parse(this.testimonialsData.widgetData).data.items[0].personImage;
      });
  }
}
</script>

<style>

.sp-right-side-widgets6 {
  max-width: 230px;
  position: fixed;
  right: 15px;
  top: 20px;
  width: 20%;
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
  border: 2px solid #fff;
  border-radius: 50%;
  color: #fff;
  height: 20px;
  font-size: 14px;
  left: 0;
  line-height: 20px;
  position: absolute;
  text-align: center;
  top: 0;
  width: 20px;
  z-index: 1;
}

#sp-widget6__button-person-image {
  background-color: transparent;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  box-shadow: 0px 8px 8px rgba(35, 31, 32, 0.3);
  height: 90px;
  margin: 0 auto;
  left: 0;
  position: absolute;
  right: 0;
  width: 90px;
}

#sp-widget6__button i {
  display: none;
  font-size: 3em;
  height: 100%;
  left: 0;
  line-height: 90px;
  position: absolute;
  text-align: center;
  top: 0;
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
</style>
