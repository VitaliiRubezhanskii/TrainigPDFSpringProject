package com.slidepiper.model.service;

import java.util.Optional;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.slidepiper.model.entity.widget.ShareData;
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
    
    if (!shareData.isEnabled()) {
      shareData = defaultShareData;
    }
    
    String url = Optional
                     .ofNullable(shareData.getUrl())
                     .orElse(String.join("", request.getRequestURL().toString(), "?f=", channelName));
    
    shareData.setUrl(url);
    
    return shareData;
  }
}
