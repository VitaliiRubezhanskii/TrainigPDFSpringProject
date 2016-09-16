package slidepiper.customer_servlets;

import java.io.IOException;

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
	
	switch(DbLayer.getFileWhiteListFlag(fileLinkHash)) {
	
		// File does not exist.
		case 1:
			
			// Redirect to SP broken link page.
			response.sendRedirect(ConfigProperties.getProperty("file_viewer_broken_link"));
			break;
		
		// File is not whitelisted.
		case 2:
			
			// Continue to view file.
			request.getRequestDispatcher(ConfigProperties.getProperty("file_viewer")).forward(request, response);
			break;
		
		// File is whitelisted.
		case 3:
			
			// Check if request IP matches IP in ip_whitelist table.
			if (DbLayer.isIPMatchClientIP(fileLinkHash, request.getRemoteAddr())) {

				// Get user agent.
				String userAgent = request.getHeader("User-Agent");
				
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
				
				if (isUnsupportedBrowser) {
					String redirectLink = null;
					String fileLink = DbLayer.getFileLinkFromFileLinkHash(fileLinkHash);
					
					if (null != fileLink && ! fileLink.equals("")) {
						redirectLink = fileLink;
					} else {
						redirectLink = ConfigProperties.getProperty("app_url");
					}
					
					// Redirect to specified location. 
					response.sendRedirect(redirectLink);
				} else {

					// Continue to view file.
					request.getRequestDispatcher(ConfigProperties.getProperty("file_viewer")).forward(request, response);
				}
				
			} else {
				
				// Redirect to SP ip restricted page. 
				response.sendRedirect(ConfigProperties.getProperty("file_viewer_ip_restricted"));
			}
			break;
	}
  }
}