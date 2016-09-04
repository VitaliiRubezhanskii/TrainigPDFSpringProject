package slidepiper.config;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringEscapeUtils;
import org.json.JSONObject;

import slidepiper.db.DbLayer;

@SuppressWarnings("serial")
@WebServlet("/config-viewer")
public class ConfigViewerServlt extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException {
  
    response.setContentType("application/json; charset=UTF-8");
    PrintWriter out = response.getWriter();
    
    if (null != request.getParameter("linkHash")
        && ! request.getParameter("linkHash").isEmpty()) {
      
      String fileLinkHash = request.getParameter("linkHash");
      
      try {
        JSONObject config = new JSONObject();
        config.put("appUrl", ConfigProperties.getProperty("app_url"));
        
        String salesmanEmail = DbLayer.getSalesmanEmailFromMsgId(fileLinkHash);
        Map<String, Object> salesman = DbLayer.getSalesman(salesmanEmail);
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
        viewer.put("toolbarLogoCollapseMaxWidth",
            salesman.get("viewer_toolbar_logo_collapse_max_width"));
        
        if (null != salesman.get("viewer_is_chat_enabled")) {
      	viewer.put("isChatEnabled", Boolean.parseBoolean(salesman.get("viewer_is_chat_enabled").toString()));
        } else {
      	viewer.put("isChatEnabled", false);
        }
        
        if (null != salesman.get("viewer_is_chat_open")) {
        	viewer.put("isChatOpen", Boolean.parseBoolean(salesman.get("viewer_is_chat_open").toString()));
        } else {
        	viewer.put("isChatOpen", false);
        }
        
        viewer.put("isYoutubeVideo", Boolean.parseBoolean(salesman.get("viewer_widget1_is_youtube_video").toString()));
        
        
        // Presentation & Download Settings.
        viewer.put("isMobileToolbarSecondaryPresentationEnabled",
        		salesman.get("viewer_toolbar_secondary_is_mobile_presentation_enabled"));
        viewer.put("isMobileToolbarSecondaryDownloadEnabled",
        		salesman.get("viewer_toolbar_secondary_is_mobile_download_enabled"));
        
        
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
        if (null != salesman.get("viewer_toolbar_cta1_is_enabled")) {
    	    viewer.put("isCta1Enabled", Boolean.parseBoolean(salesman.get("viewer_toolbar_cta1_is_enabled").toString()));
    	  } else {
    	    viewer.put("isCta1Enabled", false);
    	  }
        
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
        if (null != salesman.get("viewer_toolbar_cta2_is_enabled")) {
    	    viewer.put("isCta2Enabled", Boolean.parseBoolean(salesman.get("viewer_toolbar_cta2_is_enabled").toString()));
    	  } else {
    	    viewer.put("isCta2Enabled", false);
    	  }
        
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
        if (null != salesman.get("viewer_toolbar_cta3_is_enabled")) {
    	    viewer.put("isCta3Enabled", Boolean.parseBoolean(salesman.get("viewer_toolbar_cta3_is_enabled").toString()));
    	  } else {
    	    viewer.put("isCta3Enabled", false);
    	  }
        
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
        
        // Widget1.
        JSONObject widget1 = new JSONObject();
        widget1.put("isEnabled",
            salesman.get("viewer_widget1_is_enabled"));
        if ((Boolean) salesman.get("viewer_widget1_is_enabled")) {
          widget1.put("title",
              salesman.get("viewer_widget1_title"));
          widget1.put("iframeSrc",
              salesman.get("viewer_widget1_iframe_src"));
          widget1.put("pageNumber",
              salesman.get("viewer_widget1_page_number"));
        }
        viewer.put("widget1", widget1);
        
        // Widget2.
        JSONObject widget2 = new JSONObject();
        widget2.put("isEnabled",
            salesman.get("viewer_widget2_is_enabled"));
        if ((Boolean) salesman.get("viewer_widget2_is_enabled")) {
          widget2.put("title",
              salesman.get("viewer_widget2_title"));
          widget2.put("iframeSrc",
              salesman.get("viewer_widget2_iframe_src"));
          widget2.put("pageNumber",
              salesman.get("viewer_widget2_page_number"));
        }
        viewer.put("widget2", widget2);
        
        // File meta data.
        JSONObject file = new JSONObject();
        file.put("fileName", 
            StringEscapeUtils.escapeHtml4(
                DbLayer.getFileMetaData(fileLinkHash).get("fileName")));
        viewer.put("file", file);
        
        config.put("viewer", viewer);
        out.println(config);
      } catch (Exception e) {
        throw new ServletException(e);
      } finally {
        out.close();
      }
    }
  }
}
