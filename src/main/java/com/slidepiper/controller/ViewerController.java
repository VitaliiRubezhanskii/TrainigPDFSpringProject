package com.slidepiper.controller;

import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.widget.ShareData;
import com.slidepiper.service.DocumentService;
import com.slidepiper.service.ShareDataService;
import com.slidepiper.service.ViewerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import slidepiper.db.DbLayer;

import javax.servlet.http.HttpServletRequest;

@Controller
public class ViewerController {
    @Value("${slidepiper.apiUrl}") private String apiUrl;
    @Value("${slidepiper.templates.prefix}") private String templatesPrefix;

    private final DocumentService documentService;
    private final ViewerService viewerService;
    private final ShareDataService shareDataService;

    @Autowired
    public ViewerController(ViewerService viewerService,
                            ShareDataService shareDataService,
                            DocumentService documentService) {

        this.documentService = documentService;
        this.viewerService = viewerService;
        this.shareDataService = shareDataService;
    }

    @GetMapping("/view")
    public String viewer(HttpServletRequest request,
                          @RequestParam(name="f") String channelFriendlyId,
                          Model model) {

        Document document = viewerService.getDocument(request, channelFriendlyId);
        String view = viewerService.getView(request, document, channelFriendlyId);

        if (view.equals("viewer")) {
            view = String.join("/",templatesPrefix , "viewer", "viewer");
            model.addAttribute("document",
                    new Object() {
                        String url = documentService.getUrl(document, request);
                        String versionId = document.getVersionId();
                    }
            );
            model.addAttribute("apiUrl", apiUrl);

            long documentId = DbLayer.getFileIdFromFileLinkHash(channelFriendlyId);
            ShareData shareData = shareDataService.getShareData(documentId, request, channelFriendlyId);
            model.addAttribute("shareData", shareData);
        }

        return view;
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public String handleMissingParams(MissingServletRequestParameterException e) {
        return "redirect:/";
    }
}
