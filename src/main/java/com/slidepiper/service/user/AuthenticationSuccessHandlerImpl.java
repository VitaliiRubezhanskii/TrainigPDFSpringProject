package com.slidepiper.service.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.model.entity.Event;
import com.slidepiper.model.entity.Event.EventType;
import com.slidepiper.model.entity.User;
import com.slidepiper.repository.EventRepository;
import com.slidepiper.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Service;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class AuthenticationSuccessHandlerImpl implements AuthenticationSuccessHandler {
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Autowired
    public AuthenticationSuccessHandlerImpl(EventRepository eventRepository,
                                            UserRepository userRepository) {

        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        sendLoginEvent(authentication.getName(), request);
        response.sendRedirect("/dashboard");
    }

    private void sendLoginEvent(String username, HttpServletRequest request) {
        User user = userRepository.findByUsername(username);
        if (Objects.isNull(user.getPasswordChangedAt()) && Objects.isNull(user.getPasswordExpiresAt())) {
            user.setPasswordExpiresAt(new Timestamp(System.currentTimeMillis() + TimeUnit.DAYS.toMillis(15)));
            userRepository.save(user);
        }

        String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
                .map(x -> x.split(",")[0])
                .orElse(request.getRemoteAddr());
        String referer = request.getHeader("referer");
        String userAgent = request.getHeader("User-Agent");

        ObjectNode data = objectMapper.createObjectNode();
        data.put("ip", ip);
        data.put("referer", referer);
        data.put("userAgent", userAgent);
        eventRepository.save(new Event(username, EventType.LOGIN_USER, data));
    }
}