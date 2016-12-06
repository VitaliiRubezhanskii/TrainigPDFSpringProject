package slidepiper.salesman_servlets;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
/*import java.net.URI;
import java.net.URISyntaxException;*/
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
/*import org.apache.commons.io.FilenameUtils;*/

import com.slidepiper.aws.s3.DocumentContainer;
import com.slidepiper.aws.s3.ObjectLinkUtils;
import com.slidepiper.document.DocumentStatus;

import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;

@SuppressWarnings("serial")
@WebServlet("/upload-files")
public class UploadFile extends HttpServlet {

  protected void doPost(HttpServletRequest request,
      HttpServletResponse response) throws ServletException, IOException {
    
    int resultCode = 0;
    
    /**
     * @see https://commons.apache.org/proper/commons-fileupload/using.html
     */
    // Create a factory for disk-based file items
    DiskFileItemFactory factory = new DiskFileItemFactory();

    // Configure a repository (to ensure a secure temp location is used)
    ServletContext servletContext = this.getServletConfig().getServletContext();
    File repository = (File) servletContext.getAttribute("javax.servlet.context.tempdir");
    factory.setRepository(repository);

    // Create a new file upload handler
    ServletFileUpload upload = new ServletFileUpload(factory);
    
    // @see http://stackoverflow.com/questions/5021295/servlet-file-upload-filename-encoding
    upload.setHeaderEncoding("UTF-8");
    
    try {
      List<FileItem> files = new ArrayList<FileItem>();
      List<FileItem> items = upload.parseRequest(request);
      String fileHash = null;
      /*String fileUrl = null;*/
      String salesmanEmail = null;
      String subAction = null;
      
      for (FileItem fileItem: items) {
        if (fileItem.getFieldName().equals("salesmanEmail")) {
          salesmanEmail = fileItem.getString();
        } else if (fileItem.getFieldName().equals("subAction")) {
          subAction = fileItem.getString();
        } else if (fileItem.getFieldName().equals("fileHash")) {
          fileHash = fileItem.getString();
        } /*else if (fileItem.getFieldName().equals("fileUrl")) {
          fileUrl = fileItem.getString();
        }*/ else if (fileItem.getContentType().equals("application/pdf")) {
          files.add(fileItem);
        }
      }
      
      /*if (null != fileUrl) {
        URI uri = new URI(fileUrl);
        String fileExtension = FilenameUtils.getExtension(uri.getPath());
        if (fileExtension.equalsIgnoreCase("pdf")) {
          resultCode = prepareFileUrlUpload(uri, salesmanEmail, fileHash, subAction);
        }
      } else */if (files.size() > 0) {
        resultCode = prepareFileUpload(files, salesmanEmail, fileHash, subAction);
      }
      
      response.setContentType("application/json; charset=UTF-8");
      PrintWriter output = response.getWriter();
      output.print(resultCode);
      output.close();
    } catch(Exception e) {
      e.printStackTrace();
    }
  }
  
  
  /**
   * Uploaded process for URL.
   */
  /*public static int prepareFileUrlUpload(URI uri, String salesmanEmail, String fileHash, String subAction) throws IOException {
    int resultCode = 0;
    URI newUri = null;
    String fileName = null;
    
    if ("www.dropbox.com" == uri.getHost()) {
      try {
        newUri = new URI(uri.getScheme(), "dl.dropboxusercontent.com", uri.getPath());
      } catch (URISyntaxException e) {
        e.printStackTrace();
      }

      fileName = FilenameUtils.getName(uri.getPath());
      if (subAction.equals("upload")) {
        fileHash = setFileHash(salesmanEmail, fileName);
      }
      
      boolean isSet = DbLayer.setAlternativeUrl(newUri.toString(), fileHash, fileName);
      
      if (isSet) {
        // Record event.
        setEvent(salesmanEmail, fileHash, fileName, subAction);
        resultCode = 1;
      }
    }
    
    return resultCode;
  }*/
  
  /**
   * Upload process for S3.
   */
  public static int prepareFileUpload(
      List<FileItem> files, String salesmanEmail, String fileHash, String subAction) throws IOException {
    
    int resultCode = 0;
    String fileName = null;
        
    for (FileItem fileItem: files) {
      fileName = Paths.get(fileItem.getName()).getFileName().toString();
      File file = new File(fileName);
      try {
        fileItem.write(file);
      } catch (Exception e) {
        e.printStackTrace();
      }
      
      // Set document status.
      DocumentStatus documentStatus;
      if (subAction.equals("upload")) {
        fileHash = setFileHash(salesmanEmail, fileName);
        documentStatus = DocumentStatus.CREATED;
      } else {
        documentStatus = DocumentStatus.UPDATED;
      }
      
      // Upload document to AWS S3.
      DocumentContainer document = new DocumentContainer(fileHash, file, fileName);
      String s3ObjectVersionId = document.upload(documentStatus);
      file.delete();
      
      // Save reference to the object in the DB.
      if (s3ObjectVersionId != null) {
        boolean isSet = DbLayer.setS3FileData(
            documentStatus.name(),
            fileHash,
            s3ObjectVersionId,
            ObjectLinkUtils.getDomain(),
            ObjectLinkUtils.getPrefix(),
            fileName
        );
        
        // Record event.
        if (isSet) {
          setEvent(salesmanEmail, fileHash, fileName, subAction);
          resultCode = 1;
        }
      }
    }
    
    return resultCode;
  }
  
  /**
   * Create a file hash for an uploaded file.
   * 
   * @param salesmanEmail - The salesman email
   * @param fileName - The file name
   * @return fileHash - The file hash
   * @throws IOException
   */
  public static String setFileHash(String salesmanEmail, String fileName) throws IOException {
    String fileHash = DbLayer.setFileHash(salesmanEmail, fileName);
    String defaultCustomerEmail = ConfigProperties.getProperty("default_customer_email");
    boolean isDefaultCustomerEmailExist = false;
    
    // Set default customer for the salesman if not exist.
    if (false == isDefaultCustomerEmailExist) {
      if (false == DbLayer.isCustomerExist(salesmanEmail, defaultCustomerEmail)) {  
        DbLayer.addNewCustomer(null, salesmanEmail, "Generic", "Link", null, null, defaultCustomerEmail);
      }
      isDefaultCustomerEmailExist = true;
    }

    // Set file link hash for the salesman default customer.
    DbLayer.setFileLinkHash(defaultCustomerEmail, fileHash, salesmanEmail);
    
    return fileHash;
  }
  
  /**
   * Set salesman event for upload or update file
   * 
   * @param salesmanEmail - The salesman email
   * @param fileHash - The file hash
   * @param fileName - The file name
   * @param subAction - Whether it is an upload or update.
   */
  public static void setEvent(String salesmanEmail, String fileHash, String fileName, String subAction) {
    Map<String, String> eventDataMap = new HashMap<String, String>();
    
    eventDataMap.put("email", salesmanEmail);
    
    eventDataMap.put("param_1_varchar", salesmanEmail);
    eventDataMap.put("param_2_varchar", fileHash);
    eventDataMap.put("param_3_varchar", fileName);
    eventDataMap.put("param_4_varchar", "web_url");
    
    if (subAction.equals("upload")) {
      DbLayer.setEvent(DbLayer.SALESMAN_EVENT_TABLE,
          ConfigProperties.getProperty("event_uploaded_file"), eventDataMap);
    } else {
      DbLayer.setEvent(DbLayer.SALESMAN_EVENT_TABLE,
          ConfigProperties.getProperty("event_updated_file"), eventDataMap);
    }
  }
}