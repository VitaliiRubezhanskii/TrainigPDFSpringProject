package slidepiper.salesman_servlets;

import java.io.IOException;

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
		
		CSVParser parser = CSVParser.parse(IOUtils.toString(filePart.getInputStream()), CSVFormat.DEFAULT);
    for (CSVRecord csvRecord : parser) {
      if (1 < csvRecord.getRecordNumber() && 4 <= csvRecord.size()
          && isValidEmailAddress(csvRecord.get(2).trim())) {
        DbLayer.addNewCustomer(salesman_email, csvRecord.get(0).trim(), csvRecord.get(1).trim(),
            csvRecord.get(3).trim(), csvRecord.get(2).trim());
      }
    }
		
    getServletContext().getRequestDispatcher("/uploadcustomersmessage.html").forward(request, response);
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