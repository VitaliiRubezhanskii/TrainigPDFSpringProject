<template>
    <div id="holder" v-pdfRender></div>
</template>

<script>

import PDFJS from 'pdfjs-dist';
import $ from "jquery";

export default {
    props: [
      'src',
      'page',
      'loaded',
    ],
    directives: {
      pdfRender: {
        inserted: function (el, b, c) {
          let renderPDF = (url, el, opt) => {
            let options = opt || { scale: 1.49  };
            var promiseArray = [];
                function renderPage(page) {
                    let viewport = page.getViewport(options.scale);
                    let canvas = document.createElement('canvas');
                    let ctx = canvas.getContext('2d');
                    let renderContext = {
                      canvasContext: ctx,
                      viewport: viewport
                    };

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    canvas.setAttribute('id', page.pageNumber);
                    el.appendChild(canvas);

                   page.render(renderContext);
                }
                function renderPages(pdfDoc) {
                    for(var num = 1; num <= pdfDoc.numPages; num++) {
                        promiseArray.push( pdfDoc.getPage(num).then(renderPage) )
                    }
                    Promise.all(promiseArray).then(() => {
                      //document.getElementById(c.context.page).scrollIntoView();
                      c.context.loaded();
                    });
                }

                PDFJS.disableWorker = true;
                PDFJS.getDocument(url).then(renderPages);
          };
          renderPDF(c.context.src, el);
        }
      }
    },
    data() {
        return {}
    },
    mounted() {

    },
    methods: {
    }
}

</script>
