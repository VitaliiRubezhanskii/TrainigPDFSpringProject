package com.slidepiper.service;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Service;

import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;

@Service
public class ViewerService {
  public String viewManager(String documentChannelAlias,
      HttpServletRequest request) {
    
    Map<String, String> eventDataMap = new HashMap<String, String>();
    eventDataMap.put("msg_id", documentChannelAlias);
    eventDataMap.put("session_id", "-1");
    eventDataMap.put("param_1_varchar", request.getRemoteAddr());
    eventDataMap.put("param_2_varchar", request.getHeader("User-Agent"));
    eventDataMap.put("param_3_varchar", request.getHeader("referer"));
    
    switch(DbLayer.getFileWhiteListFlag(documentChannelAlias)) {
    
      // File does not exist.
      case 1:
        
        // Redirect to SP broken link page.
        eventDataMap.put("param_4_varchar", ConfigProperties.getProperty("file_viewer_broken_link"));
        DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_document_not_exists"), eventDataMap);
        return "redirect:" + ConfigProperties.getProperty("file_viewer_broken_link");
      
      // File is not whitelisted.
      case 2:
        if (isBrowserUnsupported(request.getHeader("User-Agent"))) {
          String redirectLink = null;
          String fileLink = DbLayer.getFileLinkFromFileLinkHash(documentChannelAlias);
          String documentUrl = DbLayer.getAlternativeUrlFromFileLinkHash(documentChannelAlias);
          
          if (null != fileLink && ! fileLink.equals("")) {
            redirectLink = fileLink;
          } else if (null != documentUrl && ! documentUrl.equals("")) {
            redirectLink = documentUrl;
          } else {
            redirectLink = ConfigProperties.getProperty("app_url");
          }
          
          // Redirect to specified location.
          eventDataMap.put("param_4_varchar", redirectLink);
          DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_unsupported_browser"), eventDataMap);
          return "redirect:" + redirectLink;
        } else {
        
          // Continue to view file.
          DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_document_exists"), eventDataMap);
          return "viewer";
        }
      
      // File is whitelisted.
      case 3:
        
        // Check if request IP matches IP in ip_whitelist table.
        if (DbLayer.isIPMatchClientIP(documentChannelAlias, request.getRemoteAddr())) {
          if (isBrowserUnsupported(request.getHeader("User-Agent"))) {
            String redirectLink = null;
            String fileLink = DbLayer.getFileLinkFromFileLinkHash(documentChannelAlias);
            String documentUrl = DbLayer.getAlternativeUrlFromFileLinkHash(documentChannelAlias);
            
            if (null != fileLink && ! fileLink.equals("")) {
              redirectLink = fileLink;
            } else if (null != documentUrl && ! documentUrl.equals("")) {
              redirectLink = documentUrl;
            } else {
              redirectLink = ConfigProperties.getProperty("app_url");
            }
            
            // Redirect to specified location.
            eventDataMap.put("param_4_varchar", redirectLink);
            DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_unsupported_browser"), eventDataMap);
            return "redirect:" + redirectLink;
          } else {

            // Continue to view file.
            DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_document_exists"), eventDataMap);
            return "viewer";
          }
          
        } else {
          
          // Redirect to SP ip restricted page.
          String ipRestrictedDocumentLink = ConfigProperties.getProperty("file_viewer_ip_restricted");
          eventDataMap.put("param_4_varchar", ipRestrictedDocumentLink);
          
          DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_ip_not_whitelisted"), eventDataMap);
          return "redirect:" + ConfigProperties.getProperty("file_viewer_ip_restricted");
        }
    }
    return null; 
  }
  
  /**
   * Check if browser is unsupported by the application.
   */
  private boolean isBrowserUnsupported(String userAgent) {
    String[] unsupportedBrowserTokens = {
      "MSIE 5.0", "MSIE 6.0", "MSIE 7.0", "MSIE 8.0", "MSIE 9.0"
    };
    
    for (String unsupportedBrowserToken: unsupportedBrowserTokens) {
      if (userAgent.contains(unsupportedBrowserToken)) {
        return true;
      }
    }
    
    return false;
  }
}
