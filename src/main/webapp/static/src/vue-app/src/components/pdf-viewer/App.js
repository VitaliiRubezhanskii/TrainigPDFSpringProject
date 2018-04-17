import Pdf from './pdf/pdf.vue';
//import horizontalHopper from '../horizontal-hopper';

//var loadingTask = pdf.createLoadingTask(window.SP.DOCUMENT_URL);

export default {
  name: 'app',
  data () {
    return {
      sp:window.SP,
      src: window.SP.DOCUMENT_URL,//loadingTask,
      numPages: undefined,
      pageHeight: null,
      widget: null,
    }
  },
  created() {
    fetch(`${this.sp.API_URL}/viewer/widgets?fileLinkHash=${window.location.search.slice(3)}`)
      .then(response => response.json())
      .then(data => this.widget = data);
    // console.log(this.widget);
  },
  mounted() {
  },
  methods: {
    handleLoad(){
      this.pageHeight = document.getElementsByClassName('page')[0].offsetHeight;
    },
    goToPage() {
      this.$refs.pdf.scrollTop = 2*this.pageHeight;
    }
  },
  components: {
    Pdf,
    //'horizontal-hopper': horizontalHopper,
  }
}
