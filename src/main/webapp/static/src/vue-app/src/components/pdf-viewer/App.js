import Pdf from './pdf/pdf.vue';
import HorizontalHopper from '../horizontal-hopper/HorizontalHopper.vue';
import Spinner from '../spinner/Spinner.vue';
import Questions from '../questions/Questions.vue';
import Video from '../videoWidget/Video.vue';
import TestimonialsWidget from '../testimonialsWidget/TestimonialsWidget.vue';
import LinkAndTask from '../linkWidget/LinkAndTask.vue';
import FormWidget from '../formWidget/FormWidget.vue';
import $ from 'jquery';

export default {
  name: 'app',
  data () {
    return {
      sp:window.SP,
      src: window.SP.DOCUMENT_URL,
      pageHeight: null,
      widget: null,
      load: false,
      widgetData: [],
      page: 1,
    }
  },
  created() {
    fetch(`${this.sp.API_URL}/viewer/widgets?fileLinkHash=${window.location.search.slice(3)}`)
      .then(response => response.json())
      .then(data => {
        this.widgetData = data.map((widget)=>{
          return JSON.parse(widget.widgetData).data;
        });
      });
  },
  directives: {
    detectHeight:{
      inserted: function (el, b, c) {
        //console.log($("canvas").scrollHeight);
      }
    }

  },
  mounted() {
  },
  methods: {
    onLoaded(){
      this.load = true;
    },
    setPage({page}){
      this.page = page;
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
  }
}
