package slidepiper.config;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

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
			
			data.put("webSocketsUrl", ConfigProperties.getProperty("websockets_url")); 
			out.println(data);

		} catch (Exception e) {
			throw new ServletException(e);
		} finally {
			out.close();
		}
	}
}
