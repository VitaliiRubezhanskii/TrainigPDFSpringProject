package slidepiper.customer_servlets;

import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.slidepiper.model.component.ConfigurationPropertiesUtils;
import org.apache.commons.io.FileUtils;
import slidepiper.config.ConfigProperties;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class DocumentShareServlet {

  public static String getS3ImageUrl(String documentHash, String imageBase64String, String imageFileName) throws IOException {
    String imageUrl = null;
    String bucketName = "slidepiper-widgets/" + ConfigurationPropertiesUtils.springProfiles.getActive();
    String key = documentHash + "/widget11/facebook/image/" + imageFileName;

    AWSCredentials awsCredentials = new BasicAWSCredentials(
        ConfigProperties.getProperty("aws_access_key_id"),
        ConfigProperties.getProperty("aws_secret_access_key")
    );
    
    AmazonS3 s3Client = new AmazonS3Client(awsCredentials);
    
    try {
      String base64Image = imageBase64String.split(",")[1];
      byte[] imageBytes = javax.xml.bind.DatatypeConverter.parseBase64Binary(base64Image);
      File file = new File(FileUtils.getTempDirectoryPath(), imageFileName);
      FileOutputStream fos = new FileOutputStream(file);
      fos.write(imageBytes);
      fos.close();
      
      s3Client.putObject(
          new PutObjectRequest(bucketName, key, file)
              .withCannedAcl(CannedAccessControlList.PublicRead)
      );
      
      file.delete();
      System.out.println("SP: An image was uploaded");
      System.out.println("SP: bucket, " + bucketName);
      System.out.println("SP: key, " + documentHash);
      
      imageUrl = s3Client.getUrl(bucketName, key).toString();
    } catch (AmazonServiceException ase) {
      System.out.println("Service Exception: " + ase.getErrorMessage());
    } catch (AmazonClientException ace) {
      System.out.println("Client Exception: " + ace.getMessage());
    }  
    
    return imageUrl;
  }
}
