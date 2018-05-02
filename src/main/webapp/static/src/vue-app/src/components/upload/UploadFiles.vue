<template>
  <div class="upload-block">
    <button
      type="button"
      class="upload-button btn btn-success"
      data-toggle="modal"
      data-target="#sp-modal-upload-files"
      @click="showModal"
      >
        Upload Documents
    </button>
    <ModalUpload
      :style="{display: `${showDisplay?'block':'none'}`}"
    />
  </div>

</template>

<script>
import ModalUpload from '../modalUpload/ModalUpload.vue';

export default{
  data(){
    return {
      showDisplay: false,
    }
  },
  components: {
    ModalUpload
  },
  methods: {
    showModal(){
      this.showDisplay = true;
    },
  },
}
</script>

<style>
.upload-button {
  background-color: #1c84c6;
  border-color: #1c84c6;
  color: #FFFFFF;
  padding: 6px 12px;
  font-size: 17px;
  font-weight: normal;
  margin: 0;
  float: left;
}
.upload-block{
  padding: 0 0 0 50px;
}
</style>
