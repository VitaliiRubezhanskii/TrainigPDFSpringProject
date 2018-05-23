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
      'resize'
    ],
    data() {
      return {
        height: null,
        width: null,
        canvasWidth: null,
        canvasHeight: null,
      }
    },
    directives: {
      pdfRender: {
        inserted: function (el, b, c) {
          let renderPDF = (url, el, opt) => {
            let options = opt || { scale: 2, zoom: 100 };
            let promiseArray = [];
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
                    canvas.setAttribute('style', 'display:block; margin:0 auto');
                    el.appendChild(canvas);
                    page.render(renderContext);

                    c.context.resizePdf(canvas);

                    window.onresize = () => {
                      let canv = Array.from($('canvas'));
                      canv.forEach((canvas) => {
                        c.context.resize();
                        c.context.resizePdf(canvas);
                      })
                    }
                }
                function renderPages(pdfDoc) {
                    for(var num = 1; num <= pdfDoc.numPages; num++) {
                        promiseArray.push( pdfDoc.getPage(num).then(renderPage) )
                    }
                    Promise.all(promiseArray).then(() => {
                      c.context.loaded();

                    });
                }

                PDFJS.disableWorker = true;
                PDFJS.getDocument(url).then(renderPages).catch(console.log);
          };
          renderPDF(c.context.src, el);
        }
      }
    },
    methods: {
      resizePdf(canvas){
          let size = {};
          size.height = window.innerHeight - 225;
          size.width = window.innerWidth;
          size.canvasHeight = canvas.scrollHeight;
          size.canvasWidth = canvas.scrollWidth;
            if(size.height/size.width > size.canvHeight/size.canvWidth) {
              canvas.style.height = size.height;
              canvas.style.maxWidth = '100%';
            } else {
              canvas.style.height = `${size.height}px`;
              canvas.style.width = 'auto';
            }
      }
    }
}
</script>
