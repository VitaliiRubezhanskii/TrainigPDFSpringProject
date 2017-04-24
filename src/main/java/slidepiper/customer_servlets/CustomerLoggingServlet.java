package slidepiper.customer_servlets;

import com.slidepiper.model.component.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;
import slidepiper.email.EmailSender;
import slidepiper.integration.HubSpot;
import slidepiper.logging.CustomerLogger;
import slidepiper.salesman_servlets.Geolocation;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// write tracking info on customer viewing the presentation.
@WebServlet("/CustomerDataServlet")
public class CustomerLoggingServlet extends HttpServlet {
  private static final Logger log = LoggerFactory.getLogger(CustomerLoggingServlet.class);  
  // size of byte buffer to send file
    private static final int BUFFER_SIZE = 4096;   
     
         
    	protected void doPost(HttpServletRequest request,
                HttpServletResponse response) throws ServletException, IOException {			           
//			   			System.out.println("custdataservlet dopost");
          	  response.setHeader("Access-Control-Allow-Origin", request.getHeader("origin"));
              response.setHeader("Access-Control-Allow-Credentials", "true");
    	        
    					DbLayer.init(); //make sure it's initialized (includes constants)
			    		String id, event_name, param1, param2, param3, param11, sessionId;
			    		
			    		id = request.getParameter("id");
			    		event_name = request.getParameter("event_name");
			    		param1 = request.getParameter("param1");
			    		param2 = request.getParameter("param2");
			    		param3 = request.getParameter("param3");
			    		param11 = request.getParameter("param11");
			    		sessionId = request.getParameter("sessionId");
			    		
			    		String viewerId = null;
			    		try {
                Cookie cookie = Arrays.stream(request.getCookies())
                                    .filter(c -> c.getName().equals("sp.viewer"))
                                    .findFirst()
                                    .orElseThrow(null);

                viewerId = JwtUtils.verify(cookie.getValue())
                               .getClaim("viewerId").asString();
              } catch(NullPointerException e) {
                log.error("viewerId is null");
              }
			    		
			    		int timezone_offset = Integer.parseInt(request.getParameter("timezone_offset_min")); 

			    		String ip = null;
			    		List<String> ipData = null;
			    		
			    		if (event_name.equals("OPEN_SLIDES")) {
			    		  ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
								    .map(x -> x.split(",")[0])
								    .orElse(request.getRemoteAddr());

			    		  ipData = Geolocation.ipData(ip);
			    		  
			    		  CustomerLogger.LogEvent(id, event_name, param1, param2, param3, sessionId, timezone_offset,
	                  ip, ipData.get(0), ipData.get(1), ipData.get(2), ipData.get(3), ipData.get(4), ipData.get(5),
	                  ipData.get(6), ipData.get(7), ipData.get(8), param11, viewerId);
			    		} else {
			    		  CustomerLogger.LogEvent(id, event_name, param1, param2, param3, sessionId, timezone_offset,
                    null, null, null, null, null, null, null, null, null, null, null, viewerId);
			    		}
			    		
							/// send email if opened presentation
			    		String salesmanEmail = DbLayer.getSalesmanEmailFromMsgId(id);
			    		String customerEmail = DbLayer.getCustomerEmailFromFileLinkHash(id);
			    		
			    		Map<String, Object> docSettings = new HashMap<String, Object>();
			    		docSettings = DbLayer.getSalesman(salesmanEmail);
			    		// Get salesman details, check if email_alert_enabled is true/false
			    		
			    		if (event_name.equalsIgnoreCase("OPEN_SLIDES")) {
  			    		if ((Boolean)docSettings.get("email_alert_enabled")
  			    		    && ! customerEmail.equals(ConfigProperties.getProperty("test_customer_email"))) {
    							System.out.println("open slides event - sending email alert");
							try {
								EmailSender.sendAlertEmail(id, sessionId);
							} catch (URISyntaxException e) {
								e.printStackTrace();
							}
						}	else {
  			    			System.out.println("SP: Didn't send alert email");
  			    		}
  			    		
  			    		if (! customerEmail.equals(ConfigProperties.getProperty("test_customer_email"))) {
    			    		
    			    		// Set Timeline event for HubSpot.
    			    		Map<String, Object> userData = DbLayer.getSalesman(salesmanEmail);
    			    		int userId = (int) userData.get("id");
    			    		
    			    		Map<String, String> documentProperties = DbLayer.getFileMetaData(id);
                  String documentName = documentProperties.get("fileName");
                  
                  Long timestamp = DbLayer.getCustomerEventTimstamp(sessionId, "OPEN_SLIDES", id).getTime();
                  
    			    		String HubSpotAccessToken = DbLayer.getAccessToken(userId, "hubspot");
    			    		if (HubSpotAccessToken != null) {
    			    		  HubSpot.setTimelineEvent(HubSpotAccessToken, timestamp, sessionId, customerEmail, documentName, null);
    			    		}
  			    		}
    	        }
    	}
}


