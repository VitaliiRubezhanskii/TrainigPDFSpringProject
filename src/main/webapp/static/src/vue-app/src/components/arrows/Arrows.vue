<template>
  <div class="arrow-container">
    <button
      type="button"
      class="arrow-r"
      @click="goNextPage"
    />
    <button
      type="button"
      class="arrow-l"
      @click="goPrevPage"
    />
  </div>
</template>

<script>
import { animateScroll } from '../../helper/functions.js';

export default{
  props: ['page'],
  methods: {
    goNextPage(){
      this.$emit("next-page",{ page: Number(this.page) });
      animateScroll();
      },
    goPrevPage(){
      this.$emit("prev-page",{ page: Number(this.page) });
      animateScroll();
    }
  }
}
</script>

<style scoped>
.arrow-container{
  position: relative;
  bottom: 44px;
}

button.arrow-r,
button.arrow-l {
  position: absolute;
	width: 14px;
	height: 23px;
	cursor: pointer;
	outline: none;
  margin: 0;
  padding: 0;
}

.arrow-r{
  right: 15px;
	background: url("../../assets/arrow-r.png") no-repeat;
}

.arrow-l{
  left: 15px;
	background: url("../../assets/arrow-l.png") no-repeat;
}
</style>
