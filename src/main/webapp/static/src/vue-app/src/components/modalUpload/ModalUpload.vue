<template>
  <div
    class="modal inmodal in"
    id="sp-modal-upload-files"
    tabindex="-1"
    role="dialog"
    aria-hidden="true"
    style="padding-right: 17px;"
  >
  <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">
              <span aria-hidden="true">×</span>
              <span class="sr-only">Close</span>
          </button>
          <i class="fa fa-cloud-upload modal-icon"></i>
          <h4 class="modal-title">Upload Document</h4>
          <small class="font-bold">
          	Click on the Upload File to choose which
          	kind of document to <span class="sp-file--update-upload">upload</span>.
        	<br>
          	Then just hit <span class="sp-file--update-upload">upload</span> document and you are done.
          </small>
        </div>
        <div class="modal-body">
            <div
              v-if="!isUploading"
              class="container-fluid"
            >
              <div class="row">
                <div class="form-group">
                 <form id="sp-file__upload-form">
                    <input
                      class="file__input"
                      name="upload-file"
                      multiple=""
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpeg,.png"
                      @change="handleInput"
                      ref="uploadFiles"
                    >
                  </form>
                </div>
              </div>
            </div>
            <div
              v-if="isUploading"
              class="sk-spinner sk-spinner-wave"
            >
              <div class="sk-rect1"></div>
              <div class="sk-rect2"></div>
              <div class="sk-rect3"></div>
              <div class="sk-rect4"></div>
              <div class="sk-rect5"></div>
            </div>
            <div>
              <span class="fileTypes">File types allowed:</span> pdf, doc, docx, ppt, pptx, exl, exlx jpeg, png, jpg
            </div>
            <div>
              <span class="fileTypes">File size:</span> upto 10mb
            </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-white"
            data-dismiss="modal"
            ref="close"
          >
            Close
          </button>
          <button type="button"
            :disabled="isDisabled"
            data-upload-update="upload"
            class="btn btn-primary sp-file__upload-update-file-button"
            @click="uploadDocument"
          >
            Upload Document
          </button>
        </div>
      </div>
  </div>
</div>
</template>

<script>
import Vue from 'vue';
import { uploadDoc } from '../../helper/functions.js';
import $ from "jquery";

export default{
  props: ['showList'],
  data() {
    return {
      isDisabled: true,
      files: null,
      sp: window.SP,
      location: window.location.search.slice(3),
      uploadedFiles: null,
      isUploading: false,
    }
  },
  methods: {
    handleInput(){
      //this.files = event.target.files;
      this.files = this.$refs.uploadFiles.files
      this.uploadedFiles = this.files['0'].name;
      this.isDisabled = this.files ? false : true;
    },
    uploadDocument() {
      this.isUploading = true;
      const body = new FormData();
      body.append('file', this.files[0]);
      body.append('initialChannelFriendlyId', this.location);
      fetch(`${this.sp.API_URL}/viewer/customer-documents`, {
        method: 'POST',
        body,
        headers: {
          [this.sp.CSRF_HEADER]: JSON.stringify(this.sp.CSRF_TOKEN)
        },
      })
      .then((response)=> {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then(xhr => {
        this.isUploading = false;
        this.$refs.close.click();
        this.showList(this.uploadedFiles);
        Vue.swal("Success!", "Your file was uploaded!", "success");
        this.isDisabled = true;
      })
      .catch(error => {
        this.isUploading = false;
        this.$refs.close.click();
        Vue.swal("Error!", "Your file was not uploaded!", "error");
        this.isDisabled = true;
      });
    },
  }
}
</script>

<style>
.disabled {
  display: none;
}
.fileTypes{
font-weight: bold;
}
</style>
