<template >
  <div id="sp-loading" class="sp-loading">
    <div class="sp-spinner sp--direction-ltr sp--margin-bottom-15px">
      <div class="sp-bounce1 sp--background-color-sp-purple"></div>
      <div class="sp-bounce2 sp--background-color-sp-purple"></div>
      <div class="sp-bounce3 sp--background-color-sp-purple"></div>
    </div>
    <div class="sp--color-sp-purple sp--direction-ltr sp--font-size-1em sp--font-weight-bold sp--margin-bottom-45px">Loading the show...</div>
    <img src="/static/src/viewer/images/logo-150x35.png">
  </div>
</template>

<style>
.sp--background-color-sp-purple {
  background-color: #1b1862;
}

.sp--font-weight-bold {
  font-weight: bold;
}

.sp--color-sp-purple {
  color: #1b1862;
}

.sp--direction-ltr {
  direction: ltr;
}

.sp--font-family-sans-serif {
  font-family: sans-serif;
}

.sp--font-size-1em {
  font-size: 1em;
}

.sp--visibility-hidden {
  visibility: hidden !important;
}

.sp--margin-bottom-15px {
  margin-bottom: 15px;
}

.sp--margin-bottom-45px {
  margin-bottom: 45px;
}

.sp-loading {
  align-items: center;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 10;
}

.sp-spinner > div {
  animation: spinner-bounce-delay 1.4s infinite ease-in-out both;
  -webkit-animation: spinner-bounce-delay 1.4s infinite ease-in-out both;
  border-radius: 100%;
  display: inline-block;
  height: 15px;
  width: 15px;
}

.sp-spinner .sp-bounce1 {
  animation-delay: -0.32s;
  -webkit-animation-delay: -0.32s;
}

.sp-spinner .sp-bounce2 {
  animation-delay: -0.16s;
  -webkit-animation-delay: -0.16s;
}

@-webkit-keyframes spinner-bounce-delay {
  0%, 80%, 100% {
    -webkit-transform: scale(0)
  }
  40% {
    -webkit-transform: scale(1.0);
  }
}

@keyframes spinner-bounce-delay {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
 }
</style>
