<template>
  <div class="modal inmodal in" id="sp-modal-upload-files" tabindex="-1" role="dialog" aria-hidden="true" style="padding-right: 17px;">
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
              <div class="container-fluid">
                  <div class="row">
                      <div class="form-group">
                           <form id="sp-file__upload-form">
                              <input
                                class="file__input"
                                name="upload-file"
                                multiple=""
                                type="file"
                                accept=".pdf"
                                @change="handleInput"
                              >
                            </form>
                      </div>
                  </div>
              </div>
              <div
                class="sk-spinner sk-spinner-wave disabled">
                  <div class="sk-rect1"></div>
                  <div class="sk-rect2"></div>
                  <div class="sk-rect3"></div>
                  <div class="sk-rect4"></div>
                  <div class="sk-rect5"></div>
              </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-white"
              data-dismiss="modal">
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
import { uploadDoc } from '../../helper/functions.js';

export default{
  data() {
    return {
      isDisabled: true,
      files: null,
      sp: window.SP,
      location: window.location.search.slice(3),
      filesName: [],
      spinnerDisabled: 'disabled',
    }
  },
  methods: {
    handleInput(){
      //console.log(event.target.files);
      //this.fileName.push(event.target.files['0'].name);
      //console.log(event.target.files['0']);
      //this.fileName.push(event.target.files['0'].name);
      this.files = event.target.files;
      event.target.files? this.isDisabled = null : this.isDisabled = 'true';
      console.log(this.files[0].name);
    },
    uploadDocument() {
      const body = new FormData();
      body.append('file', this.files[0]);
      body.append('initialChannelFriendlyId', this.location);
      fetch(`${this.sp.API_URL}/viewer/customerdocuments`, {
        dataType: 'json',
        method: 'POST',
        body,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        beforeSend: (xhr) =>  xhr.setRequestHeader('{{{_csrf.headerName}}}', '{{{_csrf.token}}}'),
      })
      //.then(data => );
    }
  }
}
</script>

<style>
.disabled {
  display: none;
}
</style>
