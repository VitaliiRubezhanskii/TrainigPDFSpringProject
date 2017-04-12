package slidepiper.salesman_servlets;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.json.JSONObject;
import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;
import slidepiper.email.Mailchimp;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
	    	String password = null;
			String signupCode = null;
	    	String telephone = null;
	    	String promoCode = null;
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
        Boolean isClientLogo = false;
            
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
	    		else if (file.getFieldName().equals("password")){
	    			password = file.getString();
	    		}
				else if (file.getFieldName().equals("signupCode")){
					signupCode = file.getString();
				}
	    		else if (file.getFieldName().equals("telephone")){
	    			telephone = file.getString();
	    			System.out.println("Phone: " + telephone);
	    		}
	    		else if (file.getFieldName().equals("promo-code")){
            promoCode = file.getString();
            System.out.println("Promo code: " + promoCode);
          }
	    		else if (file.getFieldName().equals("viewer_toolbar_background")){
	    			viewerToolbarBackground = file.getString();
	    			System.out.println("Viewer Toolbar Background: " + viewerToolbarBackground);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_logo_image")){
	    			if (null != file.getName() && (file.getContentType().equals("image/jpeg") || file.getContentType().equals("image/png"))){
	    				viewerToolbarLogoImage = file.getInputStream();
		    			System.out.println(viewerToolbarLogoImage);
		    			isClientLogo = true;
	    			}
	    			else {
	    				URL spLogoUrl = CreateUser.class.getResource("/sp-logo/sp-logo-02-555x120.png");
	    				System.out.println("Url: " + spLogoUrl);
	    				viewerToolbarLogoImage = new URL(spLogoUrl.toString()).openStream();
	    				isClientLogo = false;
	    			}
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_logo_link")){
	    			viewerToolbarLogoLink = file.getString();
	    			System.out.println("Logo Link: " + viewerToolbarLogoLink);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_cta_background")){
	    			viewerToolbarCTABackground = file.getString();
	    			System.out.println("Viewer Toolbar CTA Background: " + viewerToolbarCTABackground);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_cta2_is_enabled")){
	    			viewerToolbarCta2IsEnabled = file.getString();
	    			System.out.println("CTA2 Enabled: " + viewerToolbarCta2IsEnabled);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_cta1_is_enabled")){
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
	    		else if (file.getFieldName().equals("viewer_toolbar_cta1_text")){
	    			viewerToolbarCta3Text = file.getString();
	    			System.out.println(viewerToolbarCta3Text);
	    		}
	    		else if (file.getFieldName().equals("viewer_toolbar_cta1_link")){
	    			viewerToolbarCta3Link = file.getString();
	    			System.out.println(viewerToolbarCta3Link);
	    		}
	    	}
	    	
	    	viewerToolbarLogoLink = chooseLogoLink(isClientLogo, viewerToolbarLogoLink);
	    	
	    	if (null == viewerToolbarLogoImage) {
	    		URL spLogoUrl = CreateUser.class.getResource("/sp-logo/sp-logo-02-555x120.png");
				System.out.println("Url: " + spLogoUrl);
				viewerToolbarLogoImage = new URL(spLogoUrl.toString()).openStream();
	    	}
	    	
	    	if (action.equals("setSalesman")) {
	        	statusCode = DbLayer.setSalesman(company, email, emailClient, firstName, lastName, password, signupCode,
	        		telephone, promoCode, viewerToolbarBackground, viewerToolbarLogoImage, viewerToolbarLogoLink,
	        		viewerToolbarCTABackground, viewerToolbarCta2IsEnabled, viewerToolbarCta3IsEnabled,
	        		viewerToolbarCta2Text, viewerToolbarCta2Link, viewerToolbarCta3Text, viewerToolbarCta3Link);
	        	
	        	// If user was added, then do the following
	        	if (200 == statusCode) {
	        	  Map<String, String> eventDataMap = new HashMap<String, String>();
	        	  eventDataMap.put("email", email);
	            
              // Log event of user sign up
	        	  DbLayer.setEvent(
                  DbLayer.SALESMAN_EVENT_TABLE,
                  ConfigProperties.getProperty("event_signup_user"),
                  eventDataMap
              );
	        	  
	        	  // Subscribe user to Mailchimp
	        	  int mailchimpResponseCode =
	        	      Mailchimp.SubscribeUser(email, firstName, lastName);
	        	  
	        	  // Log event of subscribing a user to Mailchimp
	        	  if (200 == mailchimpResponseCode) {
  	        	  DbLayer.setEvent(
  	                DbLayer.SALESMAN_EVENT_TABLE,
  	                ConfigProperties.getProperty("mailchimp_subscribe_user"),
  	                eventDataMap
  	            );
	        	  }
	        	}
	        	
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
	
	public static String chooseLogoLink (Boolean isClientLogo, String viewerToolbarLogoLink) {
		
    	String logoLink = "";
    	if ((viewerToolbarLogoLink == null || viewerToolbarLogoLink.length() <= 0) && !isClientLogo){
    		logoLink = ConfigProperties.getProperty("app_url");
		}
		else if (viewerToolbarLogoLink.length() <= 0 && isClientLogo) {
			logoLink = "no-logo-link";
		}
		else {
			return viewerToolbarLogoLink;
		}
    	
		return logoLink;
		
	}
	
}
