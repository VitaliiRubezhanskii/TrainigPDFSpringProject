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
      this.pageHeight = document.getElementsByTagName('canvas')[0].scrollHeight;
    },
    setPage({page}){
      this.page = page;
    }
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
  }
}
