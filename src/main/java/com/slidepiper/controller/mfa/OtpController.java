package com.slidepiper.controller.mfa;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Controller
public class OtpController {

    // Session variables for processing SMS code verification.
    private static final String VERIFIED = "verified";
    private static final String SMSCODE = "smscode";
    private static final String CUSTOMERPHONE = "customerphone";
    private static final String CHANNELID = "initialChannelFriendlyId";

    private final Log logger = LogFactory.getLog(getClass()) ;

    @ResponseStatus(HttpStatus.OK)
    @RequestMapping(value = "/view/verifycode", method = RequestMethod.POST)
    public void verifyCode(HttpServletRequest request, HttpServletResponse response, @RequestBody String body) throws Exception {
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
            request.getSession().invalidate();
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
