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

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;


//upload CSV file of customers
@WebServlet("/uploadCustomers")
@MultipartConfig(maxFileSize = 16177215)	// upload file's size up to 16MB
public class UploadCustomers extends HttpServlet {
		
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		
		Constants.updateConstants();
		String salesman_email = request.getParameter("salesman_email");
		//String name = request.getParameter("name");		
		
		System.out.println("uploadCustomers servlet Parameters - email " + salesman_email );
		//" name of pres: " + name);
			
		InputStream inputStream = null;	// input stream of the upload file
		
		// obtains the upload file part in this multipart request
		Part filePart = request.getPart("file");
		
		System.out.println("req'd file");
		
		if (filePart != null) {
			// prints out some information for debugging
			System.out.println(filePart.getName());
			System.out.println(filePart.getSize());
			System.out.println(filePart.getContentType());
			
			// obtains input stream of the upload file
			inputStream = filePart.getInputStream();
		}
		
		Connection conn = null;	// connection to the database
		String message = null;	// message will be sent back to client
		
		try {
			// connects to the database
			DriverManager.registerDriver(new com.mysql.jdbc.Driver());
			conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);						
			
			if (inputStream != null) {
				// fetches input stream of the upload file for the blob column
				// setBlob not in my jdbc driver, so I get AbstractMethodError
				//statement.setBlob(3, inputStream);

				InputStream in = inputStream;
				
				BufferedReader br = null;
				String line = "";
				String cvsSplitBy = ",";


        br = new BufferedReader(new InputStreamReader(in/*, "UTF-8"*/));
        line = br.readLine(); // read and ignore first line.
				while ((line = br.readLine()) != null) {
				        // use comma as separator
					String[] splitted = line.split(cvsSplitBy);

					if (splitted.length >=3)
						// ignore if not enough in splitted.
					{
							System.out.println("splitted: 0: " + splitted[0] + " 1: "+ splitted[1] + " 2: "+ splitted[2] );
							String custname = splitted[0];
							String email = splitted[1];
							String company = splitted[2];
							
							if (custname.equalsIgnoreCase("")) custname = email;
							if (company.equalsIgnoreCase("")) company = email;
							DbLayer.addNewCustomer(salesman_email, custname, company, email);
					}
					else
					{
						System.out.println("ignoring line with out enough CSV items: " + line );
					}
				}
			} // if
		}  catch (SQLException ex) 
				{
								message = "ERROR: " + ex.getMessage();
								ex.printStackTrace();
				} finally {
								if (conn != null) {
									// closes the database connection
									try {
										conn.close();
									} catch (SQLException ex) {
										ex.printStackTrace();
									}
								}
				 }				
		 			

		// top level in func
			// sets the message in request scope
			request.setAttribute("Message", message);
						
			// back to system page
			getServletContext().getRequestDispatcher("/uploadcustomersmessage.html").forward(request, response);		
	}
}