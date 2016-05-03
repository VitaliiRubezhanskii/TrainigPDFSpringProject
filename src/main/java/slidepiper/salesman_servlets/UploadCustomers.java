package slidepiper.salesman_servlets;

import java.io.IOException;
import java.io.PrintWriter;

import slidepiper.*;
import slidepiper.constants.Constants;
import slidepiper.db.DbLayer;

import java.util.Random;
import java.io.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.io.IOUtils;
import org.json.JSONObject;


//upload CSV file of customers
@WebServlet("/uploadCustomers")
@MultipartConfig(maxFileSize = 16177215)	// upload file's size up to 16MB
public class UploadCustomers extends HttpServlet {
		
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		
		String salesman_email = request.getParameter("salesman_email_for_csv");
		//String name = request.getParameter("name");		
		
		System.out.println("uploadCustomers servlet Parameters - email " + salesman_email );
		//" name of pres: " + name);
		
		// obtains the upload file part in this multipart request
		Part filePart = request.getPart("filecsv");
		
		CSVParser parser = CSVParser.parse(IOUtils.toString(filePart.getInputStream(), "UTF-8"),
		    CSVFormat.DEFAULT);
		System.out.println("****Parser: " + parser);
		
		int flag = -1;
		int firstNameIndex = -1;
    	int lastNameIndex = -1;
    	int emailIndex = -1;
    	int companyIndex = -1;
    for (CSVRecord csvRecord : parser) {
    	
    	if (1 == csvRecord.getRecordNumber()){
    		for (int i = 0; i < csvRecord.size(); i++){
    			if (csvRecord.get(i).equalsIgnoreCase("First Name") || csvRecord.get(i).equalsIgnoreCase("Given Name")){
    				firstNameIndex = i;
    			}
    			if (csvRecord.get(i).equalsIgnoreCase("Last Name") || csvRecord.get(i).equalsIgnoreCase("Surname") || csvRecord.get(i).equalsIgnoreCase("Family Name")){
    				lastNameIndex = i;
    			}
    			if (csvRecord.get(i).equalsIgnoreCase("Company") || csvRecord.get(i).equalsIgnoreCase("Organization 1 - Name")){
    				companyIndex = i;
    			}
    			if (csvRecord.get(i).equalsIgnoreCase("E-mail Address") || csvRecord.get(i).equalsIgnoreCase("E-mail") || csvRecord.get(i).equalsIgnoreCase("Email") || csvRecord.get(i).equalsIgnoreCase("E-mail 1 - Value") ){
    				emailIndex = i;
    			}
    		}
    		
    		
    	}
    	
    	
    	System.out.print("First: " + firstNameIndex + ", Last: " + lastNameIndex  + ", Company: " + companyIndex
    	+ ", Email: " + emailIndex);
    	
//      if (1 == csvRecord.getRecordNumber()
//              && csvRecord.get(0).equals("First Name")
//              && csvRecord.get(1).equals("Last Name")
//              && csvRecord.get(2).equals("Company")
//              && csvRecord.get(3).equals("E-mail")) {
//    	  
//    	  
//        
//        flag = 0;
//      }
    	if (-1 == firstNameIndex || -1 == lastNameIndex || -1 == emailIndex || -1 == companyIndex){
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
    	      System.out.println("Email: " + csvRecord.get(emailIndex));
    	      if (0 <= flag && 1 < csvRecord.getRecordNumber()) {
    	        if (isValidEmailAddress(csvRecord.get(emailIndex).trim())) {
    	          DbLayer.addNewCustomer(null, salesman_email, csvRecord.get(firstNameIndex).trim(), csvRecord.get(lastNameIndex).trim(),
    	              csvRecord.get(companyIndex).trim(), csvRecord.get(emailIndex).trim());
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