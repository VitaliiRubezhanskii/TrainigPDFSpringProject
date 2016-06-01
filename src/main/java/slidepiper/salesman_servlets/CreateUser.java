package slidepiper.salesman_servlets;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.net.URL;

import slidepiper.db.DbLayer;
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
@WebServlet("/create-user")
@MultipartConfig(maxFileSize = 16777215)
public class CreateUser extends HttpServlet {
	
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
	    int statusCode = -1;
	    
	    /**
	     * Receive viewer toolbar settings from sp-signup.js and process them to be
	     * sent to the DB via DbLayer.setSalesman() method.
	     * 
	     * The logo file received in the signup request (viewer_toolbar_logo_image)
	     * is converted to an InputStream in order to be inserted into the DB as a MEDIUMBLOB.	
	     * If no logo is sent then a default logo is used (spLogoUrl).
	     */
	    try {
	    	List<FileItem> items = upload.parseRequest(request);
	    	String action = null;
	    	String company = null;
	    	String email = null;
	    	String emailClient = null;
	    	String firstName = null;
	    	String lastName = null;
	    	String magic = null;
	    	String password = null;
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
	    	
	    	for (FileItem file: items) {
	    		if (file.getFieldName().equals("action")){
	    			action = file.getString();
	    			System.out.println(action);
	    		}
	    		else if (file.getFieldName().equals("company")){
	    			company = file.getString();
	    			System.out.println(company);
	    		}
	    		else if (file.getFieldName().equals("email")){
	    			email = file.getString();
	    			System.out.println(email);
	    		}
	    		else if (file.getFieldName().equals("email-client")){
	    			emailClient = file.getString();
	    			System.out.println(emailClient);
	    		}
	    		else if (file.getFieldName().equals("first-name")){
	    			firstName = file.getString();
	    			System.out.println(firstName);
	    		}
	    		else if (file.getFieldName().equals("last-name")){
	    			lastName = file.getString();
	    			System.out.println(lastName);
	    		}
	    		else if (file.getFieldName().equals("magic")){
	    			magic = file.getString();
	    			System.out.println(magic);
	    		}
	    		else if (file.getFieldName().equals("password")){
	    			password = file.getString();
	    			System.out.println(password);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_background")){
	    			viewerToolbarBackground = file.getString();
	    			System.out.println("Viewer Toolbar Background: " + viewerToolbarBackground);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_logo_image")){
	    			if (null != file.getName() && (file.getContentType().equals("image/jpeg") || file.getContentType().equals("image/png"))){
	    				viewerToolbarLogoImage = file.getInputStream();
		    			System.out.println(viewerToolbarLogoImage);
	    			}
	    			else {
	    				URL spLogoUrl = CreateUser.class.getResource("/sp-logo/sp-logo-02-555x120.png");
	    				System.out.println("Url: " + spLogoUrl);
	    				viewerToolbarLogoImage = new URL(spLogoUrl.toString()).openStream();
	    			}
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_logo_link")){
	    			viewerToolbarLogoLink = file.getString();
	    			System.out.println(viewerToolbarLogoLink);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_cta_background")){
	    			viewerToolbarCTABackground = file.getString();
	    			System.out.println("Viewer Toolbar CTA Background: " + viewerToolbarCTABackground);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_cta2_is_enabled")){
	    			viewerToolbarCta2IsEnabled = file.getString();
	    			System.out.println("CTA2 Enabled: " + viewerToolbarCta2IsEnabled);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_cta3_is_enabled")){
	    			viewerToolbarCta3IsEnabled = file.getString();
	    			System.out.println("CTA3 Enabled: " + viewerToolbarCta3IsEnabled);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_cta2_text")){
	    			viewerToolbarCta2Text = file.getString();
	    			System.out.println("CTA2 Text: " + viewerToolbarCta2Text);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_cta2_link")){
	    			viewerToolbarCta2Link = file.getString();
	    			System.out.println("CTA2 Link: " + viewerToolbarCta2Link);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_cta3_text")){
	    			viewerToolbarCta3Text = file.getString();
	    			System.out.println(viewerToolbarCta3Text);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_cta3_link")){
	    			viewerToolbarCta3Link = file.getString();
	    			System.out.println(viewerToolbarCta3Link);
	    		}
	    	}
	        
	    	if (action.equals("setSalesman")){
	        	statusCode = DbLayer.setSalesman(company, email, emailClient, firstName, lastName, magic, password, 
	        		viewerToolbarBackground, viewerToolbarLogoImage, viewerToolbarLogoLink,
	        		viewerToolbarCTABackground, viewerToolbarCta2IsEnabled, viewerToolbarCta3IsEnabled,
	        		viewerToolbarCta2Text, viewerToolbarCta2Link, viewerToolbarCta3Text, viewerToolbarCta3Link);
	        	
	        	data.put("statusCode", statusCode);
	        }
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
