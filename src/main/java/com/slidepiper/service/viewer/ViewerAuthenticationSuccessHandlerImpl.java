package com.slidepiper.service.viewer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.model.entity.Customer;
import com.slidepiper.model.entity.ViewerEvent;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.repository.CustomerRepository;
import com.slidepiper.repository.ViewerEventRepository;
import com.slidepiper.service.mfa.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Service;
import slidepiper.db.DbLayer;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

@Service
public class ViewerAuthenticationSuccessHandlerImpl implements AuthenticationSuccessHandler {
    private static final String VERIFIED = "verified";
    private static final String SMSCODE = "smscode";
    private static final String CUSTOMERID = "customerID";
    private static final String CUSTOMERPHONE = "customerphone";
    private static final String CHANNELID = "initialChannelFriendlyId";

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ViewerEventRepository eventRepository;
    private final CustomerRepository customerRepository;
    private final OtpService otpService;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    public ViewerAuthenticationSuccessHandlerImpl(ViewerEventRepository eventRepository,
                                                  CustomerRepository customerRepository, OtpService otpService) {

        this.eventRepository = eventRepository;
        this.customerRepository = customerRepository;
        this.otpService = otpService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String customerID = authentication.getName();

        String initialChannelFriendlyId = null;
        if (request.getSession().getAttribute("initialChannelFriendlyId") != null) {
            initialChannelFriendlyId = request.getSession().getAttribute("initialChannelFriendlyId").toString();
        }

        sendLoginEvent(customerID, request, response, initialChannelFriendlyId);

        Customer customer = customerRepository.findCustomerByCustomerId(customerID);
        String customerPhone = customer.getPhoneNumber();

        if (!DbLayer.isCustomerCanAccessDocument(customer.getEmail(), initialChannelFriendlyId, channelRepository.findByFriendlyId(initialChannelFriendlyId).getDocument().getViewer().getEmail())) {
            request.getSession().invalidate();
            response.sendRedirect("/accessdenied");
        } else {

            int customercode = otpService.generateCode();
            try {
//                otpService.sendOTP(customerPhone, customercode);
            } catch (Exception e) {
                throw new ServletException("Cannot send code: " + e.getMessage());
            }

            request.getSession().setAttribute(VERIFIED, false);
            request.getSession().setAttribute(CUSTOMERID, customerID);
            request.getSession().setAttribute(SMSCODE, customercode);
            request.getSession().setAttribute(CUSTOMERPHONE, customerPhone);
            request.getSession().setAttribute(CHANNELID, initialChannelFriendlyId);

            // Adding user phone number to user browser cookies.
            Cookie cookie = new Cookie("phonenumber", customerPhone);
            cookie.setMaxAge(60 * 5); //Store cookie for 5 minutes
            response.addCookie(cookie);

            response.sendRedirect("/view/verifycode");
        }
    }

    private void sendLoginEvent(String customerID, HttpServletRequest request, HttpServletResponse response, String initialChannelFriendlyId) {
        Customer user = customerRepository.findCustomerByCustomerId(customerID);

        String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
                .map(x -> x.split(",")[0])
                .orElse(request.getRemoteAddr());
        String referer = request.getHeader("referer");
        String userAgent = request.getHeader("User-Agent");

        ObjectNode data = objectMapper.createObjectNode();
        data.put("ip", ip);
        data.put("referer", referer);
        data.put("userAgent", userAgent);
        eventRepository.save(new ViewerEvent(ViewerEvent.ViewerEventType.LOGIN_CUSTOMER, initialChannelFriendlyId));
    }
}