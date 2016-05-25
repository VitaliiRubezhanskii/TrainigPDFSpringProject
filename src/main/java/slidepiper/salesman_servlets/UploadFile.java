package slidepiper.salesman_servlets;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;

import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

@SuppressWarnings("serial")
@WebServlet("/upload-file")
@MultipartConfig(maxFileSize = 104857600)
public class UploadFile extends HttpServlet {
    
  protected void doPost(HttpServletRequest request,
      HttpServletResponse response) throws ServletException, IOException {
    
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
    
    // Parse the request
    try {
      List<FileItem> items = upload.parseRequest(request);
      String action = null;
      String updateFileHash = null;
      String salesmanEmail = null;
      Timestamp localTimestamp = null;
      
      /**
       * The redundancy (by having this another for loop) is to ensure capturing the salesman email
       * before calling setFileHash(), as we cannot control where the salesman email field would be
       * set in the frontend form.
       * 
       * @author Yaniv Friedensohn <yanivf@slidepiper.com>
       */
      for (FileItem file: items) {
        if (file.getFieldName().equals("action")) {
          action = file.getString();
        } else if (file.getFieldName().equals("updateFileHash")) {
          updateFileHash = file.getString();
        } else if (file.getFieldName().equals("salesmanEmail")) {
          salesmanEmail = file.getString();
        } else if (file.getFieldName().equals("localTimestamp")){
          localTimestamp = new Timestamp(Long.parseLong(file.getString()));
        	//localTimestamp = ;
        }
       
      }
      
      Map<String, String> eventDataMap = new HashMap<String, String>();
      
      if (action.equals("uploadFiles")) {
        String fileHash = null;
        boolean isDefaultCustomerEmailExist = false;
        String defaultCustomerEmail = ConfigProperties.getProperty("default_customer_email");
        
        for (FileItem file: items) {       
          if (null != file.getContentType() && file.getContentType().equals("application/pdf")) {         
            fileHash = DbLayer.setFileHash(file, salesmanEmail, localTimestamp);
            
            // Set default customer for the salesman if not exist.
            if (false == isDefaultCustomerEmailExist) {
              if (false == DbLayer.isCustomerExist(salesmanEmail, defaultCustomerEmail)) {  
                DbLayer.addNewCustomer(null, salesmanEmail, "Generic", "Link", null, defaultCustomerEmail);
              }
              isDefaultCustomerEmailExist = true;
            }
            
            // Set file link hash for the salesman default customer.
            DbLayer.setFileLinkHash(defaultCustomerEmail, fileHash, salesmanEmail);
            
            // Record event.
            if (null != fileHash) {
              eventDataMap.put("email", salesmanEmail);
              
              eventDataMap.put("param_1_varchar", salesmanEmail);
              eventDataMap.put("param_2_varchar", fileHash);
              eventDataMap.put("param_3_varchar", Paths.get(file.getName()).getFileName().toString());
              eventDataMap.put("param_4_varchar", Long.toString(file.getSize()));
              
              DbLayer.setEvent(DbLayer.SALESMAN_EVENT_TABLE,
                  ConfigProperties.getProperty("event_uploaded_file"), eventDataMap);
            }
          }
        }
      } else if (action.equals("updateFile")) {
        for (FileItem file: items) {       
          if (null != file.getContentType() && file.getContentType().equals("application/pdf")) {  
            
            // Update file.
            DbLayer.updateFile(file, updateFileHash,
                Paths.get(file.getName()).getFileName().toString(), salesmanEmail);
            
            // Record event.
            eventDataMap.put("email", salesmanEmail);
            
            eventDataMap.put("param_1_varchar", salesmanEmail);
            eventDataMap.put("param_2_varchar", updateFileHash);
            eventDataMap.put("param_3_varchar", Paths.get(file.getName()).getFileName().toString());
            eventDataMap.put("param_4_varchar", Long.toString(file.getSize()));
            
            DbLayer.setEvent(DbLayer.SALESMAN_EVENT_TABLE,
                ConfigProperties.getProperty("event_updated_file"), eventDataMap);
          }
        }
      }
    } catch (FileUploadException e) {
      e.printStackTrace();
    }
    
    getServletContext().getRequestDispatcher("/uploadmessage.html").forward(request, response);
  }
}
