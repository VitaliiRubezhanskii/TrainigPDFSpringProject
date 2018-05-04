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
      'pageHeight',
      'height',
      'width',
      'pageWidth'
    ],
    directives: {
      pdfRender: {
        inserted: function (el, b, c) {
          let renderPDF = (url, el, opt) => {
            let options = opt || { scale: 2, zoom: 100 };
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
                    // width: auto;
                    // height: calc(100vh - 250px);
                    // if(c.context.height/c.context.width > c.context.pageHeight/c.context.pageWidth) {
                    //   //canvas.css({"width": "100%","height":`${this.height}`});
                    //   canvas.height = `c.context.height`;
                    //   canvas.width = `${100%}`;
                    // }
                    // else {
                    //   //canvas.css({"width": "auto","height":"calc(100vh - 250px)"});
                    //   canvas.height = `${c.context.height - 250}`;
                    //   canvas.width = 'auto';
                    // }
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
    // data() {
    //     return {}
    // },
    // mounted() {
    //
    // },
    // methods: {
    // }
}

</script>
