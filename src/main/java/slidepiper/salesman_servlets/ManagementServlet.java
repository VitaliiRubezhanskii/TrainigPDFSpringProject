package slidepiper.salesman_servlets;

import java.awt.TrayIcon.MessageType;
import java.io.BufferedReader;

import slidepiper.*;
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
			DbLayer.init();
	}
	
	/***********************		GET METHODS		*********************************/
	
	/***********************		 DO-POST		*********************************/

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		StringBuffer jb = new StringBuffer();
		Constants.updateConstants();
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
			
			switch(action){
			
				case "customerLogin":
					int customer = 0;
					String customerEmail = input.getString("email");
					System.out.println("Login with email:" + customerEmail);
					//System.out.println("comparing to customers, how many??="+customers.size() );
					for(int i = 0; i < DbLayer.customers.size(); i++){
						if(DbLayer.customers.get(i).getEmail().equals(customerEmail)){
							customer = 1;
							System.out.println("Login with email:" + customerEmail + " compare to " + DbLayer.customers.get(i).getEmail() + " result " + customer);
							break;
						}
						
					}
					output.put("customer", customer);
					break;
					
				case "salesmanLogin":
					System.out.println("Salesman logging in");
					int salesman_found = 0;
					Salesman checkSalesman = new Salesman(input.getString("email"), input.getString("password"), null, null);
					for(int i = 0; i < DbLayer.salesmen.size(); i++){
						if (DbLayer.salesmen.get(i).getEmail().equals(checkSalesman.getEmail()))
						{
							System.out.println("found correct salesman in db. password is: "+DbLayer.salesmen.get(i).getPassword());
						}
						if(DbLayer.salesmen.get(i).getEmail().equals(checkSalesman.getEmail()) && DbLayer.salesmen.get(i).getPassword().equals(checkSalesman.getPassword())){						
							salesman_found = 1;
							break;
						}
					}
					output.put("salesman", salesman_found);
					break;
					
				case "getSalesmanData":
					//System.out.println("Sending salesmandata");
					DbLayer.getPresentations();
					ArrayList<Customer> custs = DbLayer.getMyCustomers(input.getString("email"));
					//System.out.println("input email: " + input.getString("email") + " # customers: " + custs.size());					 
					output.put("myCustomers", custs);
					
					ArrayList<Presentation> mypres = DbLayer.getMyPresentations(input.getString("email"));
					output.put("presentations", mypres);
					//System.out.println("Sending salesmandata.done");
					break;
					
				case "sendPresentationToCustomer":									
					String msgtext = input.getString("msgtext");				    											
					String msglink = "https://www.slidepiper.com/pdfjs/viewer.html?"
							//salesman_email="+
							//input.getString("salesman_email")
							// cannot put exta param in mailto, 
							// not & can be in msg body.
							+ "file=/file/"+
							input.getString("docid") + "#zoom=page-fit";

					msgtext = msgtext + "<br>" + msglink;
					
					System.out.println("sending msg from:  "  + input.getString("salesman_email"));
					
					//does not really send, just write to db. sent using mailto.
						DbLayer.sendMessage(input.getString("docid"), input.getString("salesman_email"), DbLayer.getSalesmanEmailpasswordByEmail(input.getString("salesman_email")), input.getString("customers"),
							input.getString("slides_ids"), msgtext + msglink, "", input.getString("msgsubj")
							);
					
					// message will be sent using mailto!!!
												
					System.out.println("In sendPresToCust done.");
					output.put("succeeded", 1); //success signal					
					// important --> link is used in mailto
					output.put("link", msglink); //link for message
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