package com.slidepiper.controller.viewer.widget;

import com.slidepiper.repository.ChannelRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import slidepiper.db.DbLayer;

@RestController
public class ViewerWidgetController {
    private final ChannelRepository channelRepository;

    public ViewerWidgetController(ChannelRepository channelRepository) {
        this.channelRepository = channelRepository;
    }

    @CrossOrigin(origins = "*")
    @GetMapping("/viewer/widgets")
    public String widgetsConfiguration(@RequestBody @RequestParam("fileLinkHash") String channelFriendlyId) {
        long documentId = channelRepository.findByFriendlyId(channelFriendlyId).getDocument().getId();
        return DbLayer.getWidgetsSettings(documentId).toString();
    }
}