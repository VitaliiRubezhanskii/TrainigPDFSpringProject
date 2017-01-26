package com.slidepiper.model.service;

import java.util.Optional;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.slidepiper.model.component.resource.ShareData;
import com.slidepiper.model.repository.widget.ShareWidgetRepository;

@Service
public class ShareDataService {
  @Autowired private ShareWidgetRepository shareWidgetRepository;
  @Autowired private ShareData defaultShareData;
  
  public ShareData getShareData(long documentId,
      HttpServletRequest request,
      String channelName) {
    
    ShareData shareData = Optional.ofNullable(shareWidgetRepository.findByDocumentId(documentId))
                              .map(x -> x.getData())
                              .orElse(defaultShareData);
    
    shareData.setUrl(request.getRequestURL().toString());
    shareData.setChannelName(channelName);
    
    return shareData;
  }
}
