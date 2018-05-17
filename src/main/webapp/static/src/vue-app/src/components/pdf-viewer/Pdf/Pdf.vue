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

                    var t = {};
                    t.height = window.innerHeight - 225;
                    t.width = window.innerWidth;
                    t.canvasHeight = canvas.scrollHeight;
                    t.canvasWidth = canvas.scrollWidth;
                    if(t.height/t.width > t.canvasHeight/t.canvasWidth) {
                      canvas.style.height = t.height;
                      canvas.style.maxWidth = '100%';
                    } else {
                      canvas.style.height = `${t.height}px`;
                      canvas.style.width = 'auto';
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
}
</script>
