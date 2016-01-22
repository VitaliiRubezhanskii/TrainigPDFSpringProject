package slidepiper.config;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import slidepiper.db.DbLayer;

@SuppressWarnings("serial")
@WebServlet("/config-viewer")
public class ConfigViewerServlt extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException {
  
    response.setContentType("application/json");
    PrintWriter out = response.getWriter();
    
    try {
      JSONObject config = new JSONObject();
      config.put("appUrl", ConfigProperties.getProperty("app_url"));
      
      String salesmanEmail = DbLayer.getSalesmanEmailFromMsgId(request.getParameter("linkHash"));
      Map<String, String> salesman = DbLayer.getSalesman(salesmanEmail);
      JSONObject viewer = new JSONObject();
      
      viewer.put("toolbarBackgroundImage", 
          salesman.get("viewer_toolbar_background_image"));
      viewer.put("toolbarBackgroundColor",
          salesman.get("viewer_toolbar_background_color"));
      viewer.put("toolbarButtonBackgroundColor",
          salesman.get("viewer_toolbar_button_background_color"));
      viewer.put("toolbarButtonHoverBackgroundColor",
          salesman.get("viewer_toolbar_button_hover_background_color"));
      viewer.put("toolbarButtonBorderColor",
          salesman.get("viewer_toolbar_button_border_color"));
      viewer.put("toolbarButtonHoverBorderColor",
          salesman.get("viewer_toolbar_button_hover_border_color"));
      viewer.put("toolbarButtonBoxShadow",
          salesman.get("viewer_toolbar_button_box_shadow"));
      viewer.put("toolbarButtonHoverBoxShadow",
          salesman.get("viewer_toolbar_button_hover_box_shadow"));
      viewer.put("toolbarWebFontFamilies",
          salesman.get("viewer_toolbar_web_font_families"));
      viewer.put("toolbarFontFamily",
          salesman.get("viewer_toolbar_font_family"));
      viewer.put("toolbarColor",
          salesman.get("viewer_toolbar_color"));
      viewer.put("toolbarLogoImage",
          salesman.get("viewer_toolbar_logo_image"));
      viewer.put("toolbarLogoLink",
          salesman.get("viewer_toolbar_logo_link"));
      config.put("viewer", viewer);
      
      out.println(config);
    } catch (Exception e) {
      throw new ServletException(e);
    } finally {
      out.close();
    }
  }
}
