package com.slidepiper.controller;

import com.slidepiper.model.input.ViewerEventInput;
import com.slidepiper.service.ViewerEventService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.io.IOException;
import java.net.URISyntaxException;

@RestController
@AllArgsConstructor(onConstructor = @__(@Autowired))
public class ViewerEventController {
    private ViewerEventService viewerEventService;

    @CrossOrigin(origins = "*")
    @PostMapping(value = "/utils/viewer-event-email")
    public void viewerEventEmail(@Valid @RequestBody ViewerEventInput viewerEventInput)
            throws IOException, URISyntaxException {

        viewerEventService.sendUserEmail(viewerEventInput);
    }
}
