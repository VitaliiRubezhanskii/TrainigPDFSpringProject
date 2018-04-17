<template >
<div id="sp-widget5__horizontal-hopper-container">
</div>
</template>

<script>
import $ from "jquery";

export default{
  directives: {
  $('#sp-widget5__horizontal-hopper-container').append(
       '<div class="sp-widget5__horizontal-hop sp-widget5__horizontal-hop-extended" id="' + '" data-page-horizontal-hop="' + sp.escapeHtml(value.hopperPage) + '">' +
       '<p class="sp-widget5__horizontal-hop-text sp-widget5__horizontal-hop--visible">' + sp.escapeHtml(value.hopperText) + '</p>' +
       '<p class="sp-widget5__horizontal-hop-page sp-widget5__horizontal-hop--hidden">' + sp.escapeHtml(value.hopperPage) + '</p>' +
       '</div>'
   );
  }
}
</script>

<style>
.sp-widget5-horizontal-hopper {
  display: flex;
  justify-content: center;
  width: 100%;
  position: fixed;
  top: 51px;
}

#sp-widget5__hopper-container {
  height: 65vh;
  overflow-y: auto;
  direction: rtl;
}

#sp-widget5__horizontal-hopper-container {
  height: 40px;
  width: 80%;
  display: flex;
  padding-bottom: 18px;
    overflow: hidden;
}
.sp-widget5__horizontal-hop::after,
.sp-widget5__horizontal-hop::before {
  content: "";
  display: block;
  width: 0px;
  height: 0px;

  position: absolute;
  top: 0;
  left: 0;

  border: solid transparent;
  border-left-color: #ffffff;
  border-width: 20px;
}
</style>

