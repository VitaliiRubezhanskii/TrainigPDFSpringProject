package com.slidepiper;

import com.slidepiper.model.entity.Document;
import com.slidepiper.repository.ChannelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

@Component
public class PermissionEvaluator {
    @Autowired
    private ChannelRepository repo;

    public boolean checkIfAuthRequired(Authentication authentication, HttpServletRequest request) {
        Document result = repo.findByFriendlyId(request.getParameter("f")).getDocument();
        request.getSession().setAttribute("initialChannelFriendlyId", request.getParameter("f"));
        if (result.isMfaEnabled()) {
            if (!(authentication instanceof AnonymousAuthenticationToken)) {
                return false;
            }
        }
        return !result.isMfaEnabled();
    }
}
