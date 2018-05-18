package com.slidepiper.controller.viewer.customerlogin;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Calendar;
import java.util.Objects;
import java.util.UUID;

@Controller
public class CustomerController {

    private static final String LOGIN_CUSTOMER_PAGE = "logincustomer";
    private static final String VERIFY_CODE_PAGE = "verifyotp";
    private static final String ACCESS_DENIED_PAGE = "accessdenied";

    private final Log logger = LogFactory.getLog(getClass());
    private final String templatesPrefix;

    public CustomerController(@Value("${slidepiper.templates.prefix}") String templatesPrefix) {
        this.templatesPrefix = templatesPrefix;
    }

    @GetMapping("/view/login")
    public String loginCustomer(HttpServletRequest request, HttpServletResponse response,
                                Model model, @RequestParam(value = "error", required = false) String error) {
        String sessionId = UUID.randomUUID().toString();

        SavedRequest savedRequest = new HttpSessionRequestCache().getRequest(request, response);
        String initialChannelFriendlyId = null;
        if (savedRequest == null || savedRequest.getParameterMap().get("f") == null) {
            return "redirect:/accessdenied";
        }

        initialChannelFriendlyId = savedRequest.getParameterMap().get("f")[0];

        model.addAttribute("fileHash", initialChannelFriendlyId);
        if (Objects.nonNull(error)) {
            model.addAttribute("error", new Object() {String errorMessage = "Bad username or password";});
        } else {
            model.addAttribute("error", false);
        }

        return String.join("/",templatesPrefix, LOGIN_CUSTOMER_PAGE);
    }

    @GetMapping("/view/verifycode")
    public String verifyOTP(HttpServletRequest request,
                            Model model) {
        model.addAttribute("initialChannelFriendlyId", request.getSession().getAttribute("initialChannelFriendlyId"));

        return String.join("/",templatesPrefix, VERIFY_CODE_PAGE);
    }

    @GetMapping("/accessdenied")
    public String accessDenied(HttpServletRequest request) {

        return String.join("/",templatesPrefix, ACCESS_DENIED_PAGE);
    }
}