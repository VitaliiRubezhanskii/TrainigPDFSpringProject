package com.slidepiper.controller.dashboard;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import java.security.Principal;
import java.util.Calendar;

@Controller
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardController {
    private final String url;
    private final String templatesPrefix;

    @Autowired
    public DashboardController(@Value("${slidepiper.url}") String url,
                               @Value("${slidepiper.templates.prefix}") String templatesPrefix) {
        this.url = url;
        this.templatesPrefix = templatesPrefix;
    }

    @GetMapping("/dashboard")
    public String dashboard(Principal principal, Model model, HttpServletResponse response) {
        model.addAttribute("viewerUrlWithoutFileLink", url + "/view?f=");
        model.addAttribute("currentYear", Calendar.getInstance().get(Calendar.YEAR));

        // TODO: Remove next release.
        Cookie SalesmanEmailCookie = new Cookie("SalesmanEmail", null);
        SalesmanEmailCookie.setHttpOnly(true);
        SalesmanEmailCookie.setMaxAge(0);
        response.addCookie(SalesmanEmailCookie);
        Cookie SalesmanEmailBase64Cookie = new Cookie("SalesmanEmailBase64", null);
        SalesmanEmailBase64Cookie.setHttpOnly(true);
        SalesmanEmailBase64Cookie.setMaxAge(0);
        response.addCookie(SalesmanEmailBase64Cookie);

        return String.join("/", templatesPrefix, "dashboard");
    }
}