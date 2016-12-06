package slidepiper.customer_servlets;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;

@SuppressWarnings("serial")
@WebServlet(ConfigProperties.FILE_VIEWER_PATH)
public class FileViewerServlet extends HttpServlet {
  
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    
	String fileLinkHash = request.getParameter("f");
	
	Map<String, String> eventDataMap = new HashMap<String, String>();
	eventDataMap.put("msg_id", fileLinkHash);
	eventDataMap.put("session_id", "-1");
	eventDataMap.put("param_1_varchar", request.getRemoteAddr());
	eventDataMap.put("param_2_varchar", request.getHeader("User-Agent"));
	eventDataMap.put("param_3_varchar", request.getHeader("referer"));
	
	switch(DbLayer.getFileWhiteListFlag(fileLinkHash)) {
	
		// File does not exist.
		case 1:
			
			// Redirect to SP broken link page.
			eventDataMap.put("param_4_varchar", ConfigProperties.getProperty("file_viewer_broken_link"));
			DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_document_not_exists"), eventDataMap);
			response.sendRedirect(ConfigProperties.getProperty("file_viewer_broken_link"));
			break;
		
		// File is not whitelisted.
		case 2:
			if (isUnsupportedBrowser(request.getHeader("User-Agent"))) {
				String redirectLink = null;
				String fileLink = DbLayer.getFileLinkFromFileLinkHash(fileLinkHash);
				String documentUrl = DbLayer.getAlternativeUrlFromFileLinkHash(fileLinkHash);
				
				if (null != fileLink && ! fileLink.equals("")) {
					redirectLink = fileLink;
				} else if (null != documentUrl && ! documentUrl.equals("")) {
				  redirectLink = documentUrl;
				} else {
					redirectLink = ConfigProperties.getProperty("app_url");
				}
				
				// Redirect to specified location.
				eventDataMap.put("param_4_varchar", redirectLink);
				DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_unsupported_browser"), eventDataMap);
				response.sendRedirect(redirectLink);
			} else {
			
				// Continue to view file.
				DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_document_exists"), eventDataMap);
				request.getRequestDispatcher(ConfigProperties.getProperty("file_viewer")).forward(request, response);
			}
			break;
		
		// File is whitelisted.
		case 3:
			
			// Check if request IP matches IP in ip_whitelist table.
			if (DbLayer.isIPMatchClientIP(fileLinkHash, request.getRemoteAddr())) {
				if (isUnsupportedBrowser(request.getHeader("User-Agent"))) {
					String redirectLink = null;
					String fileLink = DbLayer.getFileLinkFromFileLinkHash(fileLinkHash);
					String documentUrl = DbLayer.getAlternativeUrlFromFileLinkHash(fileLinkHash);
					
					if (null != fileLink && ! fileLink.equals("")) {
						redirectLink = fileLink;
					} else if (null != documentUrl && ! documentUrl.equals("")) {
	          redirectLink = documentUrl;
	        } else {
						redirectLink = ConfigProperties.getProperty("app_url");
					}
					
					// Redirect to specified location.
					eventDataMap.put("param_4_varchar", redirectLink);
					DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_unsupported_browser"), eventDataMap);
					response.sendRedirect(redirectLink);
				} else {

					// Continue to view file.
					DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_document_exists"), eventDataMap);
					request.getRequestDispatcher(ConfigProperties.getProperty("file_viewer")).forward(request, response);
				}
				
			} else {
				
				// Redirect to SP ip restricted page.
				String ipRestrictedDocumentLink = ConfigProperties.getProperty("file_viewer_ip_restricted");
				eventDataMap.put("param_4_varchar", ipRestrictedDocumentLink);
				
				DbLayer.setEvent("customer_events", ConfigProperties.getProperty("init_ip_not_whitelisted"), eventDataMap);
				response.sendRedirect(ConfigProperties.getProperty("file_viewer_ip_restricted"));
			}
			break;
	}
  }
  
  
  /**
   * Check if the browser is unsupported by our application.
   */
  public static boolean isUnsupportedBrowser(String userAgent) {
	  boolean isUnsupportedBrowser = false;
	  
	  String[] outdatedIEVersions = new String[5];
	  outdatedIEVersions[0] = "MSIE 9.0";
	  outdatedIEVersions[1] = "MSIE 8.0";
	  outdatedIEVersions[2] = "MSIE 7.0";
	  outdatedIEVersions[3] = "MSIE 6.0";
	  outdatedIEVersions[4] = "MSIE 5.0";
	  for (int i = 0; i < outdatedIEVersions.length; i++) {
		  if (userAgent.contains(outdatedIEVersions[i])) {
			  isUnsupportedBrowser = true;
			  break;
		  }
	  }
	  
	  return isUnsupportedBrowser;
  }
}