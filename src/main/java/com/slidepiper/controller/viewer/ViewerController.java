package com.slidepiper.controller.viewer;

import com.slidepiper.model.entity.Channel;
import com.slidepiper.service.viewer.ViewerDocumentService;
import com.slidepiper.service.viewer.ViewerService;
import com.slidepiper.service.viewer.widget.ViewerShareWidgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private static final String PORTAL_MODE_PAGE = "viewer";
    private static final String PROCESS_MODE_PAGE = "process";

    private final String apiUrl;
    private final String templatesPrefix;
    private final ViewerDocumentService viewerDocumentService;
    private final ViewerService viewerService;
    private final ViewerShareWidgetService viewerShareWidgetService;

    @Autowired
    public ViewerController(@Value("${slidepiper.apiUrl}") String apiUrl,
                            @Value("${slidepiper.templates.prefix}") String templatesPrefix,
                            ViewerDocumentService viewerDocumentService,
                            ViewerService viewerService,
                            ViewerShareWidgetService viewerShareWidgetService) {
        this.apiUrl = apiUrl;
        this.templatesPrefix = templatesPrefix;
        this.viewerDocumentService = viewerDocumentService;
        this.viewerService = viewerService;
        this.viewerShareWidgetService = viewerShareWidgetService;
    }

    @GetMapping("/view")
    public String viewer(HttpServletRequest request,
                         @RequestParam(name = "f") String initialChannelFriendlyId,
                         Model model) {

            String sessionId = UUID.randomUUID().toString();

            if (request.getSession().getId() != null) {
                sessionId = request.getSession().getId();
            } else {
                sessionId = UUID.randomUUID().toString();
            }

            Channel channel = viewerService.findChannel(initialChannelFriendlyId, request);
            String view = viewerService.getView(channel, initialChannelFriendlyId, request, sessionId);

            if (view.equals(PORTAL_MODE_PAGE)) {
                view = String.join("/", templatesPrefix, PORTAL_MODE_PAGE);

                model.addAttribute("apiUrl", apiUrl);
                model.addAttribute("sessionId", sessionId);
                model.addAttribute("documentUrl", viewerDocumentService.getUrl(channel.getDocument(), request));
                model.addAttribute("shareWidgetData", viewerShareWidgetService.getShareWidgetData(request, channel.getFriendlyId()));
            }

            if (view.equals(PROCESS_MODE_PAGE)) {
                view = String.join("/", templatesPrefix, PROCESS_MODE_PAGE);

                model.addAttribute("apiUrl", apiUrl);
                model.addAttribute("sessionId", sessionId);
                model.addAttribute("documentUrl", viewerDocumentService.getUrl(channel.getDocument(), request));
                model.addAttribute("shareWidgetData", viewerShareWidgetService.getShareWidgetData(request, channel.getFriendlyId()));
            }

            return view;
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public String handleMissingParams(MissingServletRequestParameterException e) {
        return "redirect:/";
    }
}