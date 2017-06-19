package com.slidepiper.controller.viewer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slidepiper.model.component.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ViewerDataController {
    private ObjectMapper objectMapper;

    @Autowired
    public ViewerDataController(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @CrossOrigin(origins = "*")
    @GetMapping(value = "/viewer/viewer-data")
    public ObjectNode viewerId(@CookieValue("sp.viewer") String viewer) {
        ObjectNode objectNode = objectMapper.createObjectNode();
        String viewerId = JwtUtils.verify(viewer).getClaim("viewerId").asString();
        objectNode.put("viewerId", viewerId);

        return objectNode;
    }
}
