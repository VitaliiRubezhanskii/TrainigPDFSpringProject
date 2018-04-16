import pdf from 'vue-pdf';

var loadingTask = pdf.createLoadingTask(window.SP.DOCUMENT_URL);

export default {
  name: 'app',
  data () {
    return {
      src: loadingTask,
      numPages: undefined,
      pageHeight: null,
    }
  },
  mounted() {
    this.src.then(pdf => {
      this.numPages = pdf.numPages;
  });
  },
  methods: {
    handleLoad(){
      this.pageHeight = document.getElementsByClassName('page')[0].offsetHeight;
      console.log(this.pageHeight);
    },
    goToPage() {
      this.$refs.pdf.scrollTop = 3*this.pageHeight;
    }
  },
  components: {
    pdf
  }
}
