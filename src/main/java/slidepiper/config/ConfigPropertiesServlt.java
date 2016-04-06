package slidepiper.config;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import slidepiper.db.DbLayer;
import slidepiper.email.EmailSender;

@SuppressWarnings("serial")
@WebServlet("/config")
public class ConfigPropertiesServlt extends HttpServlet {

	/*
	 * Create a JSON object given selected config.properties file properties.
	 * Print the created object given a GET request. 
	 */
	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws IOException, ServletException {
	  
		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();
		
		try {
		  JSONObject data = new JSONObject();
		  JSONObject email = new JSONObject();
		  JSONObject google = new JSONObject();
		  String salesmanEmail = request.getParameter("salesmanEmail");
			
		  data.put("appUrl", ConfigProperties.getProperty("app_url"));
		  data.put("viewerUrlWithoutFileLink",
		      ConfigProperties.getProperty("viewer_url", salesmanEmail)
          + ConfigProperties.FILE_VIEWER_PATH + "?"
          + ConfigProperties.getProperty("file_viewer_query_parameter") + "=");
		  data.put("webSocketsUrl", ConfigProperties.getProperty("websockets_url"));
		  data.put("salesman", DbLayer.getSalesman(salesmanEmail));
		  
		  google.put("clientId", ConfigProperties.getProperty("google_client_id"));
      google.put("scopes", ConfigProperties.getProperty("google_scopes")); 
      data.put("google", google);
	    
      email.put("defaultCustomerEmail", ConfigProperties.getProperty("default_customer_email"));
      email.put("mergeTagStartCharacter", ConfigProperties.getProperty("merge_tag_start_character")); 
	    email.put("mergeTagEndCharacter", ConfigProperties.getProperty("merge_tag_end_character"));
	    email.put("mergeTagDelimiter", ConfigProperties.getProperty("merge_tag_delimiter"));
	    email.put("mergeTagFile", EmailSender.MERGE_TAG_FILE);
	    email.put("mergeTagFirstName", EmailSender.MERGE_TAG_FIRST_NAME);
	    email.put("mergeTagLastName", EmailSender.MERGE_TAG_LAST_NAME);
	    email.put("mergeTagSalesmanFirstName", EmailSender.MERGE_TAG_SALESMAN_FIRST_NAME);
	    email.put("mergeTagSalesmanLastName", EmailSender.MERGE_TAG_SALESMAN_LAST_NAME);
	    data.put("email", email);
	    
			out.println(data);
		} catch (Exception e) {
			throw new ServletException(e);
		} finally {
			out.close();
		}
	}
}