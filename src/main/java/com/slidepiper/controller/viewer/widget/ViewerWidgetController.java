package com.slidepiper.controller.viewer.widget;

import com.slidepiper.channel.ChannelNotFoundException;
import com.slidepiper.document.DocumentNotFoundException;
import com.slidepiper.document.DocumentRestrictedException;
import com.slidepiper.model.entity.Channel;
import com.slidepiper.model.entity.Document;
import com.slidepiper.repository.ChannelRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import slidepiper.db.DbLayer;

import javax.servlet.http.HttpServletRequest;
import java.util.Objects;
import java.util.Optional;

@RestController
public class ViewerWidgetController {
    private final ChannelRepository channelRepository;

    public ViewerWidgetController(ChannelRepository channelRepository) {
        this.channelRepository = channelRepository;
    }

    @CrossOrigin(origins = "*")
    @GetMapping("/viewer/widgets")
    public String widgetsConfiguration(@RequestParam("fileLinkHash") String channelFriendlyId,
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
                && !DbLayer.isIPMatchClientIP(channel.getFriendlyId(), ip)) {
            throw new DocumentRestrictedException();
        }

        return DbLayer.getViewerWidgetsSettings(document.getId()).toString();
    }
}