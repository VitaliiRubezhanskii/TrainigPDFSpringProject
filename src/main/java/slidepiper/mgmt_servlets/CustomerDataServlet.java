package slidepiper.mgmt_servlets;
 
import java.io.ByteArrayOutputStream;

import slidepiper.*;
import slidepiper.logging.CustomerLogger;

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
  
// write tracking info on customer viewing the presentation.
@WebServlet("/CustomerDataServlet")
public class CustomerDataServlet extends HttpServlet {
 
    // size of byte buffer to send file
    private static final int BUFFER_SIZE = 4096;   
     
         
    	protected void doPost(HttpServletRequest request,
                HttpServletResponse response) throws ServletException, IOException {			           
			   			System.out.println("custdataservlet dopost");			    		
			    		String id, event_name, param1, param2, param3, sessionId;
			    		
			    		id = request.getParameter("id");
			    		event_name = request.getParameter("event_name");
			    		param1 = request.getParameter("param1");
			    		param2 = request.getParameter("param2");
			    		param3 = request.getParameter("param3");
			    		sessionId = request.getParameter("sessionId");
			    		
			    		CustomerLogger.LogEvent(id, event_name, param1, param2, param3, sessionId);    
    	}
}

