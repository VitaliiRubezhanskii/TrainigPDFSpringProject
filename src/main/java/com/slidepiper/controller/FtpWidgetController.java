package com.slidepiper.controller;

import com.slidepiper.model.input.FtpWidgetDataInput;
import com.slidepiper.model.output.ExceptionResponseOutput;
import com.slidepiper.service.FtpWidgetService;
import lombok.AllArgsConstructor;
import org.apache.commons.lang3.ArrayUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

@RestController
@AllArgsConstructor(onConstructor = @__(@Autowired))
public class FtpWidgetController {
  private final FtpWidgetService ftpWidgetService;
  
  @CrossOrigin(origins = "*")
  @PostMapping(value = "/utils/widgets/ftp")
  public void handleFileUpload(
      @RequestPart("files[]") MultipartFile[] files,
      @Valid @RequestPart("data") FtpWidgetDataInput ftpWidgetDataInput) {
    
    // TODO: create FtpWidgetFileInput class to enable Hibernate annotations validation.
    if (ArrayUtils.isEmpty(files)) {
      throw new FtpWidgetFileInputEmptyException();
    }
    
    ftpWidgetService.uploadManager(files, ftpWidgetDataInput);
  }
  
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  @ExceptionHandler(FtpWidgetFileInputEmptyException.class)
  public ExceptionResponseOutput handleFtpWidgetFileInputEmptyException(
      FtpWidgetFileInputEmptyException e, HttpServletRequest request) {
    
    return new ExceptionResponseOutput(e, request);
  } 
}

@SuppressWarnings("serial")
class FtpWidgetFileInputEmptyException extends RuntimeException {
  FtpWidgetFileInputEmptyException() {
    super("File input is empty");
  }
}