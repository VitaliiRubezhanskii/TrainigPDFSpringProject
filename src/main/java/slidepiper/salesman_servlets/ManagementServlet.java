package slidepiper.salesman_servlets;

import java.awt.TrayIcon.MessageType;
import java.io.BufferedReader;

import slidepiper.*;
import slidepiper.ui_rendering.*;
import slidepiper.chat.ChatServer;
import slidepiper.constants.Constants;
import slidepiper.dataobjects.Customer;
import slidepiper.dataobjects.Presentation;
import slidepiper.dataobjects.Salesman;
import slidepiper.db.DbLayer;
import slidepiper.logging.CustomerLogger;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Properties;
import java.util.Set;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.*;

import javax.mail.*;
import javax.mail.internet.*;
import javax.activation.*;

import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/ManagementServlet")
public class ManagementServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	//private final String MAIL_HOST = "smtp.gmail.com";
   // private final String MAIL_FROM = "slidepiper";
   // private final String MAIL_PASSWORD = "p57nXU4N";
    
    //static File[] listOfFiles;
	//static File folder;
//	static HashMap<String, int[]> map;
//	boolean repeatFunction = false;
//	Thread thread;
//	static ArrayList<String[]> data;
	
    public ManagementServlet() {    	
        super();
    }

	public void init(ServletConfig config) throws ServletException {
		// to start auto put in web.xml:
/*
<servlet>
    <servlet-name>ManagementServlet</servlet-name>
    <servlet-class>slidepiper.salesman_servlets.ManagementServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
</servlet>
*/
			System.out.println("Init ManagementServlet");
			DbLayer.init();				
	}
		
	/***********************		GET METHODS		*********************************/
	
	/***********************		 DO-POST		*********************************/

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		StringBuffer jb = new StringBuffer();
		DbLayer.init();
		//System.out.println("post req");
	    String line = null;
	    try {
	    	BufferedReader reader = request.getReader();
	        while ((line = reader.readLine()) != null)
	        	jb.append(line);
	    } catch (Exception e) {
	    	System.out.println("problem here!");
	    }
	    try{			
			JSONObject input = new JSONObject(jb.toString());
			String action = input.getString("action");
			JSONObject output = new JSONObject();
			
			int salesman_found = 0;
			
			switch(action){			
			case "changeSalesmanPassword":
				System.out.println("Salesman change pw");
							
				// check old pw given and in db
				if (input.getString("oldpassword").equalsIgnoreCase(DbLayer.getSalesmanPassword(input.getString("email"))))
				{
						DbLayer.setPassword(input.getString("email"), input.getString("newpassword"));						
						output.put("success", 1);
						System.out.println("pw change successfully");
				}
				else
				{
					output.put("success", 0);
					System.out.println("error changing pw");
				}				
				break;
						
				case "salesmanLogin":
					System.out.println("Salesman logging in");
					int login_ok = 0;
					
					if (DbLayer.getSalesmanPassword(
							input.getString("email")).equalsIgnoreCase(
									input.getString("password")))
					{
							login_ok = 1;
					}					
					output.put("salesman", login_ok);
					break;
					
				case "getSalesmanData":
					//System.out.println("Sending salesmandata");				
					ArrayList<Customer> custs = DbLayer.getMyCustomers(input.getString("email"));
					//System.out.println("input email: " + input.getString("email") + " # customers: " + custs.size());					 
					output.put("myCustomers", custs);					
					ArrayList<Presentation> mypres = DbLayer.getMyPresentations(input.getString("email"));
					output.put("presentations", mypres);
					//System.out.println("Sending salesmandata.done");
					break;
					
				case "sendPresentationToCustomer":									
					String msgtext = input.getString("msgtext");
					
					String appname = System.getenv("OPENSHIFT_APP_NAME");
					System.out.println("making link for app appname " + appname);						
					String msglink;
					if (appname==null) //running locally
					{
						msglink = "localhost:8080/sp/pdfjs/viewer.html?file=/sp/file/"+ input.getString("docid") + "#zoom=page-fit";
					}
					else
					{
						 if (appname.equalsIgnoreCase("slidepipertest"))
						 {
							 msglink = "http://slidepipertest-slidepiper.rhcloud.com/pdfjs/viewer.html?file=/file/"+ input.getString("docid") + "#zoom=page-fit";
						 }
						 else
							 if (appname.equalsIgnoreCase("sp")) 
							 {
								 msglink = "http://www.slidepiper.com/pdfjs/viewer.html?file=/file/"+ input.getString("docid") + "#zoom=page-fit";
							 }
							 else
							 {
								 	msglink = "CANNOT MAKE LINK";
							 }							 
					}
					

					msgtext = msgtext + "<br>" + msglink;
														
		    	int timezone_offset = Integer.parseInt(input.getString("timezone_offset_min"));
					System.out.println("sending msg from:  "  + input.getString("salesman_email") + " tz offset " + timezone_offset);					
					
					//does not really send, just write to db. sent using mailto.
						DbLayer.sendMessage(input.getString("docid"), input.getString("salesman_email"), "no email password", input.getString("customeremails"),
							input.getString("slides_ids"), msgtext, "", input.getString("msgsubj"), timezone_offset
							);
					
					// message will be sent using mailto!!!
												
					System.out.println("In sendPresToCust done.");
					output.put("succeeded", 1); //success signal					
					// important --> link is used in mailto
					output.put("link", msglink); //link for message
					output.put("mailtype", DbLayer.getSalesmanMailType(input.getString("salesman_email"))); //link for message
					break;
														
				case "addNewCustomer":
					System.out.println("addnew cust");
					String smemail = input.getString("salesmanEmail");
					String cname = input.getString("customerName");
					String ccompany = input.getString("customerCompany");
					String cemail = input.getString("customerEmail");
					System.out.println("cust data: smemail " + smemail + " cname " + cname + "cust company: " + ccompany + " cu email:" + cemail);
					output.put("newCustomer", DbLayer.addNewCustomer(smemail, cname, ccompany, cemail));
					break;
														
				case "deleteCustomer":
					System.out.println("deleting cust " + input.getString("customer_email") + " " + input.getString("salesman_email"));
					DbLayer.deleteCustomer(input.getString("customer_email"),input.getString("salesman_email"));
					break;					

				case "deletePresentation":
					System.out.println("deleting pres " + input.getString("presentation") + " " + input.getString("salesman_email"));
					DbLayer.deletePresentation(input.getString("presentation"), input.getString("salesman_email"));
					break;
			}
			
				String res = output.toString();
				response.setCharacterEncoding("utf-8");
		    response.setContentType("application/json");
		    response.getWriter().write(res);
		    response.getWriter().flush();
	    } catch(Exception e){
	    	System.out.println("problem form doPost method: ");
	    	e.printStackTrace();
	    }
	}		
}
