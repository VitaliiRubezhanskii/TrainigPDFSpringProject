package slidepiper.salesman_servlets;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;

import slidepiper.db.DbLayer;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.json.JSONObject;

@SuppressWarnings("serial")
@WebServlet("/customize-navbar")
@MultipartConfig(maxFileSize = 16777215)
public class CustomizeToolbar extends HttpServlet {
		
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws
				ServletException, IOException {
		
		JSONObject data = new JSONObject();
		System.out.println("Request for Navbar Settings Received");
		String salesman = request.getParameter("salesman");
		ArrayList<Object> navbarSettings = DbLayer.getNavbarSettings(salesman);
		data.put("data", navbarSettings);
		
		response.setContentType("application/json; charset=UTF-8");
	    PrintWriter output = response.getWriter();
	    output.print(data);
	    output.close();
	}
	
	protected void doPost(HttpServletRequest request,
			      HttpServletResponse response) throws ServletException, IOException {
		
			 /**
		     * @see https://commons.apache.org/proper/commons-fileupload/using.html
		     */
		    // Create a factory for disk-based file items
		    DiskFileItemFactory factory = new DiskFileItemFactory();

		    // Configure a repository (to ensure a secure temp location is used)
		    ServletContext servletContext = this.getServletConfig().getServletContext();
		    File repository = (File) servletContext.getAttribute("javax.servlet.context.tempdir");
		    factory.setRepository(repository);

		    // Create a new file upload handler
		    ServletFileUpload upload = new ServletFileUpload(factory);
		    
		    // @see http://stackoverflow.com/questions/5021295/servlet-file-upload-filename-encoding
		    upload.setHeaderEncoding("UTF-8");
		    
		    JSONObject data = new JSONObject();
		    
		    List<FileItem> items;
			try {
				items = upload.parseRequest(request);
				String salesman = null;
				String viewerToolbarBackground = null;
				InputStream viewerToolbarLogoImage = null;
				String viewerToolbarLogoLink = null;
				String viewerToolbarCTABackground = null;
				String viewerToolbarCta2IsEnabled = null;
				String viewerToolbarCta3IsEnabled = null;
				String viewerToolbarCta2Text = null;
				String viewerToolbarCta2Link = null;
				String viewerToolbarCta3Text = null;
				String viewerToolbarCta3Link = null;
				String viewerToolbarTextColor = null;
				String viewerToolbarCTATextColor = null;
				String viewerToolbarCta1IsEnabled = null;
				String viewerToolbarCta1Text = null;
				String viewerToolbarCta1Link = null;
				String viewerToolbarButtonBackground = null;
				
				for (FileItem file: items) {
					if (file.getFieldName().equals("viewer_toolbar_background")) {
						viewerToolbarBackground = file.getString();
						System.out.println("Viewer Toolbar Background: " + viewerToolbarBackground);
					}
					else if (file.getFieldName().equals("viewer_toolbar_cta1_is_enabled")) {
						viewerToolbarCta1IsEnabled = file.getString();
						System.out.println("Cta1 Enabled: " + viewerToolbarCta1IsEnabled);
					}
					else if (file.getFieldName().equals("viewer_toolbar_cta1_text")) {
						viewerToolbarCta1Text = file.getString();
						System.out.println("CTA1 Text: " + viewerToolbarCta1Text);
					}
					else if (file.getFieldName().equals("viewer_toolbar_cta1_link")) {
						viewerToolbarCta1Link = file.getString();
						System.out.println("CTA1 Link: " + viewerToolbarCta1Link);
					}
					else if (file.getFieldName().equals("viewer_toolbar_text_color")) {
						viewerToolbarTextColor = file.getString();
					}
					else if (file.getFieldName().equals("viewer_toolbar_cta_text_color")) {
						viewerToolbarCTATextColor = file.getString();
					}
					else if (file.getFieldName().equals("salesman")) {
						salesman = file.getString();
						System.out.println("User: " + salesman);
					}
					else if (file.getFieldName().equals("viewer_toolbar_logo_image")) {
						if (null != file.getName() && (file.getContentType().equals("image/jpeg") || file.getContentType().equals("image/png"))) {
							viewerToolbarLogoImage = file.getInputStream();
							System.out.println(viewerToolbarLogoImage);
						} 
					}
					else if (file.getFieldName().equals("viewer_toolbar_logo_link")) {
						viewerToolbarLogoLink = file.getString();
						System.out.println("Logo Link: " + viewerToolbarLogoLink);
					}
					else if (file.getFieldName().equals("viewer_toolbar_cta_background")) {
						viewerToolbarCTABackground = file.getString();
						if ("transparent".equals(viewerToolbarCTABackground)) {
							viewerToolbarButtonBackground = "#1B1464";
						} else {
							viewerToolbarButtonBackground = viewerToolbarCTABackground;
						}
						System.out.println("Viewer Toolbar CTA Background: " + viewerToolbarCTABackground);
					}
					else if (file.getFieldName().equals("viewer_toolbar_cta2_is_enabled")) {
						viewerToolbarCta2IsEnabled = file.getString();
						System.out.println("CTA2 Enabled: " + viewerToolbarCta2IsEnabled);
					}
					else if (file.getFieldName().equals("viewer_toolbar_cta3_is_enabled")) {
						viewerToolbarCta3IsEnabled = file.getString();
						System.out.println("CTA3 Enabled: " + viewerToolbarCta3IsEnabled);
					}
					else if (file.getFieldName().equals("viewer_toolbar_cta2_text")) {
						viewerToolbarCta2Text = file.getString();
						System.out.println("CTA2 Text: " + viewerToolbarCta2Text);
					}
					else if (file.getFieldName().equals("viewer_toolbar_cta2_link")) {
						viewerToolbarCta2Link = file.getString();
						System.out.println("CTA2 Link: " + viewerToolbarCta2Link);
					}
					else if (file.getFieldName().equals("viewer_toolbar_cta3_text")) {
						viewerToolbarCta3Text = file.getString();
						System.out.println(viewerToolbarCta3Text);
					}
					else if (file.getFieldName().equals("viewer_toolbar_cta3_link")) {
						viewerToolbarCta3Link = file.getString();
						System.out.println(viewerToolbarCta3Link);
					}
				}
				int statusCode = 0;
				int imageStatusCode = 0;
				
				if (null != viewerToolbarLogoImage) {
					imageStatusCode = DbLayer.updateNavbarLogo(viewerToolbarLogoImage, salesman);
				} else {
					imageStatusCode = 200;
				}
				
				statusCode = DbLayer.updateNavbarSettings(salesman, viewerToolbarBackground, viewerToolbarLogoLink,
						viewerToolbarCTABackground, viewerToolbarCta2IsEnabled, viewerToolbarCta3IsEnabled, viewerToolbarCta2Text,
						viewerToolbarCta2Link, viewerToolbarCta3Text, viewerToolbarCta3Link, viewerToolbarTextColor, viewerToolbarCTATextColor,
						viewerToolbarCta1IsEnabled, viewerToolbarCta1Text, viewerToolbarCta1Link, viewerToolbarButtonBackground);
				
				if (200 == imageStatusCode && 200 == statusCode) {
					statusCode = 200;
				} else {
					statusCode = 0;
				}
				
				data.put("statusCode", statusCode);
			} catch (FileUploadException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			
			response.setContentType("application/json; charset=UTF-8");
		    PrintWriter output = response.getWriter();
		    output.print(data);
		    output.close();
		}
}

