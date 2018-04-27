<template>
<div class="widget-7">
  <button
    class="widget sp-widget-button sp-widget-font-fmaily sp--direction-ltr sp-widget7--beat"
    id="sp-widget7"
    style="background-color: rgb(27, 24, 98); color: rgb(255, 255, 255);"
    @click="showLink"
  >
    <i :class="widget.formButtonIcon" />
    <div>
      <p>{{ widget.formButtonTextLine1 }}</p>
      <p>{{ widget.formButtonTextLine2 }}</p>
    </div>
  </button>
  </div>
</template>

<script>
export default {
props: ["widget"],
  methods: {
    showLink(){
      window.open(this.widget.formUrl);
    }
  }
}
</script>

<style>
.widget-7 {
  position: fixed;
  right: 0px;
  z-index: 2;
}

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

.sp-widget-button i {
  display: inline-block;
  font-size: 1.5em;
  vertical-align: middle;
  padding-left: 10px;
}

.sp-widget7__toolbar-button-container--visibility {
  visibility: hidden;
}



.sp-widget7--beat {
  -webkit-animation-duration: 1.5s;
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-name: form-pulse;
  -webkit-animation-play-state: running;
  -webkit-animation-timing-function: ease-in-out;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-name: form-pulse;
  animation-play-state: running;
  animation-timing-function: ease-in-out;
  -o-transition: background 200ms ease-in-out, box-shadow 200ms ease-in-out, transform 1000ms ease-in-out;
  -webkit-transition: background 200ms ease-in-out, box-shadow 200ms ease-in-out, transform 1000ms ease-in-out;
  transition: background 200ms ease-in-out, box-shadow 200ms ease-in-out, transform 1000ms ease-in-out;
}

@-webkit-keyframes form-pulse {
  from {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1); }
  60% {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1); }
  70% {
  	-webkit-transform: scale3d(1.05, 1.05, 1.05);
    transform: scale3d(1.05, 1.05, 1.05); }
  85% {
    -webkit-transform: scale3d(1.1, 1.1, 1.1);
    transform: scale3d(1.1, 1.1, 1.1); }
  95% {
  	-webkit-transform: scale3d(1.05, 1.05, 1.05);
    transform: scale3d(1.05, 1.05, 1.05); }
  to {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }
}

@keyframes form-pulse {
  from {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1); }
  60% {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1); }
  70% {
  	-webkit-transform: scale3d(1.05, 1.05, 1.05);
    transform: scale3d(1.05, 1.05, 1.05); }
  85% {
    -webkit-transform: scale3d(1.1, 1.1, 1.1);
    transform: scale3d(1.1, 1.1, 1.1); }
  95% {
  	-webkit-transform: scale3d(1.05, 1.05, 1.05);
    transform: scale3d(1.05, 1.05, 1.05); }
  to {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }
}



#sp-widget7__toolbar-button-container {
  align-items: center;
  background-color: rgba(70, 70, 70, 0.5);
  display: flex;
  height: 49px;
  justify-content: center;
  position: fixed;
  top: 49px;
  width: 100%;
}

#sp-widget7__toolbar-button {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-height: 25px;
  padding: 4px 14px;
}

#sp-widget7__toolbar-button p {
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
}

#sp-widget7-form {
  height: 500px;
}

@media only screen and (max-width: 850px) {
  .sp-widget7--hidden {
    display: none;
  }

  .sp-widget7__toolbar-button-container--visibility {
    visibility: visible;
  }

  #sp-widget7__toolbar-button i {
    display: none;
  }
}

@media only screen and (max-height: 900px) {
  #sp-widget7-form {
    height: 450px;
  }
}

@media only screen and (max-height: 800px) {
  #sp-widget7-form {
    height: 400px;
  }
}

@media only screen and (max-height: 700px) {
  #sp-widget7-form {
    height: 350px;
  }
}
</style>
