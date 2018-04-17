import pdf from 'vue-pdf';
//import horizontalHopper from '../horizontal-hopper';

var loadingTask = pdf.createLoadingTask(window.SP.DOCUMENT_URL);

export default {
  name: 'app',
  data () {
    return {
      sp:window.SP,
      src: loadingTask,
      numPages: undefined,
      pageHeight: null,
      widget: null,
    }
  },
  created() {
    fetch(`${this.sp.API_URL}/viewer/widgets`)
      .then(response => response.json())
      .then(data => this.widget = data);
    //console.log(this.sp.API_URL);
  },
  mounted() {
    this.src.then(pdf => {
      this.numPages = pdf.numPages;
  });
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
    pdf,
    //'horizontal-hopper': horizontalHopper,
  }
}
