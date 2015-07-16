package slidepiper.logging;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import slidepiper.constants.Constants;
import slidepiper.dataobjects.Customer;
import slidepiper.dataobjects.MessageInfo;
import slidepiper.db.DbLayer;

public class CustomerLogger {

	public static void LogEvent(String id, String event_name, String param1, String param2, String param3, String sessionId)
	{
				System.out.println("Parameters to CustomerLogger.LogEvent: id ..." +id + "event " + event_name +  " param1 " + param1  + " param2 " + param2 + " param3 " + param3 );
				Constants.updateConstants();
				Connection conn = null; // connection to the database
				
				try {
				// connects to the database
				DriverManager.registerDriver(new com.mysql.jdbc.Driver());
				conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
								
							String sql = "INSERT INTO customer_events (msg_id, event_name, param1int, param2float, param3str, notes, timestamp, session_id, done) values (?, ?, ?, ?, ?, '', NOW(), ?, 0)";
							PreparedStatement statement = conn.prepareStatement(sql);
							statement.setString(1, id);						
							statement.setString(2, event_name);
							statement.setInt(3, Integer.parseInt(param1));
							statement.setFloat(4, Float.parseFloat(param2));
							statement.setString(5, param3);						
							statement.setString(6, sessionId);
							
						//	System.out.println("adding customer event name " + event_name + " id " + id + " sessid " + sessionId);
							
							// sends the statement to the database server
							int row = statement.executeUpdate();
							if (row > 0) {
								String message = "Customer Data Servlet. added info line";
							//	System.out.println(message);
								
							}
				}            
				catch (SQLException ex) {
				ex.printStackTrace();
				System.out.println("SQL ERROR" + ex.getMessage());
				//response.getWriter().print("SQL Error: " + ex.getMessage());
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
								
			  final String username = "david.salesmaster@gmail.com"; 	
			  final String password = "davidsales";//"yourpassword";
			  //System.out.println("user pw for email is: " + salesmanEmailpassword);
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
			       			     
			       MessageInfo mi = DbLayer.getMessageInfo(id);
			       System.out.println("email to : " + mi.getSalesManEmail());
			       emessage.setRecipients(Message.RecipientType.TO,
			       InternetAddress.parse(mi.getSalesManEmail()));	       
			       emessage.setSubject("SlidePiper Alert for email " + mi.getCustomerEmail());
			       String msg = "Hello, <BR><BR>This is David Salesmaster. <BR>I am your customer alerts representative.<BR><BR>" + mi.getCustomerEmail() + " has just clicked on the link you sent him! <BR><BR> Regards, <BR>David Salesmaster<BR>SlidePiper Alerts System";
			       emessage.setText(msg);
			       emessage.setContent(msg, "text/html; charset=utf-8");
			       Transport.send(emessage);
			       			       
			       	 
			       System.out.println("Cust alert mail sent succesfully! msg " + msg);
			   } catch (MessagingException e) {		   			
				   		System.out.println("ERROR sending message " + e.getMessage() + " stack: " + e.getStackTrace());
			        throw new RuntimeException(e);
			      }
						
	}
}
