import Pdf from './pdf/pdf.vue';
import HorizontalHopper from '../horizontal-hopper/HorizontalHopper.vue';
import Spinner from '../spinner/Spinner.vue';
import Questions from '../questions/Questions.vue';
import Video from '../videoWidget/Video.vue';
import TestimonialsWidget from '../testimonialsWidget/TestimonialsWidget.vue';

export default {
  name: 'app',
  data () {
    return {
      sp:window.SP,
      src: window.SP.DOCUMENT_URL,
      numPages: undefined,
      pageHeight: null,
      widget: null,
      load: false,
      heightPdf: 1
    }
  },
  created() {
    fetch(`${this.sp.API_URL}/viewer/widgets?fileLinkHash=${window.location.search.slice(3)}`)
      .then(response => response.json())
      .then(data => {
        this.widget = data.map(e => {
          if(JSON.parse(e.widgetData).data.widgetId === 5) {
            return JSON.parse(e.widgetData);
          }
        });
      });
  },
  mounted() {
  },
  methods: {
    onLoaded(){
      this.load = true;
    }
  },
  components: {
    Pdf,
    HorizontalHopper,
    Spinner,
    Questions,
    Video,
    TestimonialsWidget
  }
}
