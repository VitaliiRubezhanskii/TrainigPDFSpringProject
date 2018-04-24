package com.slidepiper.controller.mfa;

import com.slidepiper.model.entity.Customer;
import com.slidepiper.repository.CustomerRepository;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.ServletRequestUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.UnsupportedEncodingException;
import java.util.Random;

@Controller
public class OtpController {

    // Session variables for processing SMS code verification.
    private static final String VERIFIED = "verified";
    private static final String SMSCODE = "smscode";
    private static final String CUSTOMERID = "customerID";
    private static final String CUSTOMERPHONE = "customerphone";
    private static final String CHANNELID = "initialChannelFriendlyId";

    private final Log logger = LogFactory.getLog(getClass()) ;

    @Autowired
    private CustomerRepository customerRepository;

    @ResponseStatus(HttpStatus.OK)
    @RequestMapping(value = "/portalauth/sendcode", method = RequestMethod.POST)
    public void acceptUser(HttpServletRequest request,
                                   HttpServletResponse response,
                                   @RequestBody String body) throws Exception {
        JSONObject input = new JSONObject(body);

        long customerID = 0;
        String customerPhone = "";
        String initialChannelFriendlyId = "";

        try {
            customerID = input.getLong("customer_id");
            customerPhone = input.getString("customer_phone");
            initialChannelFriendlyId = input.getString("fileHash");
        } catch (Exception e) {
            throw new Exception("Cannot process request : ", e);
        }

        if (customerID == 0) {
            throw new Exception("No customer ID parameter in request. Cannot send code.");
        }

        if (!StringUtils.hasText(customerPhone)) {
            throw new Exception("No customer phone parameter in request. Cannot send code.");
        }

        if (!StringUtils.hasText(initialChannelFriendlyId)) {
            throw new Exception("No initial channel friendly ID parameter in request. Cannot send code.");
        }

        /*Customer customer = customerRepository.findCustomerByCustomerIdAndPhoneNumber(customerID, customerPhone);
        if (customer != null) {
            int customercode = generateCode();
            try {
                otpService.sendOTP(clientPhone, usercode);
            } catch (Exception e) {
                logger.error("Cannot send SMS : ", e);
                return "";
            }

            request.getSession().setAttribute(VERIFIED, false);
            request.getSession().setAttribute(CUSTOMERID, customerID);
            request.getSession().setAttribute(SMSCODE, customercode);
            request.getSession().setAttribute(CUSTOMERPHONE, customerPhone);

            // Adding user phone number to user browser cookies.
            Cookie cookie = new Cookie("phonenumber", customerPhone);
            cookie.setMaxAge(60*5); //Store cookie for 5 minutes
            response.addCookie(cookie);
//            response.sendRedirect("/portalauth/verifycode?f=" + initialChannelFriendlyId);
        } else {
            throw new Exception("Invalid customer credentials");
        }*/
    }

    @ResponseStatus(HttpStatus.OK)
    @RequestMapping(value = "/portalauth/verifycode", method = RequestMethod.POST)
    public void verifyCode(HttpServletRequest request, @RequestBody String body) throws Exception {
        JSONObject input = new JSONObject(body);

        boolean verified = false;

        int code;
        try {
            code = input.getInt("customer_code");
        } catch (Exception e) {
            logger.error("Cannot verify code:", e);
            throw new Exception("Cannot validate code.");
        }

        if (request.getSession().getAttribute(SMSCODE) != null) {

            int customercode = Integer.valueOf(request.getSession().getAttribute(SMSCODE).toString());
            if (customercode == code) {
                verified = true;
                request.getSession().setAttribute(VERIFIED, true);
                request.getSession().setAttribute(CHANNELID, request.getSession().getAttribute(CHANNELID));
            }
        } else {
            logger.error("User does not have correct code in his session. Cannot validate SMS code.");
        }

        if (!verified) {
            request.getSession().setAttribute(VERIFIED, false);
            throw new Exception("Code is invalid.");
        }

        String phone = (String)request.getSession().getAttribute(CUSTOMERPHONE);
        if (!StringUtils.hasText(phone)) {
            logger.error("Cannot get user phone number");
            throw new Exception("Cannot get user phone number");
        }
    }

    @ExceptionHandler({ Exception.class })
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public final String exception(Exception ex) {
        return ex.getMessage();
    }
}
