package slidepiper.mgmt_servlets;
 
import java.io.ByteArrayOutputStream;

import slidepiper.*;
import slidepiper.constants.Constants;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
 
@WebServlet("/SalesmanDataServlet")
public class SalesmanDataServlet extends HttpServlet {
 
    // size of byte buffer to send file
    private static final int BUFFER_SIZE = 4096;   
     
    	
    	protected void doPost(HttpServletRequest request,
                HttpServletResponse response) throws ServletException, IOException {
    		String email, event_name, param1, param2, param3;    		
    		email = request.getParameter("email");
    		event_name = request.getParameter("event_name");
    		param1 = request.getParameter("param1");
    		param2 = request.getParameter("param2");
    		param3 = request.getParameter("param3");
    		Constants.updateConstants();
        Connection conn = null; // connection to the database
         
        try {
            // connects to the database
            DriverManager.registerDriver(new com.mysql.jdbc.Driver());
            conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
 						
						String sql = "INSERT INTO salesman_events (email, event_name, param1int, param2float, param3str, notes, timestamp) values (?, ?, ?, ?, ?, '', NOW())";
						PreparedStatement statement = conn.prepareStatement(sql);
						statement.setString(1, email);						
						statement.setString(2, event_name);
						statement.setInt(3, Integer.parseInt(param1));
						statement.setFloat(4, Float.parseFloat(param2));
						statement.setString(5, param3);												
						
						
						// sends the statement to the database server
						int row = statement.executeUpdate();
						if (row > 0) {
							String message = "SalesmanDataServlet. added info line";
							System.out.println(message);
							
						}
			}            
      catch (SQLException ex) {
            ex.printStackTrace();
            response.getWriter().print("SQL Error: " + ex.getMessage());
      		} 
      finally {
            if (conn != null) {
                // closes the database connection
                try {
                    conn.close();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }          
        }
    }
}