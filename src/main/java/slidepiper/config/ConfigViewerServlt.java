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
      
      viewer.put("toolbarBackground",
          salesman.get("viewer_toolbar_background"));
      viewer.put("toolbarButtonBackground",
          salesman.get("viewer_toolbar_button_background"));
      viewer.put("toolbarButtonHoverBackground",
          salesman.get("viewer_toolbar_button_hover_background"));
      viewer.put("toolbarButtonBorder",
          salesman.get("viewer_toolbar_button_border"));
      viewer.put("toolbarButtonHoverBorder",
          salesman.get("viewer_toolbar_button_hover_border"));
      viewer.put("toolbarButtonBoxShadow",
          salesman.get("viewer_toolbar_button_box_shadow"));
      viewer.put("toolbarButtonHoverBoxShadow",
          salesman.get("viewer_toolbar_button_hover_box_shadow"));
      viewer.put("toolbarWebFontFamilies",
          salesman.get("viewer_toolbar_web_font_families"));
      viewer.put("toolbarFont",
          salesman.get("viewer_toolbar_font"));
      viewer.put("toolbarColor",
          salesman.get("viewer_toolbar_color"));
      viewer.put("toolbarFindColor",
          salesman.get("viewer_toolbar_find_color"));
      viewer.put("toolbarFindBackground",
          salesman.get("viewer_toolbar_find_background"));
      viewer.put("toolbarLogoImage",
          salesman.get("viewer_toolbar_logo_image"));
      viewer.put("toolbarLogoLink",
          salesman.get("viewer_toolbar_logo_link"));
      viewer.put("isChatEnabled",
          Boolean.parseBoolean(salesman.get("viewer_is_chat_enabled")));
      viewer.put("isChatOpen",
          Boolean.parseBoolean(salesman.get("viewer_is_chat_open")));
      
      // CTA buttons.
      viewer.put("toolbarCtaBorderRadius",
          salesman.get("viewer_toolbar_cta_border_radius"));
      viewer.put("toolbarCtaFont",
          salesman.get("viewer_toolbar_cta_font"));
      viewer.put("toolbarCtaMargin",
          salesman.get("viewer_toolbar_cta_margin"));
      viewer.put("toolbarCtaPadding",
          salesman.get("viewer_toolbar_cta_padding"));
      
      // CTA1.
      viewer.put("isCta1Enabled",
          Boolean.parseBoolean(salesman.get("viewer_toolbar_cta1_is_enabled")));
      viewer.put("cta1CollapseMaxWidth",
          salesman.get("viewer_toolbar_cta1_collapse_max_width"));
      viewer.put("toolbarCta1Background",
          salesman.get("viewer_toolbar_cta1_background"));
      viewer.put("toolbarCta1HoverBackground",
          salesman.get("viewer_toolbar_cta1_hover_background"));
      viewer.put("toolbarCta1Border",
          salesman.get("viewer_toolbar_cta1_border"));
      viewer.put("toolbarCta1HoverBorder",
          salesman.get("viewer_toolbar_cta1_hover_border"));
      viewer.put("toolbarCta1Color",
          salesman.get("viewer_toolbar_cta1_color"));
      viewer.put("toolbarCta1HoverColor",
          salesman.get("viewer_toolbar_cta1_hover_color"));
      viewer.put("toolbarCta1Text",
          salesman.get("viewer_toolbar_cta1_text"));
      viewer.put("toolbarCta1Link",
          salesman.get("viewer_toolbar_cta1_link"));
      
      // CTA2.
      viewer.put("isCta2Enabled",
          Boolean.parseBoolean(salesman.get("viewer_toolbar_cta2_is_enabled")));
      viewer.put("cta2CollapseMaxWidth",
          salesman.get("viewer_toolbar_cta2_collapse_max_width"));
      viewer.put("toolbarCta2Background",
          salesman.get("viewer_toolbar_cta2_background"));
      viewer.put("toolbarCta2HoverBackground",
          salesman.get("viewer_toolbar_cta2_hover_background"));
      viewer.put("toolbarCta2Border",
          salesman.get("viewer_toolbar_cta2_border"));
      viewer.put("toolbarCta2HoverBorder",
          salesman.get("viewer_toolbar_cta2_hover_border"));
      viewer.put("toolbarCta2Color",
          salesman.get("viewer_toolbar_cta2_color"));
      viewer.put("toolbarCta2HoverColor",
          salesman.get("viewer_toolbar_cta2_hover_color"));
      viewer.put("toolbarCta2Text",
          salesman.get("viewer_toolbar_cta2_text"));
      viewer.put("toolbarCta2Link",
          salesman.get("viewer_toolbar_cta2_link"));
      
      // CTA3.
      viewer.put("isCta3Enabled",
          Boolean.parseBoolean(salesman.get("viewer_toolbar_cta3_is_enabled")));
      viewer.put("cta3CollapseMaxWidth",
          salesman.get("viewer_toolbar_cta3_collapse_max_width"));
      viewer.put("toolbarCta3Background",
          salesman.get("viewer_toolbar_cta3_background"));
      viewer.put("toolbarCta3HoverBackground",
          salesman.get("viewer_toolbar_cta3_hover_background"));
      viewer.put("toolbarCta3Border",
          salesman.get("viewer_toolbar_cta3_border"));
      viewer.put("toolbarCta3HoverBorder",
          salesman.get("viewer_toolbar_cta3_hover_border"));
      viewer.put("toolbarCta3Color",
          salesman.get("viewer_toolbar_cta3_color"));
      viewer.put("toolbarCta3HoverColor",
          salesman.get("viewer_toolbar_cta3_hover_color"));
      viewer.put("toolbarCta3Text",
          salesman.get("viewer_toolbar_cta3_text"));
      viewer.put("toolbarCta3Link",
          salesman.get("viewer_toolbar_cta3_link"));
      
      config.put("viewer", viewer);
      out.println(config);
    } catch (Exception e) {
      throw new ServletException(e);
    } finally {
      out.close();
    }
  }
}
