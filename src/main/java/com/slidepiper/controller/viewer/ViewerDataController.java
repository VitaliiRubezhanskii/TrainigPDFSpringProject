package com.slidepiper.controller.viewer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.model.component.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.Objects;

@RestController
/** @deprecated */
public class ViewerDataController {
    private ObjectMapper objectMapper;

    @Autowired
    public ViewerDataController(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @CrossOrigin(origins = "*")
    @GetMapping(value = "/viewer/viewer-data")
    public ObjectNode viewerId(@CookieValue(value = "sp.viewer", required = false) String viewerCookie,
                               HttpServletRequest request) {
        ObjectNode objectNode = objectMapper.createObjectNode();

        String viewerId = "";
        if (Objects.nonNull(viewerCookie)) {
            viewerId = JwtUtils.verify(viewerCookie).getClaim("viewerId").asString();
        } else {
            // TODO: Add Sentry error method.
            System.err.println("viewerId is null for user agent: " + request.getHeader("User-Agent"));
        }

        objectNode.put("viewerId", viewerId);

        return objectNode;
    }
}