package slidepiper.db;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.bind.DatatypeConverter;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.io.IOUtils;
import org.hashids.Hashids;
import org.json.JSONArray;
import org.json.JSONObject;

import slidepiper.config.ConfigProperties;
import slidepiper.constants.Constants;
import slidepiper.dataobjects.*;

public class DbLayer {
  
  public static final String CUSTOMER_EVENT_TABLE =
      ConfigProperties.getProperty("customer_event_table");
  public static final String SALESMAN_EVENT_TABLE =
      ConfigProperties.getProperty("salesman_event_table");
	
  private static Boolean initialized = false;
	
	
  public static void init()
  	{	  	
	 	if (initialized==false)
	  	{
					try {
						DriverManager.registerDriver(new com.mysql.jdbc.Driver());
					} catch (SQLException e) {
						e.printStackTrace();
					}
				  Constants.updateConstants();		
					initialized = true;
					System.out.println("Initialized DBLayer: registered driver and updated constants.");
	  	}
	 	
  	}

	public static void deleteCustomer(String customer_email, String salesman_email ){
		String query = "DELETE FROM customers"+
					" WHERE email =?" +
				" AND sales_man=?;";
			
		Connection conn=null;
		try 
		{
			try{				
					conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);						
					PreparedStatement preparedStatement = conn.prepareStatement(query);
					preparedStatement.setString(1, customer_email);
					preparedStatement.setString(2, salesman_email);
					preparedStatement.executeUpdate();
	        preparedStatement.close();
	        System.out.println("customer: " + customer_email + " was deleted!");
			}
			finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
			System.out.println("err: " + ex.getMessage());
		}
		
	}

	public static void deletePresentation(String pres, String salesman_email ){
		String query = "DELETE FROM slides "+
					" WHERE id =?" +
				" AND sales_man_email=?;";
		Connection conn=null;
		try 
		{ 
			try {
					conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass); 
					PreparedStatement statement = conn.prepareStatement(query);				
					statement.setString(1, pres);								
					statement.setString(2,salesman_email);	 						
					statement.executeUpdate();
			    statement.close();
			    System.out.println("pres: " + pres + " was deleted! salesman " + salesman_email);
	        conn.close();
			} finally{ if(conn!=null){ conn.close();}	}
		}		
		catch (Exception ex) {
			System.out.println("err: " + ex.getMessage());
		}
		
	}
	

	
	
	//add new customer.
	public static int addNewCustomer(String subAction, String salesMan, String firstName, String lastName, String company, String email){
		
		// customer does not exist.
		if (getCustomerName(email, salesMan) == null)
		{
		 
				String query = "INSERT INTO customers(email, name, first_name, last_name, sales_man, company) VALUES (?, ?, ?, ?, ?, ?)";
				String fullName = null;
				try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);) 
					{			
					try{
							PreparedStatement preparedStatement = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
							System.err.print(firstName);
							if (! firstName.equals("")) {
							  System.out.print(firstName);
							  fullName = firstName;
							  
							  if (! lastName.equals("")) { 
								fullName += " " + lastName;
							  }
							} else if (! lastName.equals("")) {
							  fullName = lastName;
							}
							
							preparedStatement.setString(1, email.toLowerCase());
							preparedStatement.setString(2, fullName);
							preparedStatement.setString(3, firstName);
							preparedStatement.setString(4, lastName);
							preparedStatement.setString(5, salesMan.toLowerCase());
							preparedStatement.setString(6, company);
							preparedStatement.executeUpdate();
							preparedStatement.close();
							conn.close();
							//System.out.println("new customer inserted! name=" + name + " company: " + company);
							return 1;
					}
					finally{ if(conn!=null){ conn.close();}	}
				} catch (Exception ex) {
					System.out.println("exception in addNewCust");
					ex.printStackTrace();
					return 0;
				}		
		} else if (null != subAction && subAction.equals("add")) {
		  return -1;
		} else if (null != subAction && subAction.equals("update")) {
			// customer already exists.
		  Constants.updateConstants();
      Connection conn = null;
		  String sql = "UPDATE customers SET first_name = ?, last_name = ?, name = ?, company = ? WHERE sales_man = ? AND email = ?";
		  
		  try {
        conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
        PreparedStatement stmt = conn.prepareStatement(sql);
        stmt.setString(1, firstName);
        stmt.setString(2, lastName);
        stmt.setString(3, firstName + " " + lastName);
        stmt.setString(4, company);
        stmt.setString(5, salesMan);
        stmt.setString(6, email);
        stmt.executeUpdate();
      } catch (SQLException ex) {
        System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
      } finally {
        if (null != conn) {
          try {
            conn.close();
          } catch (SQLException ex) {
            ex.printStackTrace();
          }
        }
      }
		  
		  
			return 0;
		}
    
		return 0;
	}
		
	
	public static MessageInfo getMessageInfo(String msgid)
	{
				String id, salesManEmail, customerEmail, slidesId, msgText, timestamp;
												
			String msginfoQuery = "SELECT id, sales_man_email, customer_email, slides_id, msg_text, timestamp " + 
			" FROM msg_info " + 
			" WHERE id=? LIMIT 1;"; // take only 1 result. SHOULD be one.
			//System.out.println("running query to get message info: " + msginfoQuery);
			
			Constants.updateConstants();
			
			try {
	          Class.forName("com.mysql.jdbc.Driver");
	        } catch (ClassNotFoundException e) {
	          e.printStackTrace();
	        }
			
			Connection conn=null;
			try 
			{
				try
				{
						conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);				
						PreparedStatement statement = conn.prepareStatement(msginfoQuery);				
						statement.setString(1, msgid);								
				 		ResultSet resultset = statement.executeQuery();
				 		int rows=0;
							while (resultset.next()) {
								rows++;
								id = resultset.getString(1);
								salesManEmail = resultset.getString(2);
								customerEmail = resultset.getString(3);
								slidesId = resultset.getString(4);
							  msgText = resultset.getString(5);
								timestamp = resultset.getString(6);
								MessageInfo mi = new MessageInfo(id, salesManEmail, customerEmail, slidesId, msgText, timestamp);
								//System.out.println("Got msginfo " + mi.toString());
								return mi;
							}
							if (rows!=1)
							{
								System.out.println("Error in getMessageInfo for msgid " + msgid + " number of rows is not 1, it is "+rows); 								
							}							
				} finally{ if(conn!=null){ conn.close();}	}
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
				
		String viewsQuery = "SELECT param1int as 'slide_num', param2float as 'view_time' " + 
		" FROM customer_events " + 
		" WHERE event_name='VIEW_SLIDE' "+ 
		" AND session_id=? AND done IS FALSE;";

		//System.out.println("slideviews connect db");
		Connection conn =null;
		try 
		{ 
			try{							
					conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
		 			PreparedStatement statement = conn.prepareStatement(viewsQuery);				
				  statement.setString(1, sessionId);								
		 			ResultSet resultset = statement.executeQuery();
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
			}finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
				System.out.println("exception in getSlideViews");
				ex.printStackTrace();
		}
		return views;
	}
	

	public static ArrayList<Customer> getMyCustomers(String smemail){			
		ArrayList<Customer> custs = new ArrayList<Customer>();
				
		String custsQuery = "SELECT name,company, email, sales_man "
				+ " FROM customers " 
				+ " WHERE sales_man=?;";
		
		Connection conn=null;
		try 
		{ 
			try{
					 conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
		 			 PreparedStatement statement = conn.prepareStatement(custsQuery);				
				   statement.setString(1, smemail);								
		 			 ResultSet resultset = statement.executeQuery();			
					 Customer cust;
					 String name, company, email, sales_man;
					 while (resultset.next()) {
							name = resultset.getString(1);
							company = resultset.getString(2);							
							email = resultset.getString(3);
							sales_man = resultset.getString(4);

							String custname = name + " (" + company + ")";
							cust = new Customer(custname, email, sales_man);
							custs.add(cust);					   			   				
					 }
			} finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
				System.out.println("exception in getMycust");
				ex.printStackTrace();
		}
		return custs;
	}

	public static ArrayList<Presentation> getMyPresentations(String smemail){		
		ArrayList<Presentation> presentations = new ArrayList<Presentation>();
				
		String custsQuery = "SELECT name, sales_man_email, id "
				+ " FROM slides " 
				+ " WHERE sales_man_email=?;";
		
		Connection conn =null;
		try 
		{
			try{
					conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
		 		  PreparedStatement statement = conn.prepareStatement(custsQuery);				
			    statement.setString(1, smemail);								
		 			ResultSet resultset = statement.executeQuery();			
					Presentation pres;
					String name, sales_man_email, id;
					while (resultset.next()) {
							name = resultset.getString(1);
							sales_man_email = resultset.getString(2);
							id = resultset.getString(3);
							
							pres = new Presentation(name, sales_man_email, id);
							presentations.add(pres);
					}
			}finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
				System.out.println("exception in getMypres");
				ex.printStackTrace();
		}
		return presentations;
	}


	/*public static ArrayList<String> getQuestions(String sessionId){		
		ArrayList<String> qs = new ArrayList<String>();		
						
		String qsQuery = "SELECT param3str as 'question' " +   
		" FROM customer_events " + 
		" WHERE event_name='CUSTOMER_QUESTION' "+ 
		" AND session_id=?";
		
		Connection conn =null;
		try 
		{ 
			try
			{
						conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
						PreparedStatement statement = conn.prepareStatement(qsQuery);				
						statement.setString(1, sessionId);								
				 		ResultSet resultset = statement.executeQuery();					
						String q;
							while (resultset.next()) {
								q = resultset.getString(1);
								qs.add(q);   			    
							}
			} finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
				System.out.println("exception in getqs");
				ex.printStackTrace();
		}
		return qs;
	}
	*/
	public static ArrayList<String> getChatMessages(String sessionId){		
		ArrayList<String> msgs = new ArrayList<String>();		
						
		String msgsQuery = "SELECT param3str as 'message' " +   
		" FROM customer_events " + 
		" WHERE event_name='CHAT_MESSAGE' "+ 
		" AND session_id=?";
		
		Connection conn =null;
		try 
		{ 
			try
			{
						conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
						PreparedStatement statement = conn.prepareStatement(msgsQuery);				
						statement.setString(1, sessionId);								
				 		ResultSet resultset = statement.executeQuery();					
						String msg;
							while (resultset.next()) {
								msg = resultset.getString(1);
								msgs.add(msg);   			    
							}
			} finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
				System.out.println("exception in getqs");
				ex.printStackTrace();
		}
		return msgs;
	}
	
	public static String getSlidesName(String slidesId){		
		String name = "";		
						
		String query =
				"select name from slides where id=? LIMIT 1;";
		
		Connection conn=null;
		try 
		{
			try{			
						conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
						PreparedStatement statement = conn.prepareStatement(query);				
						statement.setString(1, slidesId);								
				 		ResultSet resultset = statement.executeQuery();								
						// should run only once, limit 1 above.
						while (resultset.next()) {
							name = resultset.getString(1);					   			   
						}
			}	 finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
				System.out.println("exception in getslidesname");
				ex.printStackTrace();
		}
		return name;
	}
	
	public static String getSalesmanMailType(String smemail){		
		String mailtype = "";		
						
		String query =
				"select mailtype from sales_men where email=? LIMIT 1;";
		
		Connection conn=null;
		try 
		{ 
			try
			{
					  conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
						PreparedStatement statement = conn.prepareStatement(query);				
						statement.setString(1, smemail);								
				 		ResultSet resultset = statement.executeQuery();								
						// should run only once, limit 1 above.
							while (resultset.next()) {
								mailtype = resultset.getString(1);					   			   
							}
			} finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
				System.out.println("exception in getsm mailtype");
				ex.printStackTrace();
		}
		return mailtype;
	}
	
	public static CustomerSession getSessionData(String session_id){												
		String query =
				"select * from customer_sessions where session_id=? LIMIT 1;";
		CustomerSession s =null;
		Connection conn=null;
		try 
		{ 
			try
			{
					  conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
						PreparedStatement statement = conn.prepareStatement(query);				
						statement.setString(1, session_id);								
				 		ResultSet resultset = statement.executeQuery();								
						// should run only once, limit 1 above.
							while (resultset.next()) {
								String msg_id = resultset.getString(1);					   			   
								String ipaddr= resultset.getString(2);
								String found_session_id = resultset.getString(3);
								String browser= resultset.getString(4);
								String os= resultset.getString(5);
								String all_browser_data= resultset.getString(6);
								int done= resultset.getInt(7);
								String timestamp= resultset.getString(8);								
								s = new CustomerSession(msg_id, ipaddr, found_session_id, browser, os, all_browser_data, done, timestamp);
							}
			} finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
				System.out.println("exception in getsm mailtype");
				ex.printStackTrace();
		}
		if (s==null)
		{		
			System.out.println("ERROR! cannot find customersession " + session_id);
		}		
		return s;
	}

	
	public static String getSalesmanName(String smemail){		
		String name="";		
						
		String query =
				"select name from sales_men where email=? LIMIT 1;";
		
		Connection conn=null;
		try 
		{ 
			try
			{
					  conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
						PreparedStatement statement = conn.prepareStatement(query);				
						statement.setString(1, smemail);								
				 		ResultSet resultset = statement.executeQuery();								
						// should run only once, limit 1 above.
							while (resultset.next()) {
								name = resultset.getString(1);					   			   
							}
			} finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
				System.out.println("exception in getsm mailtype");
				ex.printStackTrace();
		}
		//System.out.println("GetSalesmanName found name " + name + " for email " + smemail);
		return name;
	}
	
	public static String getSalesmanPassword(String salesman_email){		
		String pwd = "";		
						
		String query =
				"select password from sales_men where email=? LIMIT 1;";
		Connection conn=null;
		try 
		{ 
			try{
						conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
						PreparedStatement statement = conn.prepareStatement(query);				
						statement.setString(1, salesman_email);								
				 		ResultSet resultset = statement.executeQuery();								
						// should run only once, limit 1 above.
							while (resultset.next()) {
								pwd = resultset.getString(1);					   			   
							}
			} finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
				System.out.println("exception in get sm pw");
				ex.printStackTrace();
		}
		return pwd;
	}
	
	// if no cust, returns null.
	public static String getCustomerName(String customer_email, String salesman_email){		
		String name = null;
		
		//System.out.println("getCustomerName for custemail " + customer_email + " smemail " + salesman_email);
						
		String query =		
				"SELECT name FROM customers WHERE name IS NOT NULL AND email=? AND sales_man=? LIMIT 1;";
		
    Constants.updateConstants();
    try {
      Class.forName("com.mysql.jdbc.Driver");
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
    }
    Connection conn = null;
    
		try 
		{ 
			try
			{
					conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
					PreparedStatement statement = conn.prepareStatement(query);				
					statement.setString(1, customer_email.toLowerCase());								
					statement.setString(2, salesman_email.toLowerCase());
			 		ResultSet resultset = statement.executeQuery();								
					// should run only once, limit 1 above.
						while (resultset.next()) {
							name = resultset.getString(1);					   			   
						}
			} finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
				System.out.println("exception in getCustomerName");
				ex.printStackTrace();
								
		}
		
		//System.out.println("getCustomerName for custemail " + customer_email + " smemail " + salesman_email + " NAME FOUND IS: " + name);
			
		return name;
	}
	

	
	
	// get actions - downloaded, printed etc
	public static ArrayList<String> getActions(String sessionId){		
		ArrayList<String> qs = new ArrayList<String>();		
						
		String qsQuery = "SELECT event_name as 'action' " +   
		" FROM customer_events " + 
		" WHERE (event_name='PRINT' OR event_name='DOWNLOAD') "+ 
		" AND session_id=?";
		Connection conn=null;
		try 
		{ 
			try{
						conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
						PreparedStatement statement = conn.prepareStatement(qsQuery);				
						statement.setString(1, sessionId);								
				 		ResultSet resultset = statement.executeQuery();					
						String q;
							while (resultset.next()) {
								q = resultset.getString(1);
								qs.add(q);   			    
							}
			} finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
				System.out.println("exception in getActions");
				ex.printStackTrace();
		}
		return qs;
	}



	
	/////*********************************************************
	// GET ALERTS	 FOR SALESMAN
		public static ArrayList<AlertData> getAlerts(String salesman_email){
				
			System.out.println("start get alerts for email " + salesman_email);
			ArrayList<AlertData> alerts = new ArrayList<AlertData>();
			
			String reportSQL =
					" SELECT cs.session_id AS 'session_id', cs.browser AS 'browser', "
					+" cs.operating_system AS 'os', cs.all_browser_data AS 'all_browser_data', cs.timestamp AS 'open_time', "
					+" mi.msg_text as 'message_text', mi.customer_email as 'customer_email', " 
					+" mi.timestamp as 'send_time', mi.slides_id as 'slides_id' "
					+" FROM customer_sessions cs, msg_info mi " 
					+" WHERE cs.done=0 AND cs.msg_id=mi.id AND mi.sales_man_email=? "
					+" ORDER BY cs.timestamp DESC;";
						 									
			Connection conn=null;
			try 
			{
				try{
				//System.out.println("alerts connect db");
				conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
				PreparedStatement statement = conn.prepareStatement(reportSQL);				
				statement.setString(1, salesman_email);								
			 	ResultSet resultset = statement.executeQuery();
				System.out.println("alerts exec query DONE.");
					while (resultset.next()) {
						String session_id = resultset.getString(1);
								String browser = resultset.getString(2);
								String os = resultset.getString(3);
								String all_browser_data = resultset.getString(4);
								String open_time = resultset.getString(5);
								String message_text =resultset.getString(6);
								String customer_email = resultset.getString(7);
								String send_time =resultset.getString(8);
								String slides_id =resultset.getString(9);
								String slides_name = getSlidesName(slides_id);
								
					//			System.out.println("alerts data received");
						//		System.out.println("alerts ");								
																
								// without customer_name, actions, questions 
								// these need to be pulled out in many concurrent threads.
								AlertData alert = new AlertData(session_id, browser, os, all_browser_data, open_time, 
								message_text, customer_email, null, send_time, slides_id, 
								slides_name, null, null);
								
				//				System.out.println("Alert obj: " + alert.toString());
								
								alerts.add(alert);
   			    //System.out.println("Found alert: cust " + cust_email + " sl name " + slides_name + "msgtext" + msgtext + " msgid " + msg_id + " open " + open_time + " send " + send_time + " sess id " + sessId);
					}
				} finally{ if(conn!=null){ conn.close();}	}
			} catch (Exception ex) {
					System.out.println("exception in getAlerts");
					ex.printStackTrace();
			}
			
			System.out.println("starting load alertdata threads. number of alerts " + alerts.size());
			// arraylist of threads
			ArrayList<LoadAlertDataThread> threads = new ArrayList<LoadAlertDataThread>();
						
			// loop on new threads and start them
			int threadidx = 1;
			for(AlertData alert : alerts)
			{
					LoadAlertDataThread alertThread = new LoadAlertDataThread(alert, salesman_email);
					alertThread.threadidx = threadidx;
					alertThread.start();					
					threads.add(alertThread);
					
					// This is VERY important - run threads in batches of 20.
					// otherwise there's an exception of too many threads.
					// this SOLVES IT completely.
					if ((threadidx%20) ==0) 
					{						
							// wait for it to finish before continuing.
							try{
									alertThread.join();
							}
							catch (InterruptedException ie)
							{
									System.out.println("Error - interrupted exception in thread in 20 batch. " + ie.getStackTrace().toString());
							}
							System.out.println("finished batch of 20 threads, idx is " + threadidx);
					}

					threadidx++;
			}
			
			System.out.println("waiting for last threads to finish.");
			// wait for all threads to finish
			for (LoadAlertDataThread thread : threads)
			{
				try
				{
					//wait for this thread to finish
				  thread.join();
				}
				catch (InterruptedException ie)
				{
					System.out.println("Error - interrupted exception in threads " + ie.getStackTrace().toString());
				}
			}
	
			System.out.println("threads complete. Alerts loaded.");
			
			//System.out.println("returning alerts found.");
			return alerts;
		}
		///*********************************************************
		
		// GET ALERT	 FOR SALESMAN. one alert
		public static AlertData getAlert(String sessionId, String salesman_email){
				
			//System.out.println("start get ALERT (one)");
			AlertData ad = null;
			
			String alertSQL =
					" SELECT cs.session_id AS 'session_id', cs.browser AS 'browser', "
					+" cs.operating_system AS 'os', cs.all_browser_data AS 'all_browser_data', cs.timestamp AS 'open_time', " 
			   	+"	mi.msg_text as 'message_text', mi.customer_email as 'customer_email', " 
					+" mi.timestamp as 'send_time', mi.slides_id as 'slides_id' " 
					+" FROM customer_sessions cs, msg_info mi "
					+" WHERE cs.msg_id=mi.id AND cs.session_id=? LIMIT 1; ";					
						 						
			
			Connection conn=null;
			try 
			{
				try{
				//System.out.println("alerts connect db");
				conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
				PreparedStatement statement = conn.prepareStatement(alertSQL);				
				statement.setString(1, sessionId);								
			 	ResultSet resultset = statement.executeQuery();
				//System.out.println("one alert exec done");
					while (resultset.next()) {
						String session_id = resultset.getString(1);
								String browser = resultset.getString(2);
								String os = resultset.getString(3);
								String all_browser_data = resultset.getString(4);
								String open_time = resultset.getString(5);
								String message_text =resultset.getString(6);
								String customer_email = resultset.getString(7);
								String send_time =resultset.getString(8);
								String slides_id =resultset.getString(9);
								String slides_name = getSlidesName(slides_id);
								
					//			System.out.println("alerts data received");
						//		System.out.println("alerts ");								
																
								// without customer_name, actions, questions 
								// these need to be pulled out in many concurrent threads.
							  ad = new AlertData(session_id, browser, os, all_browser_data, open_time, 
								message_text, customer_email, null, send_time, slides_id, 
								slides_name, null, null);
								
				//				System.out.println("ONE Alert obj: " + ad.toString());
															
   			    //System.out.println("Found alert: cust " + cust_email + " sl name " + slides_name + "msgtext" + msgtext + " msgid " + msg_id + " open " + open_time + " send " + send_time + " sess id " + sessId);
					}
				} finally{ if(conn!=null){ conn.close();}	}
			} catch (Exception ex) {
					System.out.println("exception in getAlert (one)");
					ex.printStackTrace();
			}
			
			LoadAlertDataThread alertThread = new LoadAlertDataThread(ad, salesman_email);
			alertThread.start();
			try
			{
					alertThread.join(); // wait to finish.
			}
			catch (InterruptedException ie)
			{
				System.out.println("Error - interrupted exception in threads " + ie.getStackTrace().toString());
			}
			//System.out.println("returning alert (one)");
			return ad;
		}
		///*********************************************************

		

		
		// insert into database presentation share with customer. 
		public static int sendMessage(String id, String salesmanEmail, String salesmanEmailpassword, String customer_email, String slides_ids, String message, String linktext, String subj, int timezone_offset_min){
			String salesMan = null;
			String query = "INSERT INTO msg_info(id,sales_man_email,customer_email,slides_id,msg_text,timestamp) VALUES "+
			"(?,?,?,?,?, DATE_ADD(UTC_TIMESTAMP(),INTERVAL "+ (-timezone_offset_min)+" MINUTE))";
			try (Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass); ) {
				PreparedStatement preparedStatement = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
				preparedStatement.setString(1, id);
				preparedStatement.setString(2, salesmanEmail);			
				preparedStatement.setString(3, customer_email);
				
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
			System.out.println("sendMessage in DB. got customer for name " + customer_email);
		
			return 1;
		}
		

		// GET history for salesman
		public static ArrayList<HistoryItem> getHistory(String salesman_email){
				
			System.out.println("start get history for email " + salesman_email);
			ArrayList<HistoryItem> his = new ArrayList<HistoryItem>();						
			String historySQL=					
					" SELECT DISTINCT customers.name AS 'customer_name', customers.email AS 'customer_email', " 
					  + " msg_info.msg_text AS 'message_text', msg_info.id AS 'msgid',  "
						+ " slides.name AS 'slides_name', msg_info.timestamp  "
						+ " FROM msg_info, customers, slides "
						+ " WHERE "
						+ " customers.email=msg_info.customer_email "
						+ "	AND	customers.sales_man = ? "
						+ " AND msg_info.slides_id = slides.id " 
						+ " AND msg_info.sales_man_email=? " 
						+" ORDER BY timestamp DESC;";
			
			Connection conn=null;
			try 
			{
				try
				{
						conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
						PreparedStatement statement = conn.prepareStatement(historySQL);				
						statement.setString(1, salesman_email);								
						statement.setString(2, salesman_email);
						ResultSet resultset = statement.executeQuery();
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
		//   			    System.out.println("Found hist item: " + hi.toString());
							}
				} finally{ if(conn!=null){ conn.close();}	}
			} catch (Exception ex) {
					System.out.println("exception in getHistory");
					ex.printStackTrace();
			}
