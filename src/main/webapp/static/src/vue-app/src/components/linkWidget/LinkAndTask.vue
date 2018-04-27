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
export default{
  props:  ["widget"],
   methods: {
    showLink(){
      window.open(this.widget.link);
    }
  }
}
</script>

<style>
.sp-widget-button9{
  border-radius: 50px !important;
}
.completed{
  opacity: 0.5;
}
</style>
