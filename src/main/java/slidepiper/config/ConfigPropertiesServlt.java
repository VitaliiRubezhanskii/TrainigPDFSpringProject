package slidepiper.config;

import com.slidepiper.model.entity.Event.EventType;
import org.json.JSONObject;
import slidepiper.db.DbLayer;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

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

			Map<String, String> eventTypeMap = new HashMap<String, String>();
			for (EventType eventType: EventType.values()) {
				eventTypeMap.put(eventType.name(), eventType.name());
			}
			data.put("UserEventType", eventTypeMap);

			String salesmanEmail = request.getParameter("salesmanEmail");

			data.put("appUrl", ConfigProperties.getProperty("app_url"));
			data.put("viewerUrlWithoutFileLink",
					ConfigProperties.getProperty("viewer_url", salesmanEmail)
							+ ConfigProperties.FILE_VIEWER_PATH + "?"
							+ ConfigProperties.getProperty("file_viewer_query_parameter") + "=");

			Map<String, Object> salesmanMap = DbLayer.getSalesman(salesmanEmail);
			JSONObject salesman = new JSONObject();
			salesman.put("email", salesmanMap.get("email"));
			salesman.put("name", salesmanMap.get("name"));
			salesman.put("extra_data", salesmanMap.get("extra_data"));
			salesman.put("email_alert_enabled", salesmanMap.get("email_alert_enabled"));
			salesman.put("email_notifications_enabled", salesmanMap.get("email_notifications_enabled"));
			data.put("salesman", salesman);

			out.println(data);
		} catch (Exception e) {
			throw new ServletException(e);
		} finally {
			out.close();
		}
	}
}
