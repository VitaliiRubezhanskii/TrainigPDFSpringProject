package slidepiper.db;

import java.io.PrintWriter;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.*;
import java.util.ArrayList;
import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import slidepiper.constants.Constants;
import slidepiper.dataobjects.AlertData;
import slidepiper.dataobjects.Customer;
import slidepiper.dataobjects.MessageInfo;
import slidepiper.dataobjects.Presentation;
import slidepiper.dataobjects.Salesman;
import slidepiper.dataobjects.SlideView;
import slidepiper.dataobjects.HistoryItem;

public class DbLayer {
	
  private static Boolean initialized = false;
	public static ArrayList<Customer> customers;  
	public static ArrayList<Salesman> salesmen; 
	public static ArrayList<Presentation> presentations;
  //
	
	// updates the customers in "customers" ArrayList.
	public static void getCustomers(){
		customers = new ArrayList<Customer>();
		try {
			DriverManager.registerDriver(new com.mysql.jdbc.Driver());
		} catch (SQLException e) {
			e.printStackTrace();
		}
		try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
			Statement statement = conn.createStatement();
			ResultSet resultset = statement.executeQuery("SELECT name, email, sales_man FROM customers");) {
			Customer customer;
			String name, email, salesman;
				while (resultset.next()) {
				 	name = resultset.getString(1);
				 	email = resultset.getString(2);
				 	salesman = resultset.getString(3);
				    customer = new Customer(name, email, salesman);
				    customers.add(customer);
				    //System.out.println(" custmer name " + name + " email " + email + " salesman " + salesman);
				}
		} catch (Exception ex) {
			ex.getMessage(); 
		}
	}
		
	// updates the salesmen in "salesMen" ArrayList.
	public  static  void getSalesmen(){
		salesmen = new ArrayList<Salesman>();
		//System.out.println("Connecting to db to get salesmen. reg driver");
		try {
			DriverManager.registerDriver(new com.mysql.jdbc.Driver());
		} catch (SQLException e) {
			e.printStackTrace();
		}
		//System.out.println("Connecting to db to get salesmen. do connect--");
		try {
			Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
				System.out.println("cnctd");
			Statement statement = conn.createStatement();
				System.out.println("stmt");
			ResultSet resultset = statement.executeQuery("SELECT email, password, name, emailpassword, mailtype FROM sales_men");
				System.out.println("rsltst");
			Salesman salesman;
			String email, password, name,emailpassword, mailtype;
				while (resultset.next()) {
				 	email = resultset.getString(1);
				 	password = resultset.getString(2);
				 	name = resultset.getString(3);
				 	emailpassword = resultset.getString(4);
				 	mailtype = resultset.getString(5);
			//	 	System.out.println("salesman email " + email + " pw " + password + " name " + name + " email password " + emailpassword);
				    salesman = new Salesman(email, password, name, emailpassword, mailtype);
				    salesmen.add(salesman);
			//      System.out.println(salesMan);
				}
		} catch (Exception ex) {
		      System.out.println("stack trace:");
					ex.printStackTrace(); 
		}
	}
	
	// get customers for a specific sales man.
	public  static  ArrayList<Customer> getMyCustomers(String email){
		getCustomers();
		ArrayList<Customer> myCustomers = new ArrayList<Customer>();
		for(int i = 0; i < customers.size(); i++){
			if (customers.get(i).getSalesman() != null) //sometimes there's null for unknown reason.
			{
					if(customers.get(i).getSalesman().equals(email)){
						myCustomers.add(customers.get(i));
					}
					
			}
		}
		return myCustomers;
	}
	
	// get pres for a specific sales man.
		public  static ArrayList<Presentation> getMyPresentations(String email){
			getCustomers();
			ArrayList<Presentation> myPres = new ArrayList<Presentation>();
			for(int i = 0; i < presentations.size(); i++){
				if (presentations.get(i).getSalesmanEmail() != null) //sometimes there's null for unknown reason.
				{
						//System.out.println("getting pres to add - "+ presentations.get(i).getSalesmanEmail());
						if(presentations.get(i).getSalesmanEmail().equals(email)){
							myPres.add(presentations.get(i));
						//	System.out.println(customers.get(i));
						}
						
				}
			}
			return myPres;
		}
		
		

	public  static Customer getCustomer(String name){
				for(int i = 0; i < customers.size(); i++){
					if (customers.get(i).getName().equalsIgnoreCase(name)) 
								{
									return customers.get(i);
								}
				}
				return null;
	}
	
	// updates the presentations in "presentations" ArrayList.
	public  static void getPresentations(){
		presentations = new ArrayList<Presentation>();
		//System.out.println("in getPres");
		try {
			DriverManager.registerDriver(new com.mysql.jdbc.Driver());
		} catch (SQLException e) {
			e.printStackTrace();
		}
		try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
			Statement statement = conn.createStatement();
			 // no email for now, get lines with empty email.
			ResultSet resultset = statement.executeQuery("SELECT id, name, sales_man_email FROM slides");
				)   {
			
			Presentation presentation;
			String id, name, smemail;
	
			while (resultset.next()) {
				  id  = resultset.getString(1);
				 	name = resultset.getString(2);
				 	smemail = resultset.getString(3); //salesman email
			//	 	System.out.println("in getPres. got pres " + name + " smemail " + smemail  + " id " + id);
				    presentation = new Presentation(name, smemail, id);
				    presentations.add(presentation);
				//    System.out.println(presentation);
				}
		} catch (Exception ex) {
			ex.getMessage(); 
		}
	}
	  
	public static String getSalesmanEmailpasswordByEmail(String salesmanEmail)
	{
			// get salesman w from his email
					for(int i = 0; i < salesmen.size(); i++){
						//System.out.println("comparing email " + salesmanEmail + " to email in list: " + salesmen.get(i).getEmail());
						if(salesmen.get(i).getEmail().equals(salesmanEmail)){
							return salesmen.get(i).getEmailpassword();
						//	break;
						}
					}
					
					System.out.println("getsalesman pw by email - not found!");
					return null; // not found
	}

	public static String getSalesmanMailType(String salesmanEmail)
	{
			// get salesman mailtype from his email
					for(int i = 0; i < salesmen.size(); i++){
						//System.out.println("comparing email " + salesmanEmail + " to email in list: " + salesmen.get(i).getEmail());
						if(salesmen.get(i).getEmail().equals(salesmanEmail)){
							return salesmen.get(i).getMailType();
						//	break;
						}
					}
					
					System.out.println("getsalesman pw by email - not found!");
					return null; // not found
	}

 
  public static void init()
  	{	  	
	 	if (initialized==false)
	  	{
				  Constants.updateConstants();		
					getCustomers();
					getSalesmen();
					getPresentations();
					initialized = true;
	  	}
  	}

	public static void deleteCustomer(String customer_email, String salesman_email ){
		String query = "DELETE FROM customers"+
					" WHERE email ='" + customer_email + "'" +
				" AND sales_man='" + salesman_email + "';";
					
		try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass); ) {
			PreparedStatement preparedStatement = conn.prepareStatement(query);	
			preparedStatement.executeUpdate();
	        preparedStatement.close();
	        System.out.println("customer: " + customer_email + " was deleted!");
	        conn.close();
		} catch (Exception ex) {
			System.out.println("err: " + ex.getMessage());
		}
		getCustomers();
	}

	public static void deletePresentation(String pres, String salesman_email ){
		String query = "DELETE FROM slides "+
					" WHERE id ='" + pres + "'" +
				" AND sales_man_email='" + salesman_email + "';";
					
		try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass); ) {
			PreparedStatement preparedStatement = conn.prepareStatement(query);	
			preparedStatement.executeUpdate();
	        preparedStatement.close();
	        System.out.println("pres: " + pres + " was deleted! salesman " + salesman_email);
	        conn.close();
		} catch (Exception ex) {
			System.out.println("err: " + ex.getMessage());
		}
		getPresentations();
	}
	

	
	
	//add new customer.
	public static int addNewCustomer(String salesMan, String name, String company, String email){
		String query = "INSERT INTO customers(email, name, sales_man, company) VALUES (?, ?, ?, ?)";
		//try (Connection conn = DriverManager.getConnection(Constants.dbURL);)
		try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);) 
			{			
			PreparedStatement preparedStatement = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
			preparedStatement.setString(1, email);
			preparedStatement.setString(2, name);
			preparedStatement.setString(3, salesMan);
			preparedStatement.setString(4, company);
			preparedStatement.executeUpdate();
			preparedStatement.close();
			conn.close();
			System.out.println("new customer inserted! name=" + name + " company: " + company);
			getCustomers();
			return 1;
		} catch (Exception ex) {
			System.out.println("exception in addNewCust");
			ex.printStackTrace();
			return 0;
		}		
	}
	
	
	public static MessageInfo getMessageInfo(String msgid)
	{
				String id, salesManEmail, customerEmail, slidesId, msgText, timestamp;
				
			try {
				DriverManager.registerDriver(new com.mysql.jdbc.Driver());
			} catch (SQLException e) {
				System.out.println("exception in getmsginfo registering driver");
				e.printStackTrace();
			}
								
			String msginfoQuery = "SELECT id, sales_man_email, customer_email, slides_id, msg_text, timestamp " + 
			" FROM msg_info " + 
			" WHERE id='" + msgid + "' LIMIT 1;"; // take only 1 result. SHOULD be one.
			
			System.out.println("running query to get message info: " + msginfoQuery);

			try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
				Statement statement = conn.createStatement();
									ResultSet resultset = statement.executeQuery(msginfoQuery);) {				
					while (resultset.next()) {
						id = resultset.getString(1);
						salesManEmail = resultset.getString(2);
						customerEmail = resultset.getString(3);
						slidesId = resultset.getString(4);
					  msgText = resultset.getString(5);
						timestamp = resultset.getString(6);
						MessageInfo mi = new MessageInfo(id, salesManEmail, customerEmail, slidesId, msgText, timestamp);
						System.out.println("Got msginfo " + mi.toString());
						return mi;
					}
			} catch (Exception ex) {
					System.out.println("exception in getmsginfo");
					ex.printStackTrace();
			}			
			return null;
		}
	
	
	
	// get only sm email, not all msg info. for customer presentation view.
	public static String getSalesmanEmailFromMsgId(String msgid)
	{
				MessageInfo mi = getMessageInfo(msgid);
				
				return mi.getSalesManEmail();
	}
		
	// set rows for this sessionId as done. 
	// will not appear in recommendations. 
	public static void setDone(String sessionId)
	{
		System.out.println("setting done for session " + sessionId);
		Constants.updateConstants();
		Connection conn = null; // connection to the database	
		
		try {
		// connects to the database
		DriverManager.registerDriver(new com.mysql.jdbc.Driver());
		conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
						
					String sql = "UPDATE customer_events " + 
					" SET done = 1 " + 
				  " WHERE session_id = ?";
					PreparedStatement statement = conn.prepareStatement(sql);
					statement.setString(1, sessionId);						
					
					// sends the statement to the database server
					int row = statement.executeUpdate();
					if (row > 0) {
						System.out.println("setDone in customer_events (obsolete in v1) - rows updated: " + row);
						//String message = "updated done.";
					}
					
					sql = "UPDATE customer_sessions " + 
					" SET done = 1 " + 
				  " WHERE session_id = ?";
					statement = conn.prepareStatement(sql);
					statement.setString(1, sessionId);						
					
					// sends the statement to the database server
					row = statement.executeUpdate();
					if (row > 0) {
						System.out.println("setDone in customer_sessions - rows updated: " + row);
						//String message = "updated done.";
					}
					
		}            
		catch (SQLException ex) {
		ex.printStackTrace();
		System.out.println("SQL ERROR" + ex.getMessage());
			} 
		finally {
				if (conn != null) {
				    // closes the database connection
				    try {
				        conn.close();
				    } catch (SQLException ex) {
				        ex.printStackTrace();
				        }
				}
	    }
	}
	
	
	public static void setPassword(String salesman_email, String newpassword)
	{
		System.out.println("setting new pw for " + salesman_email);
		Constants.updateConstants();
		Connection conn = null; // connection to the database	
		
		try {
		// connects to the database
		DriverManager.registerDriver(new com.mysql.jdbc.Driver());
		conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
						
					String sql = "UPDATE sales_men " + 
					" SET password = ? " + 
				  " WHERE email = ?";
					PreparedStatement statement = conn.prepareStatement(sql);
					statement.setString(1, newpassword);						
					statement.setString(2, salesman_email);
					
					// sends the statement to the database server
					int row = statement.executeUpdate();
					if (row > 0) {
						System.out.println("change pw - rows updated: " + row);
						//String message = "updated done.";
					}
		}            
		catch (SQLException ex) {
		ex.printStackTrace();
		System.out.println("SQL ERROR" + ex.getMessage());
			} 
		finally {
				if (conn != null) {
				    // closes the database connection
				    try {
				        conn.close();
				    } catch (SQLException ex) {
				        ex.printStackTrace();
				        }
				}
	    }
	}
	

	
	
	public static ArrayList<SlideView> getSlideViews(String sessionId){
		//System.out.println("start get slide views");
		
		ArrayList<SlideView> views = new ArrayList<SlideView>();
		try {
			DriverManager.registerDriver(new com.mysql.jdbc.Driver());
		} catch (SQLException e) {
			e.printStackTrace();
		}
		
				
		String viewsQuery = "SELECT param1int as 'slide_num', param2float as 'view_time' " + 
		" FROM customer_events " + 
		" WHERE event_name='VIEW_SLIDE' "+ 
		" AND session_id='" + sessionId + "' AND done IS FALSE;";

		//System.out.println("slideviews connect db");
		try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
			Statement statement = conn.createStatement();
								ResultSet resultset = statement.executeQuery(viewsQuery);) {
			//System.out.println("query slide views sessionId " + sessionId + " sql: " + viewsQuery);
			SlideView slideview;
			int slide_num;
			double time_viewed;
				while (resultset.next()) {
					slide_num = resultset.getInt(1);
				 	time_viewed = resultset.getDouble(2);
				 	slideview = new SlideView(slide_num, time_viewed, 0);				 
				  //System.out.println("slideviews query done, values set slidenum" + 
						//  	slide_num + " "
						  //			+ "view time " + time_viewed);
					views.add(slideview);   			    
					
				}
		} catch (Exception ex) {
				System.out.println("exception in getSlideViews");
				ex.printStackTrace();
		}
		return views;
	}
	
	
	
	
	
	
	

	
	public static ArrayList<String> getQuestions(String sessionId){
	//	System.out.println("start get q's");
		
		ArrayList<String> qs = new ArrayList<String>();
		try {
			DriverManager.registerDriver(new com.mysql.jdbc.Driver());
		} catch (SQLException e) {
			e.printStackTrace();	
		}
						
		String qsQuery = "SELECT param3str as 'question' " +   
		" FROM customer_events " + 
		" WHERE event_name='CUSTOMER_QUESTION' "+ 
		" AND session_id='" + sessionId + "' AND done IS FALSE;";

		//System.out.println("qs connect db");
		try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
			Statement statement = conn.createStatement();
								ResultSet resultset = statement.executeQuery(qsQuery);) {
			//System.out.println("query q's sessionId " + sessionId + " sql: " + qsQuery);
			String q;
				while (resultset.next()) {
					q = resultset.getString(1);
					qs.add(q);   			    
				}
		} catch (Exception ex) {
				System.out.println("exception in getqs");
				ex.printStackTrace();
		}
		return qs;
	}

	
	/////*********************************************************
	// GET ALERTS	 FOR SALESMAN
		public static ArrayList<AlertData> getAlerts(String salesman_email){
				
			System.out.println("start get alerts for email " + salesman_email);
			ArrayList<AlertData> alerts = new ArrayList<AlertData>();
			try {
				DriverManager.registerDriver(new com.mysql.jdbc.Driver());
			} catch (SQLException e) {
				e.printStackTrace();
			}
			
			/* query for manual use:
			 * SELECT DISTINCT msg_info.customer_email AS 'customer_email', customers.name AS 'customer_name', slides.name, customer_events.msg_id, msg_info.msg_text AS 'message_text', DATE_SUB( customer_events.timestamp, INTERVAL 7 HOUR ) AS 'open_time', DATE_SUB( msg_info.timestamp, INTERVAL 7 HOUR ) AS 'send_time', customer_events.session_id AS 'session_id'
FROM customer_events, msg_info, slides, customers
WHERE event_name = 'OPEN_SLIDES'
AND msg_info.sales_man_email = 'david.salesmaster@gmail.com'
AND customer_events.msg_id = msg_info.id
AND slides.id = msg_info.slides_id
AND customers.email = msg_info.customer_email
AND customers.sales_man =  msg_info.sales_man_email
AND customer_events.done IS
FALSE
ORDER BY 6 DESC;

*/
			 
			
			// this looks good, one line per viewing event of pdf.
			// this needs to be expanded for the different pages in the pdf.
			String reportSQL=
					"SELECT DISTINCT msg_info.customer_email as 'customer_email', customers.name as 'customer_name', "+
					"slides.name, "+
					"customer_events.msg_id, "+
					"msg_info.msg_text as 'message_text', "+ 
				//	"DATE_SUB(customer_events.timestamp,INTERVAL 7 HOUR) as 'open_time', "+ 
					//"DATE_SUB(msg_info.timestamp, INTERVAL 7 HOUR) as 'send_time', " +
				//without date_sub - should be added previously with correct Timezone.
					"customer_events.timestamp as 'open_time', "+ 
					"msg_info.timestamp as 'send_time', " +
					"customer_events.session_id as 'session_id' "+
					"FROM customer_events, msg_info, slides, customers "+
					"WHERE event_name='OPEN_SLIDES' "+ 
					   "AND msg_info.sales_man_email='" + salesman_email + "'  "+ 
					   "AND customer_events.msg_id = msg_info.id "+
					   "AND slides.id = msg_info.slides_id "+
					   "AND customers.email=msg_info.customer_email " +
					   "AND customers.sales_man =  msg_info.sales_man_email " +
					   " AND customer_events.done IS FALSE " +
					"ORDER BY 6 DESC;"; 
			
			//System.out.println("full query is: \n" +reportSQL);

			//System.out.println("alerts connect db");
			try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
				Statement statement = conn.createStatement();
									ResultSet resultset = statement.executeQuery(reportSQL);) {
//				System.out.println("query done");
				AlertData alert;
				String cust_email, cust_name, slides_name, msg_id, msgtext, open_time, send_time, sessId;
	//			System.out.println("LOOPING ON QUERY RESULTS");
					while (resultset.next()) {
					 	cust_email = resultset.getString(1);
					 	cust_name = resultset.getString(2);
					 	slides_name = resultset.getString(3);
					 	msg_id = resultset.getString(4);
					 	msgtext = resultset.getString(5);
					 	open_time = resultset.getString(6);
					 	send_time = resultset.getString(7);
					 	sessId = resultset.getString(8);

					  alert = new AlertData();
					  alert.setCustomer_email(cust_email);
					  alert.setSlides_name(slides_name);
					  alert.setMsg_text(msgtext);
					  alert.setOpen_time(open_time);
					  alert.setSend_time(send_time);
					  alert.setMsg_id(msg_id);
					  alert.setCustomer_name(cust_name);
					  alert.setSession_id(sessId);
					  
		//			  System.out.println("query done, values set");
					  // I don't save msg_id and sessId but maybe USE THEM LATER.					    
					  alerts.add(alert);
   			    //System.out.println("Found alert: cust " + cust_email + " sl name " + slides_name + "msgtext" + msgtext + " msgid " + msg_id + " open " + open_time + " send " + send_time + " sess id " + sessId);
					}
			} catch (Exception ex) {
					System.out.println("exception in getAlerts");
					ex.printStackTrace();
			}
			//System.out.println("returning alerts found.");
			return alerts;
		}
		///*********************************************************

		
		// insert into database presentation share with customer. 
		public static int sendMessage(String id, String salesmanEmail, String salesmanEmailpassword, String customer, String slides_ids, String message, String linktext, String subj, int timezone_offset_min){
			String salesMan = null;
			Customer c = getCustomer(customer);
			String query = "INSERT INTO msg_info(id,sales_man_email,customer_email,slides_id,msg_text,timestamp) VALUES "+
			"(?,?,?,?,?, DATE_ADD(UTC_TIMESTAMP(),INTERVAL "+ (-timezone_offset_min)+" MINUTE))";
			try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass); ) {
				PreparedStatement preparedStatement = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
				preparedStatement.setString(1, id);
				preparedStatement.setString(2, salesmanEmail);			
				preparedStatement.setString(3, c.getEmail());
				
				// need to fix this: maybe it's many ids. (now it's one).
				preparedStatement.setString(4, slides_ids);
				
				preparedStatement.setString(5, "Subject:"+ subj + " <BR>Text:<BR>" + message);
				int rowsAffected = preparedStatement.executeUpdate();
				if (rowsAffected == 1) {
					ResultSet generatedKeys = preparedStatement.getGeneratedKeys();
					while (generatedKeys.next()) {
						//System.out.println("while loop");
					}
				}
				preparedStatement.close();
				conn.close();
				//System.out.println("addMessage inserted OK");
			} catch (Exception ex) {
				System.out.println("error76dfdf7: " + ex.getMessage());
				return -1;
			}
			
			//System.out.println("done addMessage- put in table. sending msg now");					
			System.out.println("sendMessage in DB. got customer for name " + customer +  " email " + c.getEmail());
		
		  /*final String username = salesmanEmail; //"yourmail@gmail.com";
		  final String password = salesmanEmailpassword;//"yourpassword";
		  System.out.println("user pw for email is: " + salesmanEmailpassword);
		  Properties props = new Properties();
		  props.put("mail.smtp.host", "smtp.gmail.com");
		  props.put("mail.smtp.socketFactory.port", "465");
		  props.put("mail.smtp.socketFactory.class",
				  	"javax.net.ssl.SSLSocketFactory");
		  props.put("mail.smtp.auth", "true");
		  props.put("mail.smtp.port", "465");	    
		  
	    System.out.println("login with user " + username + " pw " + password);
		  Session session = Session.getDefaultInstance(props,
		  new javax.mail.Authenticator() {
		             protected PasswordAuthentication getPasswordAuthentication() {
		             return new PasswordAuthentication(username,password);
		                     }
		     });
		   try {
		       Message emessage = new MimeMessage(session);
		       emessage.setFrom(new InternetAddress(username));
		       System.out.println("email to : " + c.getEmail());
		       emessage.setRecipients(Message.RecipientType.TO,
		       InternetAddress.parse(c.getEmail()));	       
		       emessage.setSubject(subj);
		       emessage.setText(message + linktext);// + "\n\n Here's the link to the presentation: \n");
		       emessage.setContent(message, "text/html; charset=utf-8");
		       // Transport.send(emessage); // no msg for now.
		       
		       
		       	 
		       System.out.println("Mail sent succesfully! msg " + message + " link " + linktext);
		   } catch (MessagingException e) {		   			
			   		System.out.println("ERROR sending message " + e.getMessage() + " stack: " + e.getStackTrace());
		        throw new RuntimeException(e);
		      }*/
			
			return 1;
		}
		

		// GET history for salesman
		public static ArrayList<HistoryItem> getHistory(String salesman_email){
				
			System.out.println("start get history for email " + salesman_email);
			ArrayList<HistoryItem> his = new ArrayList<HistoryItem>();
			try {
				DriverManager.registerDriver(new com.mysql.jdbc.Driver());
			} catch (SQLException e) {
				e.printStackTrace();
			}		
						
			String historySQL=
					" SELECT DISTINCT customers.name AS 'customer_name', customers.email AS 'customer_email', "+
				  " msg_info.msg_text AS 'message_text', msg_info.id as 'msgid', "+
					" slides.name AS 'slides_name', msg_info.timestamp " +	
					" FROM msg_info, customers, slides " +
					" WHERE " +
					" customers.email=msg_info.customer_email " +
					" AND " +
					" msg_info.slides_id = slides.id " +
					" AND msg_info.sales_man_email='"+ salesman_email + "' " + 
					" ORDER BY " +
					" timestamp DESC";
			
			/* original query tested:
			 * SELECT DISTINCT customers.name AS 'customer_name', customers.email AS 'customer_email', 
				   msg_info.msg_text AS 'message_text', msg_info.id AS 'msgid', 
					 slides.name AS 'slides_name', msg_info.timestamp 
					 FROM msg_info, customers, slides 
					 WHERE 
					 customers.email=msg_info.customer_email
					 AND 
					 msg_info.slides_id = slides.id
					 AND msg_info.sales_man_email='shauli.daon@gmail.com' 
					ORDER BY
					 timestamp DESC;*/
			 
			try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
				Statement statement = conn.createStatement();
									ResultSet resultset = statement.executeQuery(historySQL);) {
//				System.out.println("query done");
				HistoryItem hi;
				String cust_name, cust_email, msgtext, msg_id, slides_name, send_time;
	//			System.out.println("LOOPING ON QUERY RESULTS");
					while (resultset.next()) {
						cust_name = resultset.getString(1);
					 	cust_email = resultset.getString(2);
					 	msgtext = resultset.getString(3);
					 	msg_id = resultset.getString(4);
					 	slides_name = resultset.getString(5);					 						 						 	
					 	send_time = resultset.getString(6);
					 	
					  hi = new HistoryItem(cust_name, cust_email,	msgtext, msg_id, slides_name, send_time);			
		//			  System.out.println("query done, values set");
					  // I don't save msg_id and sessId but maybe USE THEM LATER.					    
					  his.add(hi);
   			    //System.out.println("Found alert: cust " + cust_email + " sl name " + slides_name + "msgtext" + msgtext + " msgid " + msg_id + " open " + open_time + " send " + send_time + " sess id " + sessId);
					}
			} catch (Exception ex) {
					System.out.println("exception in getHistory");
					ex.printStackTrace();
			}
			//System.out.println("returning alerts found.");
			return his;
		}
		///*********************************************************
	
		// GET history for salesman
		public static ArrayList<String> getSessionsByMsgId(String msgid)
		{		
			//System.out.println("start get sess for msgid " + msgid);
			ArrayList<String> sessArr = new ArrayList<String>();
			try {
				DriverManager.registerDriver(new com.mysql.jdbc.Driver());
			} catch (SQLException e) {
				e.printStackTrace();
			}		
						
			String sessSQL=
					"SELECT session_id FROM customer_sessions WHERE msg_id='"+msgid+"'";
			try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
				Statement statement = conn.createStatement();
									ResultSet resultset = statement.executeQuery(sessSQL);) {
		//		System.out.println("query done");
				
				String sessid;
		//			System.out.println("LOOPING ON QUERY RESULTS");
					while (resultset.next()) {
						sessid = resultset.getString(1);
					 	
					 sessArr.add(sessid);		
				//    System.out.println("Found sessid for history. sessid " + sessid + " msgid " + msgid);
					}
			} catch (Exception ex) {
					System.out.println("exception in getHistory");
					ex.printStackTrace();
			}
			//System.out.println("returning alerts found.");
			return sessArr;
		}
		///*********************************************************
		
		// helper function to convert resultset to html
		private static String getResultSetHTML(java.sql.ResultSet rs)
			    throws Exception {
			 int rowCount = 0;
			 String resultStr="";

			 resultStr = "<P ALIGN='center'><TABLE BORDER=1>";
			 ResultSetMetaData rsmd = rs.getMetaData();
			 int columnCount = rsmd.getColumnCount();
			 // table header
			 resultStr += "<TR>";
			 for (int i = 0; i < columnCount; i++) {
				 resultStr += ("<TH>" + rsmd.getColumnLabel(i + 1) + "</TH>");
			   }
			 resultStr +="</TR>";
			 // the data
			 while (rs.next()) {
			  rowCount++;
			  resultStr +="<TR>";
			  for (int i = 0; i < columnCount; i++) {
				  resultStr +="<TD>" + rs.getString(i + 1) + "</TD>";
			    }
			  resultStr +="</TR>";
			  }
			 resultStr +="</TABLE></P>";
			 //return rowCount;
			 return resultStr;
			}

			public static String getAdminReport()
			{
					String HTML="Some reports <BR><BR>";
					
					try {
						DriverManager.registerDriver(new com.mysql.jdbc.Driver());
					} catch (SQLException e) {
						e.printStackTrace();
					}		
								
					ArrayList<String> SQLs = new ArrayList<String>();
					//last to view pres
					SQLs.add("	SELECT " + 
							" msg_info.id, msg_info.sales_man_email,msg_info.customer_email,slides.name, " +
							" customer_events.timestamp " +
							" FROM " +
							" msg_info, customer_events, slides " +
							" WHERE " +
							" slides.id=msg_info.slides_id AND msg_info.id=customer_events.msg_id AND " +
							" customer_events.event_name='OPEN_SLIDES' " + 
							" ORDER BY customer_events.timestamp DESC LIMIT 40;");

					// last to open mgmt console
					SQLs.add(
					" SELECT email, timestamp " +
					" FROM salesman_events "+
					" WHERE event_name='OPEN_MANAGE' "+
					" ORDER BY timestamp DESC "+
					" LIMIT 30; ");


					// last msgs sent
					SQLs.add(
							" SELECT * FROM msg_info ORDER BY timestamp DESC LIMIT 20;");
					
					
					SQLs.add("SELECT * FROM `customer_events` WHERE event_name='SUBSCRIBE'  ORDER BY timestamp DESC LIMIT 30;");
					
					SQLs.add("SELECT * FROM `customer_events` WHERE event_name='CONTACT_US'  ORDER BY timestamp DESC LIMIT 30;");
					
					SQLs.add("SELECT * FROM `customer_events` ORDER BY timestamp DESC LIMIT 200;");
					
					SQLs.add("SELECT * FROM `salesman_events` ORDER BY timestamp DESC LIMIT 200;");
					// last events of customers
					//SQLs.add(
							//" SELECT * FROM customer_events ORDER BY timestamp DESC LIMIT 150;");

									int cntr=0;
					for(String curSQL : SQLs)
					{
							try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
								Statement statement = conn.createStatement();
													ResultSet resultset = statement.executeQuery(curSQL);) {
									switch (cntr)
									{
									case 0:
										HTML+= "<BR>recent presentation views<BR>";
										break;
									case 1:
										HTML+= "<BR>recent online salesmen<BR>";
										break;
									case 2:
										HTML+= "<BR>recent msgs sent<BR>";
										break;
									case 3:
										HTML+= "<BR>mailing list subscribers<BR>";
										break;
									case 4:
										HTML+= "<BR>contact us messages<BR>";
										break;
									case 5:
										HTML+= "<BR>recent customer events<BR>";
										break;
									case 6:
										HTML+= "<BR>recent salesman events<BR>";
										break;										
									}
									cntr++;
								  HTML += getResultSetHTML(resultset);								  
							} catch (Exception ex) {
									System.out.println("exception in SQL query" + ex.getStackTrace().toString());
									ex.printStackTrace();
							}
					}
					return HTML;
			}

}





