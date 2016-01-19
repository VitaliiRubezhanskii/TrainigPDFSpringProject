package slidepiper.config;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

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
	
		response.setContentType("application/json");
		PrintWriter out = response.getWriter();
		
		try {
		  JSONObject data = new JSONObject();
		  JSONObject email = new JSONObject();
		  JSONObject google = new JSONObject();
			
		  data.put("appUrl", ConfigProperties.getProperty("app_url"));
		  data.put("webSocketsUrl", ConfigProperties.getProperty("websockets_url"));
		  
		  google.put("clientId", ConfigProperties.getProperty("google_client_id"));
      google.put("scopes", ConfigProperties.getProperty("google_scopes")); 
      data.put("google", google);
	    
	    email.put("mergeTagStartCharacter", ConfigProperties.getProperty("merge_tag_start_character")); 
	    email.put("mergeTagEndCharacter", ConfigProperties.getProperty("merge_tag_end_character"));
	    email.put("mergeTagDelimiter", ConfigProperties.getProperty("merge_tag_delimiter"));
	    email.put("mergeTagFile", EmailSender.MERGE_TAG_FILE);
	    data.put("email", email);
	    
			out.println(data);
		} catch (Exception e) {
			throw new ServletException(e);
		} finally {
			out.close();
		}
	}
}
