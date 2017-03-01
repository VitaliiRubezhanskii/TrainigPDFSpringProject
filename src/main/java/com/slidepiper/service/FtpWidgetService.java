package com.slidepiper.service;

import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.slidepiper.model.entity.widget.FtpWidget;
import com.slidepiper.model.entity.widget.FtpWidgetData;
import com.slidepiper.model.entity.widget.FtpWidgetData.Scheme;
import com.slidepiper.model.exception.FileNotUploadedException;
import com.slidepiper.model.exception.WidgetDisabledException;
import com.slidepiper.model.exception.WidgetNotFoundException;
import com.slidepiper.model.input.FtpWidgetDataInput;
import com.slidepiper.model.repository.widget.FtpWidgetRepository;
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
import slidepiper.db.DbLayer;

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

    @Autowired private FtpWidgetRepository ftpWidgetRepository;

    public void uploadManager(MultipartFile[] files, FtpWidgetDataInput ftpWidgetDataInput) {

        StandardFileSystemManager manager = new StandardFileSystemManager();
        File localFile = null;

        try {
            FtpWidgetData ftpData = getFtpWidgetDataByChannelName(ftpWidgetDataInput.getChannelName());
            String connectionUrl = createConnecitonUrl(ftpData);

            manager.init();
            FileSystemOptions fileSystemOptions = createFileSystemOptions(ftpData.getScheme());

            for (MultipartFile file: files) {
                localFile = createLocalFile(file, ftpWidgetDataInput.getFileNamePrefix());
                FileUtils.copyInputStreamToFile(file.getInputStream(), localFile);

                uploadFileToAmazonS3(localFile, localFile.getName());

                String remoteFileUri = String.join("/", connectionUrl, localFile.getName());
                FileObject remoteFile = manager.resolveFile(remoteFileUri, fileSystemOptions);
                remoteFile.copyFrom(manager.resolveFile(localFile.getAbsolutePath()),
                        Selectors.SELECT_SELF);

                log.info("File uploaded successfully: " + localFile.getName());
            }
        } catch(IOException | URISyntaxException e) {
            throw new FileNotUploadedException();
        } finally {
            manager.close();
        }
    }

    private void uploadFileToAmazonS3(File file, String fileName) {
        String bucketName = "slidepiper-files/ftp-widget";
        String keyName = fileName;

        // s3-viewer credentials.
        AWSCredentials awsCredentials = new BasicAWSCredentials(
                "AKIAJQO4ZQXYRO2T5GXA",
                "X6c1Hu18c3Zl+41EwIyrsw0EaRPd09x4quix8UsS"
        );
        AmazonS3 s3client = new AmazonS3Client(awsCredentials);

        try {
            System.out.println("Uploading a new object to S3: " + fileName);
            s3client.putObject(new PutObjectRequest(bucketName, keyName, file));

        } catch (AmazonServiceException ase) {
            System.out.println("Caught an AmazonServiceException, which " +
                    "means your request made it " +
                    "to Amazon S3, but was rejected with an error response" +
                    " for some reason.");
            System.out.println("Error Message:    " + ase.getMessage());
            System.out.println("HTTP Status Code: " + ase.getStatusCode());
            System.out.println("AWS Error Code:   " + ase.getErrorCode());
            System.out.println("Error Type:       " + ase.getErrorType());
            System.out.println("Request ID:       " + ase.getRequestId());
        } catch (AmazonClientException ace) {
            System.out.println("Caught an AmazonClientException, which " +
                    "means the client encountered " +
                    "an internal error while trying to " +
                    "communicate with S3, " +
                    "such as not being able to access the network.");
            System.out.println("Error Message: " + ace.getMessage());
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
