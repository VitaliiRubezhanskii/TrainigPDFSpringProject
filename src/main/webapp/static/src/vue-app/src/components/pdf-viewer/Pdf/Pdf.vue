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
      'loaded'
    ],
    directives: {
      pdfRender: {
        inserted: function (el, b, c) {
          let renderPDF = (url, el, opt) => {
            let options = opt || { scale: 2  };
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
                /*function renderPage(page) {
                        var viewport = page.getViewport(options.scale);
                        var $canvas = jQuery("<canvas></canvas>");

                        //Set the canvas height and width to the height and width of the viewport
                        var canvas = $canvas.get(0);
                        var context = canvas.getContext("2d");
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        //Append the canvas to the pdf container div
                        var $pdfContainer = jQuery("#pdfContainer");
                        $pdfContainer.css("height", canvas.height + "px").css("width", canvas.width + "px");
                        $pdfContainer.append($canvas);

                        //The following few lines of code set up scaling on the context if we are on a HiDPI display
                        var outputScale = getOutputScale();
                        if (outputScale.scaled) {
                            var cssScale = 'scale(' + (1 / outputScale.sx) + ', ' +
                                (1 / outputScale.sy) + ')';
                            CustomStyle.setProp('transform', canvas, cssScale);
                            CustomStyle.setProp('transformOrigin', canvas, '0% 0%');

                            if ($textLayerDiv.get(0)) {
                                CustomStyle.setProp('transform', $textLayerDiv.get(0), cssScale);
                                CustomStyle.setProp('transformOrigin', $textLayerDiv.get(0), '0% 0%');
                            }
                        }

                        context._scaleX = outputScale.sx;
                        context._scaleY = outputScale.sy;
                        if (outputScale.scaled) {
                            context.scale(outputScale.sx, outputScale.sy);
                        }

                        var canvasOffset = $canvas.offset();
                        var $textLayerDiv = jQuery("<div />")
                            .addClass("textLayer")
                            .css("height", viewport.height + "px")
                            .css("width", viewport.width + "px")
                            .offset({
                                top: canvasOffset.top,
                                left: canvasOffset.left
                            });

                        $pdfContainer.append($textLayerDiv);

                        page.getTextContent().then(function (textContent) {
                            var textLayer = new TextLayerBuilder($textLayerDiv.get(0), 0); //The second zero is an index identifying
                            //the page. It is set to page.number - 1.
                            textLayer.setTextContent(textContent);

                            var renderContext = {
                                canvasContext: ctx,
                                viewport: viewport,
                                textLayer: textLayer
                            };

                            page.render(renderContext);
                        });
                    }*/
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
