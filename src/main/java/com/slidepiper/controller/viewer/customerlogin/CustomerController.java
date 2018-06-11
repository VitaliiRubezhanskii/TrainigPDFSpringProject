package com.slidepiper.controller.viewer.customerlogin;

import com.slidepiper.model.entity.Channel;
import com.slidepiper.repository.ChannelRepository;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private ChannelRepository channelRepository;

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

        Channel channel=channelRepository.findByFriendlyId("x2z35n");

        initialChannelFriendlyId = savedRequest.getParameterMap().get("f")[0];

        model.addAttribute("fileHash", initialChannelFriendlyId);
        model.addAttribute("mail",channel.getSalesManEmail());
        System.out.println(channel.getSalesManEmail());
        if (Objects.nonNull(error)) {
            model.addAttribute("error", new Object() {String errorMessage = "Bad username or password";});
        } else {
            model.addAttribute("error", false);
        }

        return "logincustomer";//String.join("/",templatesPrefix, LOGIN_CUSTOMER_PAGE);
    }

    @GetMapping("/view/verifycode")
    public String verifyOTP(HttpServletRequest request,
                            Model model) {
        model.addAttribute("initialChannelFriendlyId", request.getSession().getAttribute("initialChannelFriendlyId"));

        return String.join("/",templatesPrefix, VERIFY_CODE_PAGE);
    }

    @GetMapping("/accessdenied")
    public String accessDenied(HttpServletRequest request,Model model) {
        Channel channel=channelRepository.findByFriendlyId("x2z35n");
        model.addAttribute("mail",channel.getSalesManEmail());
        System.out.println(channel.getSalesManEmail());
        return "accessdenied"; //String.join("/",templatesPrefix, ACCESS_DENIED_PAGE);
    }
}