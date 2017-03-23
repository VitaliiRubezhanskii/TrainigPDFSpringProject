package com.slidepiper.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {
    @Value("${slidepiper.apiUrl}") private String apiUrl;
    @Value("${slidepiper.templates.prefix}") private String templatesPrefix;

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("apiUrl", apiUrl);
        return String.join("/", templatesPrefix, "dashboard");
    }
}
