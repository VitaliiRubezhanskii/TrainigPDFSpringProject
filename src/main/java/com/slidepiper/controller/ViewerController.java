package com.slidepiper.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.slidepiper.Routes;
import com.slidepiper.model.entity.widget.ShareData;
import com.slidepiper.model.service.ShareDataService;
import com.slidepiper.model.service.ViewerService;

import slidepiper.db.DbLayer;

@Controller
public class ViewerController {
  
  @Autowired private ViewerService viewerService;
  @Autowired private ShareDataService shareDataService;
  
  @GetMapping(Routes.VIEWER)
  private String viewer(HttpServletRequest request,
      @RequestParam(name="f") String channelName,
      Model model) {
    
    String view = viewerService.viewManager(channelName, request);
    
    if (view.equals("viewer")) {
      long documentId = DbLayer.getFileIdFromFileLinkHash(channelName);
      ShareData shareData =
          shareDataService.getShareData(documentId, request, channelName);
      
      model.addAttribute("shareData", shareData);
    }
    
    return view;
  }

  @ExceptionHandler(MissingServletRequestParameterException.class)
  public String handleMissingParams(MissingServletRequestParameterException e) {
    return "redirect:/";
  }
}
