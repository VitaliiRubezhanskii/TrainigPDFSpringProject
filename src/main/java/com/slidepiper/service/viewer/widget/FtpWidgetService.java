package com.slidepiper.service.viewer.widget;

import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.slidepiper.exception.WidgetDisabledException;
import com.slidepiper.exception.WidgetNotFoundException;
import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.Storage;
import com.slidepiper.model.entity.widget.FtpWidget;
import com.slidepiper.model.entity.widget.FtpWidget.FtpWidgetData;
import com.slidepiper.model.entity.widget.FtpWidget.FtpWidgetData.Scheme;
import com.slidepiper.model.input.FtpWidgetDataInput;
import com.slidepiper.repository.ChannelRepository;
import com.slidepiper.repository.StorageRepository;
import com.slidepiper.repository.widget.FtpWidgetRepository;
import com.slidepiper.service.amazon.AmazonS3Service;
import org.apache.commons.io.FileUtils;
import org.apache.commons.vfs2.FileObject;
import org.apache.commons.vfs2.FileSystemException;
import org.apache.commons.vfs2.FileSystemOptions;
import org.apache.commons.vfs2.Selectors;
import org.apache.commons.vfs2.impl.StandardFileSystemManager;
import org.apache.commons.vfs2.provider.sftp.SftpFileSystemConfigBuilder;
import org.jasypt.util.text.BasicTextEncryptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Objects;
import java.util.Optional;
import java.util.StringJoiner;
import java.util.UUID;

@Service
public class FtpWidgetService {
    private static final Logger log = LoggerFactory.getLogger(FtpWidgetService.class);

    private final String activeProfile;
    private final String storagePassword;

    private final AmazonS3Service amazonS3Service;
    private final ChannelRepository channelRepository;
    private final FtpWidgetRepository ftpWidgetRepository;
    private final StorageRepository storageRepository;

    @Autowired
    public FtpWidgetService(@Value("${spring.profiles.active}") String activeProfile,
                            @Value("${slidepiper.storage.password}") String storagePassword,
                            AmazonS3Service amazonS3Service,
                            ChannelRepository channelRepository,
                            FtpWidgetRepository ftpWidgetRepository,
                            StorageRepository storageRepository) {
        this.activeProfile = activeProfile;
        this.storagePassword = storagePassword;
        this.amazonS3Service = amazonS3Service;
        this.channelRepository = channelRepository;
        this.ftpWidgetRepository = ftpWidgetRepository;
        this.storageRepository = storageRepository;
    }

    public void uploadManager(MultipartFile[] files, FtpWidgetDataInput ftpWidgetDataInput)
            throws IOException, URISyntaxException {

        StandardFileSystemManager manager = new StandardFileSystemManager();
        manager.init();

        File localFile = null;

        FtpWidgetData ftpWidgetData = getFtpWidgetDataByChannelName(ftpWidgetDataInput.getChannelName());
        String connectionUrl = createConnecitonUrl(ftpWidgetData);
        FileSystemOptions fileSystemOptions = createFileSystemOptions(ftpWidgetData.getScheme());

        for (MultipartFile file: files) {
            try {
                localFile = createLocalFile(file, ftpWidgetDataInput.getFileNamePrefix());
                FileUtils.copyInputStreamToFile(file.getInputStream(), localFile);

                String remoteFileUri = String.join("/", connectionUrl, localFile.getName());
                FileObject remoteFile = manager.resolveFile(remoteFileUri, fileSystemOptions);
                remoteFile.copyFrom(manager.resolveFile(localFile.getAbsolutePath()), Selectors.SELECT_SELF);

                log.info("File uploaded successfully");
            } catch (IOException e) {
                e.printStackTrace();
                // TODO: Send message to SlidePiper Administrators regarding file failed to upload through FTP Widget.

                String bucket = "slidepiper-files";
                String key = UriComponentsBuilder.fromPath(activeProfile)
                        .pathSegment("ftp-widget", "failure", localFile.getName()).build().toString();
                amazonS3Service.upload(localFile, bucket, key, CannedAccessControlList.Private);
            } finally {
                localFile.delete();
            }
        }

        manager.close();
    }

    private String createConnecitonUrl(FtpWidgetData ftpWidgetData) throws URISyntaxException {
        BasicTextEncryptor basicTextEncryptor = new BasicTextEncryptor();
        basicTextEncryptor.setPassword(storagePassword);

        Storage storage = storageRepository.findByType("ENCRYPTED_CONNECTION_URL");

        String encryptedConnectionUrl = storage.getData();
        if (Objects.nonNull(encryptedConnectionUrl)) {
            return basicTextEncryptor.decrypt(encryptedConnectionUrl);
        } else {
            String userInfo = String.join(":", ftpWidgetData.getUsername(), ftpWidgetData.getPassword());
            String connectionUrl = new URI(ftpWidgetData.getScheme().name().toLowerCase(),
                    userInfo,
                    ftpWidgetData.getHost(),
                    ftpWidgetData.getPort(),
                    ftpWidgetData.getPath(),
                    null,
                    null).toString();

            storage.setData(basicTextEncryptor.encrypt(connectionUrl));
            storageRepository.save(storage);

            return connectionUrl;
        }
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

        Document document = channelRepository.findByFriendlyId(channelName).getDocument();
        FtpWidget ftpWidget =
                Optional.ofNullable(ftpWidgetRepository.findByDocument(document))
                        .orElseThrow(() -> new WidgetNotFoundException());

        if (ftpWidget.isEnabled()) {
            return ftpWidget.getData();
        } else {
            throw new WidgetDisabledException();
        }
    }
}
