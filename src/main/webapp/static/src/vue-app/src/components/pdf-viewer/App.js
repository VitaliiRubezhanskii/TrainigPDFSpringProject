import Pdf from './pdf/pdf.vue';
import HorizontalHopper from '../horizontal-hopper/HorizontalHopper.vue';
import Spinner from '../spinner/Spinner.vue';
import Questions from '../questions/Questions.vue';
import Video from '../videoWidget/Video.vue';
import TestimonialsWidget from '../testimonialsWidget/TestimonialsWidget.vue';
import LinkAndTask from '../linkWidget/LinkAndTask.vue';
import FormWidget from '../formWidget/FormWidget.vue';
import Toolbar from '../toolbar/Toolbar.vue';
import PoweredBy from '../powered/PoweredBy.vue';
import UploadFiles from '../upload/UploadFiles.vue';
import ModalUpload from '../modalUpload/ModalUpload.vue';
import Arrows from '../arrows/Arrows.vue';
import $ from 'jquery';

export default {
  name: 'app',
  data () {
    return {
      sp:window.SP,
      location: window.location.search.slice(3),
      src: window.SP.DOCUMENT_URL,
      pageHeight: null,
      widget: null,
      load: false,
      pages: null,
      height: null,
      width: null,
      pageWidth: null,
      widgetData: [],
      page: 1,
      toolbarData: null,
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
      .then(data => this.toolbarData = data);
  },
  directives: {
    detectHeight:{
      inserted: function (el, b, c) {

      }
    }

  },
  mounted() {
  },
  methods: {
    onLoaded(){
      this.load = true;
      this.height = window.innerHeight - 250;
      this.width = window.innerWidth;
      this.pageHeight = document.getElementsByTagName('canvas')[0].scrollHeight;
      this.pageWidth = document.getElementsByTagName('canvas')[0].scrollWidth;
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
    }
  },
  components: {
    Pdf,
    HorizontalHopper,
    Spinner,
    Questions,
    Video,
    TestimonialsWidget,
    LinkAndTask,
    FormWidget,
    Toolbar,
    PoweredBy,
    UploadFiles,
    ModalUpload,
    Arrows
  }
}
