package com.slidepiper.controller.viewer;

import com.slidepiper.model.entity.Viewer;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.service.viewer.ViewerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ViewerConfigurationController {
    private final ChannelRepository channelRepository;
    private final ViewerService viewerService;

    @Autowired
    public ViewerConfigurationController(ChannelRepository channelRepository,
                                         ViewerService viewerService) {
        this.channelRepository = channelRepository;
        this.viewerService = viewerService;
    }

    @CrossOrigin("*")
    @GetMapping("/viewer/configuration")
    public Map<String, Object> viewerConfiguration(@RequestParam("channelFriendlyId") String channelFriendlyId) {
        Viewer viewer = channelRepository.findByFriendlyId(channelFriendlyId).getDocument().getViewer();
        return viewerService.getViewerConfiguration(viewer);
    }
}