    $(document).ready(function () {
      
      var zoomScaleStart = 0;
      var zoomScaleEnd = 0;
      
      var lastZoomscale = 0;
      var isMobile = false;
      
      var customScaleOption = $("#customScaleOption");
      var scaleSelect = $("#scaleSelect");
      
      
      if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        $('#viewerContainer').css('overflow', 'scroll')
        $("#viewer").panzoom({
          disablePan: true,
          onZoom: function(elem, panzoom){
            $("#viewerContainer").css('height', window.originalSize + 'px');
            lastZoomscale = panzoom.scale;

           },
          onStart : function(elem, panzoom) {
            zoomScaleStart = panzoom.scale;
          },
          onEnd: function(elem, panzoom) {
            
            zoomScaleEnd = panzoom.scale;

            
            if(zoomScaleEnd > zoomScaleStart) {
               window.PDFViewerApplication.zoomIn(lastZoomscale);
               return;
            }
            
            if(zoomScaleStart > zoomScaleEnd) {
               window.PDFViewerApplication.zoomOut(lastZoomscale);
               return;
            }
          }
        });



      } else {
         $("#viewer").panzoom({
           disablePan: true
         });
                // $('#viewerContainer').css('overflow-x', 'scroll');
                 $('#viewerContainer').css('overflow-y', 'scroll');
                 console.log(88)
      }



    });
    
      document.addEventListener("pagesloaded", function(e) {
      window.originalSize = $("#viewerContainer").height()

      });
      
      
      function changeScroll() {
        console.log('here')
        var top_offset = $('#viewer').offset().top;
        if(top_offset > 30) {
          console.log('return')
          $("#viewer").offset({ top: 30});
          return;
        }
        var number = Math.floor( Math.abs( Math.floor( $('#viewer').offset().top ) )  /  ( parseInt($('.page').css('width').replace(/px/, '')) + 9 ) ) - 1;
        
        if(number > 14) {
          console.log('+++14')
          $("#viewer").offset({ top: 0})
        }
        PDFViewerApplication.page = number;
        
      }
      var lastOffset;

      