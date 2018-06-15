import Pdf from './Pdf/Pdf.vue';
import HorizontalHopper from '../horizontal-hopper/HorizontalHopper.vue';
import Spinner from '../spinner/Spinner.vue';
import Questions from '../questions/Questions.vue';
import Video from '../videoWidget/Video.vue';
import TestimonialsWidget from '../testimonialsWidget/TestimonialsWidget.vue';
import LinkAndTask from '../linkWidget/LinkAndTask.vue';
import Toolbar from '../toolbar/Toolbar.vue';
import PoweredBy from '../powered/PoweredBy.vue';
import Arrows from '../arrows/Arrows.vue';
import UploadFiles from '../upload/UploadFiles.vue';
import TableUploadFiles from '../tableForUploading/TableUploadFiles.vue';
import sp from '../../constants/spViewer.js';

export default {
  name: 'app',
  data () {
    return {
      sp:window.SP,
      location: window.location.search.slice(3),
      src: window.SP.DOCUMENT_URL,
      load: false,
      pages: null,
      pageHeight: null,
      widgetData: [],
      page: 1,
      toolbarData: null,
      styleButton: {
        'backgroundColor': null
      },
      colorText: null,
      uploadData: null,
    }
  },
  created() {
    fetch(`${this.sp.API_URL}/viewer/widgets?fileLinkHash=${this.location}`)
      .then(response => response.json())
      .then(data => {
        this.widgetData = data.map((widget)=>{
          return JSON.parse(widget.widgetData).data;
        });
        this.pages = this.widgetData.find(w => w.widgetId === 5).items.length;
      });
    fetch(`${this.sp.API_URL}/viewer/configuration?channelFriendlyId=${this.location}`)
      .then(response => response.json())
      .then(data => {
        this.toolbarData = data;
        this.styleButton = {'backgroundColor': this.toolbarData.toolbarButtonBackground};
        this.colorText = this.toolbarData.toolbarCta2Color;
      });
      const xhr = new XMLHttpRequest();
      xhr.open('GET', "/api/v1/upload-document-widget/j496d2ld");
      xhr.send();
      xhr.onload = (response) => {
        this.uploadData = JSON.parse(response.target.responseText);
      }
    },
  methods: {
    onLoaded(){
      this.load = true;
      this.pageHeight = document.getElementsByTagName('canvas')[0].scrollHeight;
    },
    onResize(){
      this.pageHeight = document.getElementsByTagName('canvas')[0].scrollHeight;
    },
    setPage({ page }){
      this.page = page;
      document.getElementById(this.page).scrollIntoView();
    },
    nextPage({ page }){
      if(page < this.pages){
        this.page = page + 1;
        document.getElementById(this.page).scrollIntoView();
      }
    },
    prevPage({ page }){
      if(page > 1){
        this.page = page - 1;
        document.getElementById(this.page).scrollIntoView();
      }
    },
  },
  computed: {
    linkData() {
      return this.widgetData.find(w => w.widgetId === 9);
    },
    testimonialsData() {
      return this.widgetData.find(w => w.widgetId === 6);
    },
    videoData() {
      return this.widgetData.find(w => w.widgetId === 1);
    },
    questionData() {
      return this.widgetData.find(w => w.widgetId === 3);
    },
    horizontalHoperData() {
      return this.widgetData.find(w => w.widgetId === 5);
    },
  },
  components: {
    Pdf,
    HorizontalHopper,
    Spinner,
    Questions,
    Video,
    TestimonialsWidget,
    LinkAndTask,
    Toolbar,
    PoweredBy,
    Arrows,
    UploadFiles,
    TableUploadFiles,
  }
}
