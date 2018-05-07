<template>
  <div class="sp-toolbar-logo"
    :style="{backgroundColor: toolbarData.toolbarBackground, color: toolbarData.toolbarColor}"
  >
    <a target="_blank" href="https://www.slidepiper.com">
      <img :src="toolbarData.logoImage">
    </a>
    <div class="toolbar-button-container">
      <button
        v-if="toolbarData.isCta1Enabled"
        @click="showLink(toolbarData.toolbarCta1Link)"
        :style="{backgroundColor: toolbarData.toolbarCta1Background, color: toolbarData.toolbarCta1Color}"
      >
        {{ toolbarData.toolbarCta1Text }}
      </button>
      <button
        v-if="toolbarData.isCta2Enabled"
        @click="showLink(toolbarData.toolbarCta2Link)"
        :style="{backgroundColor: toolbarData.toolbarCta2Background, color: toolbarData.toolbarCta2Color}"
      >
        {{ toolbarData.toolbarCta2Text }}
      </button>
      <button
        v-if="toolbarData.isCta3Enabled"
        @click="showLink(toolbarData.toolbarCta3Link)"
        :style="{backgroundColor: toolbarData.toolbarCta3Background, color: toolbarData.toolbarCta3Color}"
      >
        {{ toolbarData.toolbarCta3Text }}
      </button>
    </div>
  </div>

</template>
<script>
export default{
  props: ["toolbarData"],
  methods: {
    showLink(link){
      window.open(link);
    }
  }
}
</script>
<style>
button{
  font-family: Ariel, sans-serif;
  border: none;
  outline: none;
  font-style: normal;
  font-variant: normal;
  font-weight: bold;
  font-stretch: normal;
  margin-right: 10px;
  border-radius: 3px;
  padding: 4px 15px;
  cursor: pointer;

}
.toolbar-button-container{
  position: absolute;
  right:0;
  top: 0;
  transform: translateY(50%);
}
.sp-toolbar-logo{
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  margin-bottom: 4px;
  z-index: 9;
}

.sp-toolbar-logo img {
  border: none;
  height: 47px;
  display: block;
  margin: 0 auto;
}
</style>
