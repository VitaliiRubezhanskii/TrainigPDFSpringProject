package com.slidepiper.controller.viewer.customerlogin;

import com.slidepiper.model.entity.MessageInfo;
import com.slidepiper.repository.ViewerRepository;
import com.slidepiper.service.salesman.MessageInfoService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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
    private MessageInfoService messageInfoService;
    @Autowired
    private ViewerRepository viewerRepository;

    public CustomerController(@Value("${slidepiper.templates.prefix}") String templatesPrefix) {
        this.templatesPrefix = templatesPrefix;
    }

    @GetMapping("/view/login")
    public String loginCustomer(HttpServletRequest request, HttpServletResponse response,
                                Model model,
                                @RequestParam(value = "error", required = false) String error) {
        String sessionId = UUID.randomUUID().toString();



         MessageInfo info=messageInfoService.getSalesManEmailByMessageInfoId("x21kd5");

         boolean enabledMessages=viewerRepository.findChannelByEmail(info.getSalesManEmail()).isViewerSupportMailEnabled();
            model.addAttribute("salesManEmail", "If you are not able to login to" +
                 " this portal please contact "+info.getSalesManEmail());

         if (enabledMessages) {

             model.addAttribute("salesManEmail", "If you are not able to login to" +
                     " this portal please contact "+info.getSalesManEmail());
         }
         else {
             model.addAttribute("salesManEmail"," ");

         }


        System.out.println(info.getSalesManEmail());
        System.out.println(enabledMessages);

        SavedRequest savedRequest = new HttpSessionRequestCache().getRequest(request, response);
        String initialChannelFriendlyId = null;

        if (savedRequest == null || savedRequest.getParameterMap().get("f") == null) {

            return "redirect:/accessdenied";
        }

        initialChannelFriendlyId = savedRequest.getParameterMap().get("f")[0];

        model.addAttribute("fileHash", initialChannelFriendlyId);
        //MessageInfo m=messageInfoService.getSalesManEmailByMessageInfoId("v9xm62");
        //salesManEmail=messageInfoService.getSalesManEmailByMessageInfoId("v9xm62").getSalesManEmail();
        System.out.println(info.getSalesManEmail());
       // model.addAttribute("salesManEmail",salesManEmail);

        if (Objects.nonNull(error)) {
            model.addAttribute("error", new Object() {String errorMessage = "Bad username or password";});
        } else {
            model.addAttribute("error", false);
        }

        return "logincustomer"; //String.join(LOGIN_CUSTOMER_PAGE);
    }

    @GetMapping("/view/verifycode")
    public String verifyOTP(HttpServletRequest request,
                            Model model) {
        model.addAttribute("initialChannelFriendlyId", request.getSession().getAttribute("initialChannelFriendlyId"));

        return String.join("/",templatesPrefix, VERIFY_CODE_PAGE);
    }

   @GetMapping("/accessdenied")
   public String accessDenied(HttpServletRequest request,Model model) {

        MessageInfo info=messageInfoService.getSalesManEmailByMessageInfoId("v9xm62");
        model.addAttribute("salesManEmail",info.getSalesManEmail());
        System.out.println(info.getSalesManEmail());
        return "accessdenied";  // String.join( accessdenied);
    }

//
//    @ModelAttribute("salesManEmail")
//    private MessageInfo salesManEmail(){
//        return messageInfoService.getSalesManEmailByMessageInfoId("v9xm62");
//    }
}