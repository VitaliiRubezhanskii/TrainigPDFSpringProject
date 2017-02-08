package com.slidepiper.model.service;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Objects;
import java.util.Optional;
import java.util.StringJoiner;
import java.util.UUID;

import org.apache.commons.io.FileUtils;
import org.apache.commons.vfs2.FileObject;
import org.apache.commons.vfs2.FileSystemException;
import org.apache.commons.vfs2.FileSystemOptions;
import org.apache.commons.vfs2.Selectors;
import org.apache.commons.vfs2.impl.StandardFileSystemManager;
import org.apache.commons.vfs2.provider.sftp.SftpFileSystemConfigBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.slidepiper.model.entity.widget.FtpWidget;
import com.slidepiper.model.entity.widget.FtpWidgetData;
import com.slidepiper.model.entity.widget.FtpWidgetData.Scheme;
import com.slidepiper.model.exception.WidgetDisabledException;
import com.slidepiper.model.exception.WidgetNotFoundException;
import com.slidepiper.model.input.FtpWidgetDataInput;
import com.slidepiper.model.repository.widget.FtpWidgetRepository;

import slidepiper.db.DbLayer;

@Service
public class FtpWidgetService {
  private static final Logger log = LoggerFactory.getLogger(FtpWidgetService.class);
  
  @Autowired private FtpWidgetRepository ftpWidgetRepository;
  
  public void uploadManager(MultipartFile[] files, FtpWidgetDataInput ftpWidgetDataInput)
      throws IOException, URISyntaxException {
    
    StandardFileSystemManager manager = new StandardFileSystemManager();
    File localFile = null;
    
    try {
      FtpWidgetData ftpData = getFtpWidgetDataByChannelName(ftpWidgetDataInput.getChannelName());
      String connectionUrl = createConnecitonUrl(ftpData);
       
      manager.init();
      FileSystemOptions fileSystemOptions = createFileSystemOptions(ftpData.getScheme());
      
      for (MultipartFile file: files) {
        localFile = createLocalFile(file, ftpWidgetDataInput.getFileNamePrefix());
        localFile.deleteOnExit(); // Redundant, or a safety measure?
        FileUtils.copyInputStreamToFile(file.getInputStream(), localFile);
        
        String remoteFileUri = String.join("/", connectionUrl, localFile.getName());
        FileObject remoteFile = manager.resolveFile(remoteFileUri, fileSystemOptions);
        remoteFile.copyFrom(manager.resolveFile(localFile.getAbsolutePath()),
            Selectors.SELECT_SELF);
        log.info("File uploaded successfuly: " + localFile.getName());
      }
    } finally {
      if (Objects.nonNull(localFile)) {
        localFile.delete();
      }
      manager.close();
    }
  }
  
  private String createConnecitonUrl(FtpWidgetData ftpWidgetData) throws URISyntaxException {
    String userInfo = String.join(":", ftpWidgetData.getUsername(), ftpWidgetData.getPassword());
    
    return new URI(ftpWidgetData.getScheme().name().toLowerCase(),
        userInfo,
        ftpWidgetData.getHost(),
        ftpWidgetData.getPort(),
        ftpWidgetData.getPath(),
        null,
        null).toString();
  }
  
  private FileSystemOptions createFileSystemOptions(Scheme scheme)
      throws FileSystemException {
    
    FileSystemOptions fileSystemOptions = new FileSystemOptions();
    switch (scheme) {
      case SFTP:
        SftpFileSystemConfigBuilder.getInstance().setStrictHostKeyChecking(fileSystemOptions, "no");
        SftpFileSystemConfigBuilder.getInstance().setTimeout(fileSystemOptions, 10000);
        break;
    }
    return fileSystemOptions;
  }
  
  private File createLocalFile(MultipartFile file, String fileNamePrefix) {
    StringJoiner fileName = new StringJoiner("_");
    
    fileName.add(UUID.randomUUID().toString());
    if (Objects.nonNull(fileNamePrefix)) {
      fileName.add(fileNamePrefix);
    }
    fileName.add(file.getOriginalFilename());
    
    return new File(FileUtils.getTempDirectoryPath(), fileName.toString());
  }

  private FtpWidgetData getFtpWidgetDataByChannelName(String channelName)
      throws WidgetDisabledException {
    
    long documentId = DbLayer.getFileIdFromFileLinkHash(channelName);
    FtpWidget ftpWidget =
        Optional.ofNullable(ftpWidgetRepository.findByDocumentId(documentId))
            .orElseThrow(() -> new WidgetNotFoundException());
    
    if (ftpWidget.isEnabled()) {
      return ftpWidget.getData();
    } else {
      throw new WidgetDisabledException();
    }
  }
}
