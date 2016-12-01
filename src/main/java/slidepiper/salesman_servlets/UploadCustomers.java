package slidepiper.salesman_servlets;

import slidepiper.db.DbLayer;

import java.util.List;
import java.io.*;
import java.nio.charset.Charset;

import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.input.BOMInputStream;
import org.json.JSONObject;

//upload CSV file of customers
@SuppressWarnings("serial")
@WebServlet("/uploadCustomers")
@MultipartConfig(maxFileSize = 16177215)	// upload file's size up to 16MB
public class UploadCustomers extends HttpServlet {
		
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

    String salesman_email = null;
    InputStream fileInputStram = null;
    try {
      List<FileItem> items = upload.parseRequest(request);
      
      for (FileItem file: items) {
        if (file.getFieldName().equals("salesman_email_for_csv")) {
          salesman_email = file.getString();
        } else if (file.getFieldName().equals("filecsv")) {
          fileInputStram = file.getInputStream();
        }
      }
    } catch (FileUploadException e) {
      e.printStackTrace();
    }
		
		System.out.println("uploadCustomers servlet Parameters - email " + salesman_email );
		//" name of pres: " + name);
		
		BOMInputStream fileBomInputStream = new BOMInputStream(fileInputStram, false);
		Charset charset = null;
		if (fileBomInputStream.hasBOM()) {
		  charset = Charset.forName("UTF-8");
		} else {
		  charset = Charset.forName("ISO-8859-8");
		}
    
		CSVParser parser = CSVParser.parse(
		    IOUtils.toString(fileBomInputStream, charset),
		    CSVFormat.DEFAULT);
		
		int flag = -1;
		int firstNameIndex = -1;
  	int lastNameIndex = -1;
  	int emailIndex = -1;
  	int companyIndex = -1;
  	int groupIndex = -1;
  	
    for (CSVRecord csvRecord : parser) {
    	
    	if (1 == csvRecord.getRecordNumber()) {
    		for (int i = 0; i < csvRecord.size(); i++) {
    			if (csvRecord.get(i).equalsIgnoreCase("First Name") || csvRecord.get(i).equalsIgnoreCase("Given Name")){
    				firstNameIndex = i;
    			}
    			if (csvRecord.get(i).equalsIgnoreCase("Last Name") || csvRecord.get(i).equalsIgnoreCase("Surname") || csvRecord.get(i).equalsIgnoreCase("Family Name")){
    				lastNameIndex = i;
    			}
    			if (csvRecord.get(i).equalsIgnoreCase("Company") || csvRecord.get(i).equalsIgnoreCase("Organization 1 - Name")){
    				companyIndex = i;
    			}
    			if (csvRecord.get(i).equalsIgnoreCase("Group")){
            groupIndex = i;
          }
    			if (csvRecord.get(i).equalsIgnoreCase("E-mail Address") || csvRecord.get(i).equalsIgnoreCase("E-mail") || csvRecord.get(i).equalsIgnoreCase("Email") || csvRecord.get(i).equalsIgnoreCase("E-mail 1 - Value") ){
    				emailIndex = i;
    			}
    		}
    	}
    	
    	
    	System.out.println("First: " + firstNameIndex + ", Last: " + lastNameIndex  + ", Company: " + companyIndex + ", Group: " + groupIndex + ", Email: " + emailIndex);

    	if (-1 == firstNameIndex || -1 == lastNameIndex || -1 == emailIndex || -1 == companyIndex || -1 == groupIndex){
			JSONObject dataErr = new JSONObject();
			dataErr.put("err", true);
		    
		    response.setContentType("application/json; charset=UTF-8");
		    PrintWriter output = response.getWriter();
		    output.print(dataErr);
		    output.close();
    	}
    	else {
    		flag = 0;	
    	      System.out.println("First Name: " + csvRecord.get(firstNameIndex));
    	      System.out.println("Last Name: " + csvRecord.get(lastNameIndex));
    	      System.out.println("Company: " + csvRecord.get(companyIndex));
    	      System.out.println("Group: " + csvRecord.get(groupIndex));
    	      System.out.println("Email: " + csvRecord.get(emailIndex));
    	      if (0 <= flag && 1 < csvRecord.getRecordNumber()) {
    	        if (isValidEmailAddress(csvRecord.get(emailIndex).trim())) {
    	          DbLayer.addNewCustomer(null, salesman_email, csvRecord.get(firstNameIndex).trim(), csvRecord.get(lastNameIndex).trim(),
    	              csvRecord.get(companyIndex).trim(), csvRecord.get(groupIndex).trim(), csvRecord.get(emailIndex).trim());
    	        } else {
    	          flag++;
    	        }
    	      }
    	      JSONObject data = new JSONObject();
	      	    data.put("flag", flag);
	      	    
	      	    response.setContentType("application/json; charset=UTF-8");
	      	    PrintWriter output = response.getWriter();
	      	    output.print(data);
	      	    output.close();
    	    }
    	    
    			
    	    
    		
    	}
      
	}
	
	
	/**
	 * Check weather an email address is valid or not.
	 * 
	 * @see http://stackoverflow.com/questions/624581/what-is-the-best-java-email-address-validation-method
	 * 
	 * @param email The tested email address.
	 * 
	 * @return True if email is a valid email address, false otherwise.
	 */
	public static boolean isValidEmailAddress(String email) {
	   boolean result = true;
	   try {
	      InternetAddress emailAddr = new InternetAddress(email);
	      emailAddr.validate();
	   } catch (AddressException ex) {
	      result = false;
	   }
	   return result;
	}
}