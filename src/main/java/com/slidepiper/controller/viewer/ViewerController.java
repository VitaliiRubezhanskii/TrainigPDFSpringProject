package com.slidepiper.controller.viewer;

import com.slidepiper.model.entity.Channel;
import com.slidepiper.model.entity.widget.ShareWidget.ShareWidgetData;
import com.slidepiper.service.DocumentService;
import com.slidepiper.service.viewer.ViewerService;
import com.slidepiper.service.widget.ShareWidgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import java.util.UUID;

@Controller
public class ViewerController {
    @Value("${slidepiper.apiUrl}") private String apiUrl;
    @Value("${slidepiper.templates.prefix}") private String templatesPrefix;

    private final DocumentService documentService;
    private final ShareWidgetService shareWidgetService;
    private final ViewerService viewerService;

    @Autowired
    public ViewerController(DocumentService documentService,
                            ShareWidgetService shareWidgetService,
                            ViewerService viewerService) {
        this.documentService = documentService;
        this.shareWidgetService = shareWidgetService;
        this.viewerService = viewerService;
    }

    @GetMapping("/view")
    public String viewer(HttpServletRequest request,
                         @RequestParam(name="f") String initialChannelFriendlyId,
                         Model model) {

        Channel channel = viewerService.findChannel(initialChannelFriendlyId, request);

        String sessionId = UUID.randomUUID().toString();
        String view = viewerService.getView(channel, initialChannelFriendlyId, request, sessionId);

        if (view.equals("viewer")) {
            view = String.join("/",templatesPrefix , "viewer");

            model.addAttribute("documentUrl", documentService.getUrl(channel.getDocument(), request));
            model.addAttribute("apiUrl", apiUrl);
            model.addAttribute("sessionId", sessionId);

            ShareWidgetData shareWidgetData = shareWidgetService.getShareWidgetData(request, channel.getFriendlyId());
            model.addAttribute("shareWidgetData", shareWidgetData);
        }

        return view;
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public String handleMissingParams(MissingServletRequestParameterException e) {
        return "redirect:/";
    }
}
