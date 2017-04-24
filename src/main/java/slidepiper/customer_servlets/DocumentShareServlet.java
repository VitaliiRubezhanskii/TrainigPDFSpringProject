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
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;
import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.rowset.serial.SerialException;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.StringWriter;
import java.net.URL;
import java.sql.Blob;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("serial")
@WebServlet("/share")
public class DocumentShareServlet extends HttpServlet {
  
  private static final int BUFFER_SIZE = 4096;   
  
  protected void doGet(HttpServletRequest request,
      HttpServletResponse response) throws ServletException, IOException {
    String templateHtml = null;
    
    if ((null != request.getParameter("f")
      && ! request.getParameter("f").equals(""))) {
      String documentLinkHash = request.getParameter("f");
      int fileId = DbLayer.getFileIdFromFileLinkHash(documentLinkHash);
      String type = "11";
      JSONObject widgetSettings = DbLayer.getWidgetsSettingsByWidgetType(fileId, type);
      String widgetDataStr = widgetSettings.getString("widgetData");
      
      JSONObject object = (JSONObject) new JSONTokener(widgetDataStr).nextValue();
      JSONArray items = object.getJSONObject("data").getJSONArray("items");

      Map<String, Object> templateData = new HashMap<String, Object>();
      templateData.put("title", items.getJSONObject(0).getString("title"));
      templateData.put("description", items.getJSONObject(0).getString("description"));
      templateData.put("imageUrl", items.getJSONObject(0).getString("imageUrl"));
      
      String requestUrl = request.getRequestURL() + "?" + request.getQueryString();
      templateData.put("shareUrl", requestUrl);
      
      try {
        templateHtml = DocumentShareServlet.getHtmlTemplate(templateData);
      } catch (TemplateException e) {
        e.printStackTrace();
      }
      
      byte[] bytes = templateHtml.getBytes();
      Blob blob = null;
      try {
        blob = new javax.sql.rowset.serial.SerialBlob(bytes);
      } catch (SerialException e) {
        e.printStackTrace();
      } catch (SQLException e) {
        e.printStackTrace();
      }
      
      InputStream inputStream = null;
      try {
        inputStream = blob.getBinaryStream();
      } catch (SQLException e) {
        e.printStackTrace();
      }
      
      int fileLength = inputStream.available();
      
      // set content properties and header attributes for the response
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Expose-Headers", "Accept-Ranges");
      response.setContentType("text/html");
      response.setContentLength(fileLength);

      OutputStream outStream = response.getOutputStream();
       
      byte[] buffer = new byte[BUFFER_SIZE];
      int bytesRead = -1;
      
      while ((bytesRead = inputStream.read(buffer)) != -1) {
        outStream.write(buffer, 0, bytesRead);
      }
      
      inputStream.close();
      outStream.close();
    }
  }
  
  public static String getHtmlTemplate(Map<String, Object> templateData) throws IOException, TemplateException {
    String templateHtml = null;
    Configuration cfg = new Configuration();
    
    URL url = DocumentShareServlet.class.getResource("/meta-templates");
    cfg.setDirectoryForTemplateLoading(new File(url.getPath()));

    Template template = cfg.getTemplate("ShareMetaTags.ftl");
    
    // Build the data-model.
    StringWriter stringwriter = new StringWriter();
    template.process(templateData, stringwriter);
    
    templateHtml = stringwriter.toString();
    
    return templateHtml;
  }
  
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
