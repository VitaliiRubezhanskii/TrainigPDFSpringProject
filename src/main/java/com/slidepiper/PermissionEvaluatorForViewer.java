package com.slidepiper;

import com.slidepiper.model.customer.Customer;
import com.slidepiper.model.entity.Document;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.repository.CustomerRepository;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import slidepiper.db.DbLayer;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;

@Component
public class PermissionEvaluatorForViewer {
    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public boolean checkIfAuthRequired(Authentication authentication, HttpServletRequest request) throws ServletException {
        Document result=null;
        String initialChannelFriendlyId = request.getParameter("f");

        if (StringUtils.isNotBlank(initialChannelFriendlyId)) {
            request.getSession().setAttribute("initialChannelFriendlyId", initialChannelFriendlyId);
            result = channelRepository.findByFriendlyId(initialChannelFriendlyId).getDocument();
        }

        if (result != null) {
            if (result.isMfaEnabled()) {
                if (!(authentication instanceof AnonymousAuthenticationToken)) {
                    Customer customer = customerRepository.findCustomerByCustomerId(authentication.getName());

                    if (customer != null) {
                        if (!DbLayer.isCustomerCanAccessDocument(customer.getEmail(), initialChannelFriendlyId, result.getViewer().getEmail())) {
                            request.getSession().invalidate();
                            return false;
                        }
                        System.out.println(request.getSession().getAttribute("verified"));
                        if(request.getSession().getAttribute("verified") != null) {
                            if (!(Boolean) request.getSession().getAttribute("verified")) {
                                return false;
                            }
                        }
                        return true;
                    }

                    if (authentication.getName().equals(result.getViewer().getEmail())) {
                        return true;
                    }
                    return false;
                }
                return false;
            }
            return true;
        }
        return true;
    }
}