//			System.out.println("returning history items: " + his.toString());
			return his;
		}
		///*********************************************************
	
		// GET history for salesman
		public static ArrayList<String> getSessionsByMsgId(String msgid)
		{		
			//System.out.println("start get sess for msgid " + msgid);
			ArrayList<String> sessArr = new ArrayList<String>();
						
			String sessSQL=
					"SELECT session_id FROM customer_sessions WHERE msg_id=?";
			try 
			{ 
				Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
				PreparedStatement statement = conn.prepareStatement(sessSQL);				
				statement.setString(1, msgid);								
		 		ResultSet resultset = statement.executeQuery();				
				String sessid;
		//			System.out.println("LOOPING ON QUERY RESULTS");
					while (resultset.next()) {
						sessid = resultset.getString(1);
					 	
					 sessArr.add(sessid);		
				//    System.out.println("Found sessid for history. sessid " + sessid + " msgid " + msgid);
					}
					conn.close();
			} catch (Exception ex) {
					System.out.println("exception in getHistory");
					ex.printStackTrace();
			}
			//System.out.println("returning alerts found.");
			return sessArr;
		}
		///*********************************************************
		
		// Get session report htmls for msgid
		public static ArrayList<String> getSessionReportsByMsgId(String msgid)
		{		
			//System.out.println("start get sess for msgid " + msgid);
			ArrayList<String> reportsArr = new ArrayList<String>();
						
			String sessSQL=
					"SELECT report_html FROM customer_sessions WHERE msg_id=?";
			try 
			{ 
				Connection conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
				PreparedStatement statement = conn.prepareStatement(sessSQL);				
				statement.setString(1, msgid);								
		 		ResultSet resultset = statement.executeQuery();				
				String reporthtml;
		//			System.out.println("LOOPING ON QUERY RESULTS");
					while (resultset.next()) {
						reporthtml = resultset.getString(1);
					 	
					 reportsArr.add(reporthtml);		
				//    System.out.println("Found sessid for history. sessid " + sessid + " msgid " + msgid);
					}
					conn.close();
			} catch (Exception ex) {
					System.out.println("exception in getHistory");
					ex.printStackTrace();
			}
			//System.out.println("returning alerts found.");
			return reportsArr;
		}
		///*********************************************************

		
		// helper function to convert resultset to html
		// used in AdminReportsServlet 
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
									conn.close();
							} catch (Exception ex) {
									System.out.println("exception in SQL query" + ex.getStackTrace().toString());
									ex.printStackTrace();
							}
					}
					return HTML;
			}
			
			public static Boolean isSessionDead(String sessid){		

				// if one line is returned, session dead.
				// only zero --> alive.
				String query =
						"select param3str from customer_events where session_id=? AND param3str='LAST_SLIDE';";
								
				Boolean is_dead = false;
				
				System.out.println("Checking Session " + sessid + ". Is it dead or alive?");
				
				Connection conn=null;
				try 
				{ 
					try
					{
							  conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
								PreparedStatement statement = conn.prepareStatement(query);				
								statement.setString(1, sessid);								
						 		ResultSet resultset = statement.executeQuery();								

									while (resultset.next()) {
										// got into here--> session is dead!!
										is_dead = true;
									}
					} finally{ if(conn!=null){ conn.close();}	}
				} catch (Exception ex) {
						System.out.println("exception in getsm mailtype");
						ex.printStackTrace();
				}

				System.out.println("Session " + sessid + " dead? " + is_dead);
				return is_dead;
			}
			
			
			
			// set rows for this sessionId as done. 
			// will not appear in recommendations. 
			public static void updateSessionReport(String sessionId, String reportHtml)
			{
				//System.out.println("setting report for session " + sessionId);
				Constants.updateConstants();
				Connection conn = null; // connection to the database	
				
				try {
				// connects to the database
							conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
															
							String sql = "UPDATE customer_sessions " + 
							" SET report_html = ? " + 
						  " WHERE session_id = ?";									
							PreparedStatement statement = conn.prepareStatement(sql);
							statement.setString(1, reportHtml);
							statement.setString(2, sessionId);						
							
							// sends the statement to the database server
							int row = statement.executeUpdate();
							if (row > 0) {
					//			System.out.println("set reporthtml in cust sess - rows updated: " + row);
								//String message = "updated done.";
							}
							
				}            
				catch (SQLException ex) {
				ex.printStackTrace();
				System.out.println("SQL ERROR in updateSessionReport" + ex.getMessage());
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
			
			 
			/**
       * Check if a customer record exists in the DB.
       * 
       * @param customerEmail The customer email.
       * @param salesmanEmail The salesman email.
       * 
       * @return True if a record exists in the DB, otherwise false.
       */
			public static boolean isCustomerExist(String customerEmail, String salesmanEmail) {
        boolean isEmailExist = false;
        Connection conn = null;
        String sql = "SELECT email FROM customers WHERE email=? AND sales_man=?";
        
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement stmt = conn.prepareStatement(sql);        
          stmt.setString(1, customerEmail);
          stmt.setString(2, salesmanEmail);
          ResultSet rs = stmt.executeQuery();     
          
          rs.last();
          if (1 == rs.getRow()) {
            isEmailExist = true;
          }
        } catch (SQLException ex) {
          System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
        } finally {
          if (null != conn) {
            try {
              conn.close();
            } catch (SQLException ex) {
              ex.printStackTrace();
            }
          }
        }
        
        return isEmailExist;
      }
			
			
			/**
       * Check if a salesman record exists in the DB.
       * 
       * @param email The salesman email to be checked.
       * 
       * @return True if a record exists in the DB, otherwise false.
       */
      public static boolean isSalesmanExist(String email) {
        boolean isEmailExist = false;
        Connection conn = null;
        String sql = "SELECT email FROM sales_men WHERE email=?";
        
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement stmt = conn.prepareStatement(sql);        
          stmt.setString(1, email);
          ResultSet rs = stmt.executeQuery();     
          
          rs.last();
          if (1 == rs.getRow()) {
            isEmailExist = true;
          }
        } catch (SQLException ex) {
          System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
        } finally {
          if (null != conn) {
            try {
              conn.close();
            } catch (SQLException ex) {
              ex.printStackTrace();
            }
          }
        }
        
        return isEmailExist;
      }
			
			
      /**
       * Get data about a specific customer such as his first name. 
       * 
       * @param customerEmail The customer email address.
       * @param salesmanEmail The salesman email address.
       * 
       * @return A map containing data about a specific customer. 
       */
      public static Map<String, String> getCustomer(String customerEmail, String salesmanEmail) {
        
        Connection conn = null;
        Map<String, String> salesmanMap = new HashMap<String, String>();
        String sql = "SELECT * FROM customers WHERE sales_man=? AND email=?";
        
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement ps = conn.prepareStatement(sql);
          ps.setString(1, salesmanEmail);
          ps.setString(2, customerEmail);
          
          ResultSet rs = ps.executeQuery();
          ResultSetMetaData md = rs.getMetaData();
          int columnCount = md.getColumnCount();
          
          if (rs.next()) {
            for (int i = 1; i <= columnCount; i++) {
              salesmanMap.put(md.getColumnLabel(i), rs.getString(i));
            }
          }
        } catch (SQLException ex) {
          System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
          ex.printStackTrace();
        } finally {
          if (null != conn) {
            try {
              conn.close();
            } catch (SQLException ex) {
              ex.printStackTrace();
            }
          }
        }
        
        return salesmanMap;
      }
      
      
      /**
       * Get the customer email associated with a file link hash.
       * 
       * @param fileLinkHash The file link hash.
       * @return The customer email.
       */
      public static String getCustomerEmailFromFileLinkHash(String fileLinkHash) {
        
        Constants.updateConstants();
        try {
          Class.forName("com.mysql.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
        Connection conn = null;
        
        String sql = "SELECT customer_email FROM msg_info WHERE id = ?";
        
        String customerEmail = null;
        
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement stmt = conn.prepareStatement(sql);
          stmt.setString(1, fileLinkHash);
          
          ResultSet rs = stmt.executeQuery();
          if (rs.next()) {
            customerEmail = rs.getString(1);
          }
        } catch (SQLException e) {
          e.printStackTrace();
        }
      
        return customerEmail;
      }
      
      
      /**
       * Get the file ID from a file hash. 
       * 
       * @param fileHash The file hash.
       * @return The file ID.
       */
      public static int getFileIdFromFileHash(String fileHash) {
        
        Constants.updateConstants();
        try {
          Class.forName("com.mysql.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
        Connection conn = null;
        
        String sql = "SELECT id_ai FROM slides WHERE id = ?";
        
        int fileId = 0;
        
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement stmt = conn.prepareStatement(sql);
          stmt.setString(1, fileHash);
           
          ResultSet rs = stmt.executeQuery();
          if (rs.next()) {
            fileId = rs.getInt(1);
          }
        } catch (SQLException e) {
          e.printStackTrace();
        }
      
        return fileId;
      }
      
      
      /**
       * Get the file id from a file link hash. 
       * (A file is the parent of file links)
       * 
       * @param fileLinkHash The file link hash.
       * @return The file id.
       */
      public static int getFileIdFromFileLinkHash(String fileLinkHash) {
        
        Connection conn = null;
        Constants.updateConstants();
        try {
          Class.forName("com.mysql.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
        
        String sql = 
              "SELECT slides.id_ai\n"
            + "FROM slides\n"
            + "JOIN msg_info ON msg_info.slides_id = slides.id\n"
            + "WHERE msg_info.id = ?";
        
        int fileId = 0;

        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement stmt = conn.prepareStatement(sql);
          stmt.setString(1, fileLinkHash);
           
          ResultSet rs = stmt.executeQuery();
          if (rs.next()) {
            fileId = rs.getInt(1);
          }
        } catch (SQLException e) {
          e.printStackTrace();
        }
      
        return fileId;
      }
      
      
      /**
       * Retrieve a salesman customer file links.
       * 
       * @param customerEmail The customer email address.
       * @param salesmanEmail The salesman email address
       * 
       * @return The salesman customer file links.
       */
      public static List<String[]> getFileLinks(String customerEmail, String salesmanEmail) {
        Connection conn = null;
        String sql = "SELECT msg_info.id, slides.name FROM msg_info"
            + " INNER JOIN slides ON msg_info.slides_id=slides.id"
            + " WHERE msg_info.customer_email=? AND msg_info.sales_man_email=?";
        List<String[]> fileLinkList = new ArrayList<String[]>();
        
        try {
          Constants.updateConstants();
          
          try {
            Class.forName("com.mysql.jdbc.Driver");
          } catch (ClassNotFoundException e) {
            e.printStackTrace();
          }
          
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement ps = conn.prepareStatement(sql);
          ps.setString(1, customerEmail);
          ps.setString(2, salesmanEmail);
          
          ResultSet rs = ps.executeQuery();
          String viewerUrl = ConfigProperties.getProperty("viewer_url", salesmanEmail);
          while (rs.next()) {
            String[] row = {
                viewerUrl
                    + ConfigProperties.FILE_VIEWER_PATH + "?"
                    + ConfigProperties.getProperty("file_viewer_query_parameter") + "="
                    + rs.getString(1),
                rs.getString(2)};

            fileLinkList.add(row);
          }
          
        } catch (SQLException ex) {
          System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
          ex.printStackTrace();
        } finally {
          if (null != conn) {
            try {
              conn.close();
            } catch (SQLException ex) {
              ex.printStackTrace();
            }
          }
        }
        
        return fileLinkList;
      }
      
      
      /**
       * Get a file's meta data.
       * 
       * @param fileLinkHash A document file link hash.
       * 
       * @return a file's meta data such as its name, and owner (salesman) email.
       */
      public static Map<String, String> getFileMetaData(String fileLinkHash) {
        Map<String, String> fileMetaData = new HashMap<String, String>();
        
        Constants.updateConstants();
        try {
          Class.forName("com.mysql.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
        Connection conn = null;
        
        String sql = 
            "SELECT slides.id AS fileHash, slides.name AS fileName, slides.sales_man_email AS salesmanEmail FROM slides\n"
          + "INNER JOIN msg_info ON msg_info.slides_id = slides.id\n"
          + "WHERE msg_info.id = ?";
        
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement ps = conn.prepareStatement(sql);
          ps.setString(1, fileLinkHash);
          
          ResultSet rs = ps.executeQuery();
          ResultSetMetaData md = rs.getMetaData();
          int columnCount = md.getColumnCount();
        
          if (rs.next()) {
            for (int i = 1; i <= columnCount; i++) {
              if (null != rs.getString(i)
                  && md.getColumnClassName(i).equals("java.lang.String")) {
                
                fileMetaData.put(md.getColumnLabel(i), rs.getString(i));
              }
            }
          }
        } catch (SQLException ex) {
          System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
          ex.printStackTrace();
        } finally {
          if (null != conn) {
           try {
             conn.close();
           } catch (SQLException ex) {
             ex.printStackTrace();
           }
          }
        }
        
        return fileMetaData;
      }
      
      
      /**
       * Get event related tabular data from the DB.
       * 
       * @param parameterList A list of parameters required for the SQL query.
       * @param sql The SQL query to execute.
       * 
       * @return The fetched tabular data from the DB.
       */
      public static List<String[]> getEventData(ArrayList<String> parameterList, String sql) {
        Connection conn = null;
        List<String[]> dataEventList = new ArrayList<String[]>();
        
        try {
          Constants.updateConstants();
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement ps = conn.prepareStatement(sql);
          for (int i = 0; i < parameterList.size(); i++) {
            ps.setString(i + 1, parameterList.get(i));
          }
          
          ResultSet rs = ps.executeQuery();
          while (rs.next()) {
            String[] row = new String[rs.getMetaData().getColumnCount()];
            for (int i = 0; i < row.length; i++) {
              row[i] = rs.getString(i + 1);
            }
            dataEventList.add(row);
          }
          
        } catch (SQLException ex) {
          System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
          ex.printStackTrace();
        } finally {
          if (null != conn) {
            try {
              conn.close();
            } catch (SQLException ex) {
              ex.printStackTrace();
            }
          }
        }
        
        return dataEventList;
      }
      
      
      /**
       * Get data about a specific salesman such as his first name.
       *
       * @param salesmanEmail The salesman email address.
       *
       * @return A map containing data about a specific salesman.
       *  Binary values retrieved from the DB are converted to a Base64 string.
       */
		public static Map<String, Object> getSalesman(String salesmanEmail) {
			
		Connection conn = null;
		Map<String, Object> salesmanMap = new HashMap<String, Object>();
		String sql = "SELECT * FROM sales_men WHERE email=?";
		
		Constants.updateConstants();
		try {
			Class.forName("com.mysql.jdbc.Driver");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		
		try {
			conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, salesmanEmail);
			
			ResultSet rs = ps.executeQuery();
			ResultSetMetaData md = rs.getMetaData();
			int columnCount = md.getColumnCount();
		
			if (rs.next()) {
			 for (int i = 1; i <= columnCount; i++) {
			   if (null != rs.getString(i)) {
			     switch (md.getColumnClassName(i)) {
			       case "java.lang.String":
			         salesmanMap.put(md.getColumnLabel(i), rs.getString(i));
			         break;
			        
			       case "[B":
			         salesmanMap.put(
			             md.getColumnLabel(i),
			             DatatypeConverter.printBase64Binary(rs.getBytes(i))
			         );
			         break;
			        
			       case "java.lang.Integer":
			         salesmanMap.put(
			             md.getColumnLabel(i),
			             rs.getInt(i)
			         );
			         break;
			       
			       case "java.lang.Boolean":
			    	   salesmanMap.put(
			    		md.getColumnLabel(i),
			    		rs.getBoolean(i)
			    	 );
			    	 break;
		     }
		   }
		 }
		}
		} catch (SQLException ex) {
			System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
			ex.printStackTrace();
		} finally {
			if (null != conn) {
			 try {
			   conn.close();
			 } catch (SQLException ex) {
			   ex.printStackTrace();
			 }
			}
		}
		
		return salesmanMap;
		}
		
		
	    /**
	     * Get a file link widget settings.
	     * 
	     * @param fileLinkHash A file link hash.
	     * @return the file link widget settings.
	     */
	   	public static JSONArray getWidgetsSettings(int fileId) {
	   		
	   		Connection conn = null;
	      Constants.updateConstants();
	      try {
	        Class.forName("com.mysql.jdbc.Driver");
	      } catch (ClassNotFoundException e) {
	        e.printStackTrace();
	      }
	 		
	      String sql = 
	      		"SELECT\n"
	    		  + "  setting AS widget_setting,\n"
	    		  + "  FK_widget_id AS widget_id\n"
	    		  + "FROM widget_setting\n"
	    		  + "WHERE FK_file_id_ai = ?";
	 		
	   		JSONArray widgetsSettings = new JSONArray();
	   		
	   		try {
	   		  conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
	        PreparedStatement ps = conn.prepareStatement(sql);
	        
	        ps.setInt(1, fileId);
	        ResultSet rs = ps.executeQuery();
			  
				  while (rs.next()) {
						JSONObject widget = new JSONObject();
						widget.put("widgetData", rs.getString("widget_setting"));
						widgetsSettings.put(widget);
				  }
	
	   		} catch (SQLException e) {
	   			e.printStackTrace();
	   		} finally {
	          if (null != conn) {
	            try {
	              conn.close();
	            } catch (SQLException ex) {
	              ex.printStackTrace();
	            }
	          }
	      }
	        
	   		return widgetsSettings;
	   	}


     /**
       * Add a customer or salesman event to the DB.
       * 
       * @param tableName The table in the DB in which the event would be inserted into.
       * @param eventName The event name.
       * @param eventDataMap A map connecting between tableName column names and values.
       */
      public static void setEvent(String tableName, String eventName, Map<String, String> eventDataMap) {
        String sqlColumns = "event_name";
        String sqlValues = "?";
        for (Map.Entry<String, String> mapEntry : eventDataMap.entrySet()) {
          sqlColumns += "," + mapEntry.getKey();
          sqlValues += ",?";
        }
          
        String sqlInsert = "INSERT INTO " + tableName + " (" + sqlColumns + ") VALUES (" + sqlValues + ")";
        
        Connection conn = null;
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement ps = conn.prepareStatement(sqlInsert);
          
          ps.setString(1, eventName);
          int i = 2;
          for (Map.Entry<String, String> mapEntry : eventDataMap.entrySet()) {
            ps.setString(i , mapEntry.getValue());
            i++;
          }
                   
          ps.executeUpdate();
          System.out.println("SP: " + eventName);
        } catch (SQLException ex) {
          System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
          ex.printStackTrace();
        } finally {
          if (null != conn) {
            try {
              conn.close();
            } catch (SQLException ex) {
              ex.printStackTrace();
            }
          }
        }
      }
      
      
      /**
       * Set the uploaded file and the file hash referring to it.
       * 
       * @param file A file object received from uploading a file via the frontend.
       * @param salesmanEmail The salesman email address.
       * 
       * @return The file enumerated hash.
       * @throws IOException
       */
      public static String setFileHash(FileItem file, String salesmanEmail, Timestamp localTimestamp) throws IOException {
        
        Connection conn = null;
        String sqlInsert = "INSERT INTO slides (file, sales_man_email, name, local_timestamp) VALUES (?, ?, ?, ?)";
        String sqlSelectAfterInsert = "SELECT id_ai, id FROM slides WHERE id_ai=?";
        String fileHash = null;
        
        try {
          Constants.updateConstants();
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement ps = conn.prepareStatement(sqlInsert, Statement.RETURN_GENERATED_KEYS);                
          
          ps.setBytes(1, IOUtils.toByteArray(file.getInputStream()));
          ps.setString(2, salesmanEmail);
          ps.setString(3, Paths.get(file.getName()).getFileName().toString());
          ps.setTimestamp(4, localTimestamp);
          ps.executeUpdate();
          ResultSet rs = ps.getGeneratedKeys();
          
          if (rs.next()) {
            Hashids hashids = new Hashids(ConfigProperties.getProperty("hashids_salt"), 
                Integer.parseInt(ConfigProperties.getProperty("hashids_minimum_file_hash_length")),
                ConfigProperties.getProperty("hashids_custom_hash_alphabet"));
            long generatedKey = rs.getLong(1);
            fileHash = hashids.encode(generatedKey);
            
            ps = conn.prepareStatement(sqlSelectAfterInsert, ResultSet.TYPE_FORWARD_ONLY,
                ResultSet.CONCUR_UPDATABLE);
            ps.setLong(1, generatedKey);
            rs = ps.executeQuery();
            
            if (rs.next()) {
              rs.updateString("id", fileHash);
              rs.updateRow();
            }
          }
        } catch (SQLException ex) {
          System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
          ex.printStackTrace();
        } finally {
          if (null != conn) {
            try {
              conn.close();
            } catch (SQLException ex) {
              ex.printStackTrace();
            }
          }
        }
        
        return fileHash;
      }
      
      
			/**
       * Set the file link hash used for the file viewer,
       * i.e. www.slidepiper.com/view?f=<file link hash>
       * 
       * @param customerEmail The customer email.
       * @param salesmanEmail The salesman email.
       * @param fileHash A file hash. 
       * 
       * @return The file link enumerated hash.
       */
      public static String setFileLinkHash(String customerEmail, String fileHash,
          String salesmanEmail) {
         
        Connection conn = null;
      
        String sqlSelect = "SELECT id FROM msg_info WHERE msg_text IS NULL"
            + " AND customer_email=? AND slides_id=? AND sales_man_email=?";
        
        String sqlInsert = "INSERT INTO msg_info (customer_email, sales_man_email, slides_id)"
            + " VALUES (?, ?, ?)";
        
        String sqlSelectAfterInsert = "SELECT id_ai, id FROM msg_info WHERE id_ai=?";
        
        String fileLinkHash = null;
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement ps = conn.prepareStatement(sqlSelect);
          
          ps.setString(1, customerEmail);
          ps.setString(2, fileHash);
          ps.setString(3, salesmanEmail);
          ResultSet rs = ps.executeQuery();
          
          if (rs.next()) {
            fileLinkHash = rs.getString("id");
          } else {
            ps = conn.prepareStatement(sqlInsert, Statement.RETURN_GENERATED_KEYS);                
          
            ps.setString(1, customerEmail);
            ps.setString(2, salesmanEmail);
            ps.setString(3, fileHash);
            ps.executeUpdate();
            rs = ps.getGeneratedKeys();
            
            if (rs.next()) {
              Hashids hashids = new Hashids(ConfigProperties.getProperty("hashids_salt"), 
                  Integer.parseInt(ConfigProperties.getProperty("hashids_minimum_file_link_hash_length")),
                  ConfigProperties.getProperty("hashids_custom_hash_alphabet"));
              long generatedKey = rs.getLong(1);
              fileLinkHash = hashids.encode(generatedKey);
              
              ps = conn.prepareStatement(sqlSelectAfterInsert, ResultSet.TYPE_FORWARD_ONLY,
                  ResultSet.CONCUR_UPDATABLE);
              ps.setLong(1, generatedKey);
              rs = ps.executeQuery();
              
              if (rs.next()) {
                rs.updateString("id", fileLinkHash);
                rs.updateRow();
              }
            }
          }
        } catch (SQLException ex) {
          System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
          ex.printStackTrace();
        } finally {
          if (null != conn) {
            try {
              conn.close();
            } catch (SQLException ex) {
              ex.printStackTrace();
            }
          }
        }
        
        return fileLinkHash;
      }

      /**
       * Add a Salesman to the DB after performing validation tests. 
       * 
       * @param company   The salesman company.
       * @param email     The salesman email.
       * @param emailClient The salesman email client (Gmail or Outlook).
       * @param firstName   The salesman first name.
       * @param lastName    The salesman last name.
       * @param magic     An administrator password.
       * @param password    The salesman password for logging in.
       * 
       * @return    A status code representing possible validation errors,
       *        and addition success.  
     * @throws IOException 
       */
      public static int setSalesman(String company, String email, String emailClient, String firstName, String lastName, String password,
    		  String telephone, String viewerToolbarBackground, InputStream viewerToolbarLogoImage, String viewerToolbarLogoLink, String viewerToolbarCTABackground,
    		  String viewerToolbarCta2IsEnabled, String viewerToolbarCta3IsEnabled,
    		  String viewerToolbarCta2Text, String viewerToolbarCta2Link, String viewerToolbarCta1Text, String viewerToolbarCta1Link) throws IOException {
    	  
        int statusCode = 0;

        Constants.updateConstants();
		
		try {
          Class.forName("com.mysql.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
		
        if (isSalesmanExist(email)) {
          statusCode = 100;
        } else {
          Connection conn=null;
          String fullName = firstName + " " + lastName;
          if (null == viewerToolbarCTABackground) {
        	  viewerToolbarCTABackground = "#1B1862";
          }
          String viewerCta1Background = viewerToolbarCTABackground;
          String viewerCta2Background = viewerToolbarCTABackground;
          String viewerCta3Background = viewerToolbarCTABackground;
          String viewerToolbarButtonBackground = viewerToolbarCTABackground;
          String viewerCta3Text = "Contact " + firstName;
          String viewerCta3Link = "mailto:" + email;
          String viewerToolbarColor = null;
          String viewerToolbarFindBackground = null;
          String viewerToolbarFindColor = null;
    	  String viewerToolbarCta1Color = "#fff";
          String viewerToolbarCta2Color = "#fff";
          String viewerToolbarCta3Color = "#fff";
          if (null == viewerToolbarBackground) {
	    	  viewerToolbarBackground = "#fff";
	    	  viewerToolbarColor = "#293846";
	          viewerToolbarFindBackground = "#fff";
	          viewerToolbarFindColor = "#293846";
          } else if (viewerToolbarBackground.equals("#fff")){
        	  viewerToolbarColor = "#293846";
              viewerToolbarFindBackground = "#fff";
              viewerToolbarFindColor = "#293846";
          } else if (viewerToolbarBackground.equals("#293846")) {
        	  viewerToolbarColor = "#fff";
              viewerToolbarFindBackground = "#293846";
              viewerToolbarFindColor = "#fff";
          }
          
          String sql = "INSERT INTO sales_men (company, email, mailtype, first_name, last_name, password, viewer_toolbar_background,\n"
          			 + "viewer_toolbar_logo_image, viewer_toolbar_logo_link, viewer_toolbar_cta2_is_enabled,viewer_toolbar_cta1_is_enabled ,\n"
          			 + "viewer_toolbar_cta2_text, viewer_toolbar_cta2_link, viewer_toolbar_cta3_text, viewer_toolbar_cta3_link, viewer_toolbar_cta1_background,\n"
          			 + "viewer_toolbar_cta2_background, viewer_toolbar_cta3_background, name, viewer_toolbar_cta3_is_enabled, viewer_toolbar_cta1_text,\n"
          			 + "viewer_toolbar_cta1_link, viewer_toolbar_cta_border_radius, viewer_toolbar_cta_font, viewer_toolbar_cta_margin, viewer_toolbar_cta_padding,\n"
          			 + "viewer_toolbar_color, viewer_toolbar_cta1_color, viewer_toolbar_cta2_color, viewer_toolbar_cta3_color, emailpassword,\n"
          			 + "viewer_toolbar_button_background, viewer_toolbar_find_background, viewer_toolbar_logo_collapse_max_width,\n"
          			 + "viewer_toolbar_cta1_collapse_max_width, viewer_toolbar_cta2_collapse_max_width, viewer_toolbar_find_color, telephone)\n"
          			 + "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'true', ?, ?, '3px', 'bold 14px Ariel, sans-serif',\n"
            		 + "'3px 10px 3px 0', '4px 10px 5px', ?, ?, ?, ?, '', ?, ?, '650px', '950px', '1260px', ?, ?)";

              try {
                conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, company);
                stmt.setString(2, email);
                stmt.setString(3, emailClient);
                stmt.setString(4, firstName);
                stmt.setString(5, lastName);
                stmt.setString(6, password);
                stmt.setString(7, viewerToolbarBackground);
                stmt.setBytes(8, IOUtils.toByteArray(viewerToolbarLogoImage)); 
                stmt.setString(9, viewerToolbarLogoLink);
                stmt.setString(10, viewerToolbarCta2IsEnabled);
                stmt.setString(11, viewerToolbarCta3IsEnabled);
                stmt.setString(12, viewerToolbarCta2Text);
                stmt.setString(13, viewerToolbarCta2Link);
                stmt.setString(14,  viewerCta3Text);
                stmt.setString(15,  viewerCta3Link);
                stmt.setString(16, viewerCta1Background);
                stmt.setString(17, viewerCta2Background);
                stmt.setString(18, viewerCta3Background);
                stmt.setString(19, fullName);
                stmt.setString(20, viewerToolbarCta1Text);
                stmt.setString(21, viewerToolbarCta1Link);
                stmt.setString(22, viewerToolbarColor);
                stmt.setString(23, viewerToolbarCta1Color);
                stmt.setString(24, viewerToolbarCta2Color);
                stmt.setString(25, viewerToolbarCta3Color);	
                stmt.setString(26, viewerToolbarButtonBackground);
                stmt.setString(27, viewerToolbarFindBackground);
                stmt.setString(28, viewerToolbarFindColor);
                stmt.setString(29, telephone);
                stmt.executeUpdate();
                
                // The user was added successfully.
                statusCode = 200;
              } catch (SQLException ex) {
                System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
              } finally {
                if (null != conn) {
                  try {
                    conn.close();
                  } catch (SQLException ex) {
                    ex.printStackTrace();
                  }
                }
              }
            }
        	return statusCode;
         }
      
      public static int updateNavbarLogo (InputStream logo, String salesman) throws IOException {
    	  
    	  Connection conn = null;
    	  Constants.updateConstants();
  		  int statusCode = 0;	
    	  
  		  try {
            Class.forName("com.mysql.jdbc.Driver");
          } catch (ClassNotFoundException e) {
            e.printStackTrace();
          }
  		  
  		  String sql = "UPDATE sales_men SET viewer_toolbar_logo_image = ? WHERE email = ?";
  		  
  		  try {
			conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
			PreparedStatement stmt = conn.prepareStatement(sql);
			stmt.setBytes(1, IOUtils.toByteArray(logo));
			stmt.setString(2,  salesman);
			stmt.executeUpdate();
			
			statusCode = 200;
	      } catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
	      }
    	  return statusCode;
      }
      
      public static int updateNavbarSettings (String salesman, String viewerToolbarBackground, String viewerToolbarLogoLink,
    		  String viewerToolbarCTABackground, String viewerToolbarCta2IsEnabled, String viewerToolbarCta3IsEnabled, String viewerToolbarCta2Text,
    		  String viewerToolbarCta2Link, String viewerToolbarCta3Text, String viewerToolbarCta3Link, String viewerToolbarTextColor, String viewerToolbarCTATextColor,
    		  String viewerToolbarCta1IsEnabled, String viewerToolbarCta1Text, String viewerToolbarCta1Link,
    		  String viewerToolbarButtonBackground) throws IOException {
    	  
    	  int statusCode = 0;
    	  Connection conn = null;
    	  Constants.updateConstants();
  			
  		  try {
            Class.forName("com.mysql.jdbc.Driver");
          } catch (ClassNotFoundException e) {
            e.printStackTrace();
          }
  		  
  		  String sql = "UPDATE sales_men SET viewer_toolbar_background = ?, viewer_toolbar_logo_link = ?,"
  		  		+ "viewer_toolbar_cta1_background = ?, viewer_toolbar_cta2_background = ?, viewer_toolbar_cta3_background = ?,"
  		  		+ "viewer_toolbar_cta2_is_enabled = ?, viewer_toolbar_cta3_is_enabled = ?, "
  		  		+ "viewer_toolbar_cta2_text = ?, viewer_toolbar_cta2_link = ?, viewer_toolbar_cta3_text = ?, viewer_toolbar_cta3_link = ?,"
  		  		+ "viewer_toolbar_cta1_color = ?, viewer_toolbar_cta2_color = ?, viewer_toolbar_cta3_color = ?,"
  		  		+ "viewer_toolbar_color = ?, viewer_toolbar_find_color = ?, viewer_toolbar_find_background = ?,"
  		  		+ "viewer_toolbar_cta1_is_enabled = ?, viewer_toolbar_cta1_text = ?, viewer_toolbar_cta1_link = ?,"
  		  		+ "viewer_toolbar_button_background = ? WHERE email = ?";
    	  
  		try {
			conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
			PreparedStatement stmt = conn.prepareStatement(sql);
			
			stmt.setString(1, viewerToolbarBackground);
			stmt.setString(2,  viewerToolbarLogoLink);
			stmt.setString(3, viewerToolbarCTABackground);
			stmt.setString(4, viewerToolbarCTABackground);
			stmt.setString(5, viewerToolbarCTABackground);
			stmt.setString(6,  viewerToolbarCta2IsEnabled);
			stmt.setString(7,  viewerToolbarCta3IsEnabled);
			stmt.setString(8,  viewerToolbarCta2Text);
			stmt.setString(9,  viewerToolbarCta2Link);
			stmt.setString(10, viewerToolbarCta3Text);
			stmt.setString(11, viewerToolbarCta3Link);
			stmt.setString(12, viewerToolbarCTATextColor);
			stmt.setString(13, viewerToolbarCTATextColor);
			stmt.setString(14, viewerToolbarCTATextColor);
			stmt.setString(15, viewerToolbarTextColor);
			stmt.setString(16, viewerToolbarTextColor);
			stmt.setString(17, viewerToolbarBackground);
			stmt.setString(18, viewerToolbarCta1IsEnabled);
			stmt.setString(19, viewerToolbarCta1Text);
			stmt.setString(20, viewerToolbarCta1Link);
			stmt.setString(21, viewerToolbarButtonBackground);
			stmt.setString(22, salesman);
		
			stmt.executeUpdate();
			statusCode = 200;
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	  return statusCode;
      }
       
      public static ArrayList<Object> getNavbarSettings (String salesman){
    	  
    	  Connection conn = null;
    	  Constants.updateConstants();
  		  HashMap<String, Object> navbarSettings = new HashMap<String, Object>();
  		  ArrayList<Object> resultList = new ArrayList<Object>();
    	  
  		  try {
            Class.forName("com.mysql.jdbc.Driver");
          } catch (ClassNotFoundException e) {
            e.printStackTrace();
          }
    	  
    	  String sql = "SELECT viewer_toolbar_background, viewer_toolbar_logo_link, viewer_toolbar_cta1_background, "
    	  		    + "viewer_toolbar_cta2_is_enabled, viewer_toolbar_cta3_is_enabled, viewer_toolbar_cta2_text, "
    	  		    + "viewer_toolbar_cta2_link, viewer_toolbar_cta3_text, viewer_toolbar_cta3_link, viewer_toolbar_cta1_color, "
    	  		    + "viewer_toolbar_color, viewer_toolbar_cta1_is_enabled, viewer_toolbar_cta1_text,"
    		  		+ "viewer_toolbar_cta1_link FROM sales_men WHERE email = ?";
    	  
    	  try {
			conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
			PreparedStatement stmt = conn.prepareStatement(sql);
			stmt.setString(1, salesman);
			
			ResultSet rs = stmt.executeQuery();
			ResultSetMetaData md = rs.getMetaData();
			int columns = md.getColumnCount();
			
			while (rs.next()) {
			   for (int i = 1; i <= columns; ++i) {
				  if (md.getColumnName(i).equals("viewer_toolbar_cta1_background")) {
					  navbarSettings.put("viewer_toolbar_cta_background", rs.getObject(i));  
				  } else if (md.getColumnName(i).equals("viewer_toolbar_color")) {
					  navbarSettings.put("viewer_toolbar_text_color", rs.getObject(i)); 
				  } else if (md.getColumnName(i).equals("viewer_toolbar_cta1_color")) {
					  navbarSettings.put("viewer_toolbar_cta_text_color", rs.getObject(i)); 
				  } else {
					  navbarSettings.put(md.getColumnName(i), rs.getObject(i));
				  }
			   }
			   resultList.add(navbarSettings);
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	  
		return resultList;
      }
      
      /**
       * Update (replace) a file with a different one.
       * 
       * @param file The file blob.
       * @param fileHash The file hash.
       * @param fileName The file name.
       * @param salesmanEmail The salesman email address.
       * 
       * @throws IOException
       */
      public static void updateFile(FileItem file, String fileHash, String fileName,
          String salesmanEmail, Timestamp localTimestamp) throws IOException {

        Constants.updateConstants();
        Connection conn = null;
        String sql = "UPDATE slides SET file = ?, name = ?, timestamp = CURRENT_TIMESTAMP, local_timestamp = ? WHERE id = ? AND sales_man_email = ?";
        
        try {
	      try {
			DriverManager.registerDriver(new com.mysql.jdbc.Driver());
		  } catch (SQLException e) {
			e.printStackTrace();
		  }	
        	
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement stmt = conn.prepareStatement(sql);
          stmt.setBytes(1, IOUtils.toByteArray(file.getInputStream()));
          stmt.setString(2, fileName);
          stmt.setTimestamp(3, localTimestamp);
          stmt.setString(4, fileHash);
          stmt.setString(5, salesmanEmail);
          
          stmt.executeUpdate();
        } catch (SQLException ex) {
          System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
        } finally {
          if (null != conn) {
            try {
              conn.close();
            } catch (SQLException ex) {
              ex.printStackTrace();
            }
          }
        }
      }
      
      public static void setSalesmenDocumentSettings (String isChatEnabled, Boolean isAlertEmailEnabled, Boolean isReportEmailEnabled,
    		  			String salesMan) {
    	  
    	  /**
    	   * @param viewerChatIsEnabled, isAlertEmailEnabled, isReportEmailEnabled
    	   * These settings decide whether chat is enabled, and whether report or alert emails will be 
    	   * sent when a customer opens a salesman's document
    	   */
    	  
    	  Connection conn = null;
    	  
    	  String query = "UPDATE sales_men SET viewer_is_chat_enabled = ?, email_alert_enabled = ?, email_report_enabled = ? WHERE email = ?";
    	  
    	  System.out.println(query);
    	  
    	  try {
    		  conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
              PreparedStatement stmt = conn.prepareStatement(query);
              stmt.setString(1, isChatEnabled);
              stmt.setBoolean(2, isAlertEmailEnabled);
              stmt.setBoolean(3, isReportEmailEnabled);
              stmt.setString(4, salesMan);
              stmt.executeUpdate();
    	  }
    	  catch (SQLException ex) {
              System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
    	  }
    	  
      }
      
      /**
       * Save a file widgets settings.
       * 
       * The settings are saved one at a time per widget
       * 
       * @param widgetSetting - The file widget settings.
       * 
       * @returns resultCode - A number representing the status of the operation.
       */
      public static int setWidgetSettings(JSONObject widgetSetting) {
      	int resultCode = 0;
    	
        Constants.updateConstants();
        try {
          Class.forName("com.mysql.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
        Connection conn = null;
        
        String sql = "INSERT INTO widget_setting (FK_file_id_ai, FK_widget_id, setting) VALUES (?, ?, ?)\n"
		        		   + "ON DUPLICATE KEY UPDATE\n"
		        		   + "setting = VALUES(setting)";
        
        JSONObject data = widgetSetting.getJSONObject("data");
        int fileId = DbLayer.getFileIdFromFileHash(data.getString("fileHash"));
        int widgetId = data.getInt("widgetId");
        
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);	
          PreparedStatement ps = conn.prepareStatement(sql);
          
          ps.setInt(1, fileId);
          ps.setInt(2, widgetId);
          ps.setString(3, widgetSetting.toString());
          ps.executeUpdate();
          
          resultCode = 1;
        } catch (SQLException ex) {
          System.err.println("Error code: " + ex.getErrorCode() + " - " + ex.getMessage());
          ex.printStackTrace();
        } finally {
          if (null != conn) {
            try {
              conn.close();
            } catch (SQLException ex) {
              ex.printStackTrace();
            }
          }
        }
        
        return resultCode;
      }
}

