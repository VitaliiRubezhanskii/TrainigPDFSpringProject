package com.slidepiper.controller.viewer;

import com.slidepiper.channel.ChannelNotFoundException;
import com.slidepiper.document.DocumentNotFoundException;
import com.slidepiper.document.DocumentRestrictedException;
import com.slidepiper.model.entity.Channel;
import com.slidepiper.model.entity.Document;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.service.viewer.ViewerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import slidepiper.db.DbLayer;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RestController
public class ViewerConfigurationController {
    private final ChannelRepository channelRepository;
    private final ViewerService viewerService;
    private final DbLayer dbLayer;

    @Autowired
    public ViewerConfigurationController(ChannelRepository channelRepository,
                                         ViewerService viewerService,
                                         DbLayer dbLayer) {
        this.channelRepository = channelRepository;
        this.viewerService = viewerService;
        this.dbLayer=dbLayer;
    }

    @CrossOrigin("*")
    @GetMapping("/viewer/configuration")
    public Map<String, Object> viewerConfiguration(@RequestParam("channelFriendlyId") String channelFriendlyId,
                                                   HttpServletRequest request) {
        String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
                .map(x -> x.split(",")[0])
                .orElse(request.getRemoteAddr());

        Channel channel = channelRepository.findByFriendlyId(channelFriendlyId);

        if (Objects.isNull(channel)) {
            throw new ChannelNotFoundException();
        }

        Document document = channel.getDocument();
        if (Objects.isNull(document)
                || (!document.getStatus().equals(Document.Status.CREATED)
                    && !document.getStatus().equals(Document.Status.UPDATED))) {
            throw new DocumentNotFoundException();
        }

        if (document.isIpRestricted()
                && !dbLayer.isIPMatchClientIP(channel.getFriendlyId(), ip)) {
            throw new DocumentRestrictedException();
        }

        return viewerService.getViewerConfiguration(document.getViewer());
    }
}