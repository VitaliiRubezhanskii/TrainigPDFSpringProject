package slidepiper.customer_servlets;
 
import java.io.ByteArrayOutputStream;

import slidepiper.*;
import slidepiper.dataobjects.MessageInfo;
import slidepiper.db.DbLayer;
import slidepiper.email.EmailSender;
import slidepiper.logging.CustomerLogger;
import slidepiper.salesman_servlets.Geolocation;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
  
// write tracking info on customer viewing the presentation.
@WebServlet("/CustomerDataServlet")
public class CustomerLoggingServlet extends HttpServlet {
 
    // size of byte buffer to send file
    private static final int BUFFER_SIZE = 4096;   
     
         
    	protected void doPost(HttpServletRequest request,
                HttpServletResponse response) throws ServletException, IOException {			           
//			   			System.out.println("custdataservlet dopost");
    		
    					DbLayer.init(); //make sure it's initialized (includes constants)
			    		String id, event_name, param1, param2, param3, sessionId;
			    		
			    		id = request.getParameter("id");
			    		event_name = request.getParameter("event_name");
			    		param1 = request.getParameter("param1");
			    		param2 = request.getParameter("param2");
			    		param3 = request.getParameter("param3");
			    		sessionId = request.getParameter("sessionId");
			    		
			    		int timezone_offset = Integer.parseInt(request.getParameter("timezone_offset_min")); 
			    		
			    		String ip = null;
			    		List<String> ipData = null;
			    		if (event_name.equals("OPEN_SLIDES")) {
			    		  ip = Geolocation.getIpFromRequest(request);
			    		  ipData = Geolocation.ipData(ip);
			    		  
			    		  CustomerLogger.LogEvent(id, event_name, param1, param2, param3, sessionId, timezone_offset,
	                  ip, ipData.get(0), ipData.get(1), ipData.get(2), ipData.get(3), ipData.get(4), ipData.get(5),
	                  ipData.get(6), ipData.get(7), ipData.get(8));
			    		} else {
			    		  CustomerLogger.LogEvent(id, event_name, param1, param2, param3, sessionId, timezone_offset,
                    null, null, null, null, null, null, null, null, null, null);
			    		}
			    		
							/// send email if opened presentation
							if (event_name.equalsIgnoreCase("OPEN_SLIDES"))
							{								
									System.out.println("open slides event - sending email alert");
									EmailSender.sendAlertEmail(id, sessionId);
							}				    					    		
    	}
}


