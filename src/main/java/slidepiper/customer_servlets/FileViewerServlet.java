package slidepiper.customer_servlets;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import slidepiper.config.ConfigProperties;

@SuppressWarnings("serial")
@WebServlet(ConfigProperties.FILE_VIEWER_PATH)
public class FileViewerServlet extends HttpServlet {
  
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    
    request.getRequestDispatcher(ConfigProperties.getProperty("file_viewer")).forward(request, response);
  }
}