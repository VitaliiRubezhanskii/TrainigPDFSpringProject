package slidepiper.salesman_servlets;

import java.io.IOException;

import slidepiper.*;
import slidepiper.constants.Constants;

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

@WebServlet("/UploadUpdatedSlides")
@MultipartConfig(maxFileSize = 16177215)	// upload file's size up to 16MB
public class UploadUpdatedSlides extends HttpServlet {
		
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		
		Constants.updateConstants();
		String salesman_email = request.getParameter("salesman_email");
		String presentation_id = request.getParameter("presentation_id");		
		
		System.out.println("uploadUpdatedSlides servlet Parameters - email " + salesman_email + " id of pres: " + presentation_id);
			
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
						
			// constructs SQL statement
			String sql = "UPDATE slides SET file = ? where  id = ?";
			PreparedStatement statement = conn.prepareStatement(sql);
			statement.setString(2, presentation_id);
			
			if (inputStream != null) {
				// fetches input stream of the upload file for the blob column
				// setBlob not in my jdbc driver, so I get AbstractMethodError
				//statement.setBlob(3, inputStream);

				InputStream in = inputStream;
				ByteArrayOutputStream bos = new ByteArrayOutputStream();
				int next = in.read();
				while (next > -1) {
						bos.write(next);
						next = in.read();
				}
				bos.flush();
				byte[] result = bos.toByteArray();
				
				/// very slow implementation above - OK for now.
				// copied from http://stackoverflow.com/questions/1264709/convert-inputstream-to-byte-array-in-java
				// maybe take better implementations later.
				
				// setBytes is OK with my jdbc driver.
  			statement.setBytes(1, result);
			}

			// sends the statement to the database server
			int row = statement.executeUpdate();
			if (row > 0) {
				message = "UPDATED Slides file uploaded and saved into database";
			}
		} catch (SQLException ex) {
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
			// sets the message in request scope
			request.setAttribute("Message", message);
			
			// forwards to the message page
			//getServletContext().getRequestDispatcher("/Message.jsp").forward(request, response);

			// back to system page
			getServletContext().getRequestDispatcher("/uploadmessage.html").forward(request, response);
		}
	}
}