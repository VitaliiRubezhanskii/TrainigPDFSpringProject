<template>
  <div class="upload-block clearfix">
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
      :showList="showList"
    />
    <div
      v-if="filesName"
      v-for="(item,i) in filesName"
    >
      <p class="files">{{ filesName[i] }}</p>
    </div>
  </div>
</template>

<script>
import ModalUpload from '../modalUpload/ModalUpload.vue';

export default{
  data(){
    return {
      showDisplay: false,
      filesName: [],
    }
  },
  components: {
    ModalUpload
  },
  methods: {
    showModal(){
      this.showDisplay = true;
    },
    showList(data){
      this.filesName.push(data);
    }
  },
}
</script>

<style>
.upload-button {
  background-color: #1c84c6;
  border-color: #1c84c6;
  color: #FFFFFF;
  padding: 6px 12px;
  font-size: 15px;
  font-weight: normal;
  margin: 0;
}
.upload-block{
  padding: 0 0 0 50px;
  /*margin: 0 0 50px 0;*/
  text-align: start;
}
.files{
  padding: 5px 10px;
}
</style>
