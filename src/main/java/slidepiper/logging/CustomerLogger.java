package slidepiper.logging;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

import slidepiper.constants.Constants;
import slidepiper.dataobjects.Customer;
import slidepiper.dataobjects.MessageInfo;
import slidepiper.db.DbLayer;
import slidepiper.email.EmailSender;

public class CustomerLogger {
	
	public static void LogEvent(String id, String event_name, String param1, String param2, String param3, String sessionId, int timezone_offset_min, String param1Varchar, String param2Varchar, String param3Varchar, String param4Varchar, String param5Varchar, String param6Varchar, String param7Varchar, String param8Varchar, String param9Varchar, String param10Varchar, String param11Varchar)
	{
				//System.out.println("CustLog: id " +id + "event " + event_name +  " prm1 " + param1  + " prm2 " + param2 + " prm3 " + param3 + " timezone offs: " + timezone_offset_min);
				Constants.updateConstants();
				Connection conn = null; // connection to the database
				
				try {
				// connects to the database
				DriverManager.registerDriver(new com.mysql.jdbc.Driver());
				conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
								
							String sql = "INSERT INTO customer_events (msg_id, event_name, param1int, param2float, param3str, notes, session_id, done, param_1_varchar, param_2_varchar, param_3_varchar, param_4_varchar, param_5_varchar, param_6_varchar, param_7_varchar, param_8_varchar, param_9_varchar, param_10_varchar, param_11_varchar) values "
									+ "		(?, ?, ?, ?, ?, '', ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
				//			System.out.println("sql for cust logger is " + sql);
							PreparedStatement statement = conn.prepareStatement(sql);
							statement.setString(1, id);						
							statement.setString(2, event_name);
							statement.setInt(3, Integer.parseInt(param1));
							statement.setFloat(4, Float.parseFloat(param2));
							statement.setString(5, param3);						
							statement.setString(6, sessionId);
							
							statement.setString(7, param1Varchar);
							statement.setString(8, param2Varchar);
							statement.setString(9, param3Varchar);
							statement.setString(10, param4Varchar);
							statement.setString(11, param5Varchar);
							statement.setString(12, param6Varchar);
							statement.setString(13, param7Varchar);
							statement.setString(14, param8Varchar);
							statement.setString(15, param9Varchar);
							statement.setString(16, param10Varchar);
							statement.setString(17, param11Varchar);
							
							// sends the statement to the database server
							int row = statement.executeUpdate();
							if (row > 0) { 
								String message = "custlog: id " +id + " evt " + event_name +  " prm1 " + param1  + " prm2 " + param2 + " prm3 " + param3 ;
								System.out.println(message);								
							}							
							
							// write to sessions table for open slides event
							if (event_name.equalsIgnoreCase("OPEN_SLIDES"))
							{							
										sql = "INSERT INTO customer_sessions (msg_id, ipaddr, session_id, browser, operating_system, all_browser_data, done, report_html) values "
												+ "		(?, ?, ?, ?, ?, ?, 0, '')";
										//System.out.println("sql for OEN_SLIDES is " + sql);
										statement = conn.prepareStatement(sql);
										statement.setString(1, id);						
										statement.setString(2, "1.2.3.4");
										statement.setString(3, sessionId);
										statement.setString(4, "browser");
										statement.setString(5, "os");
										statement.setString(6, param3);																	
										// sends the statement to the database server
										row = statement.executeUpdate();
										if (row > 0) { 
											String message = "CustLog: NEW SESSION!. id " +id + "event " + event_name +  " param1 " + param1  + " param2 " + param2 + " param3 " + param3 ;
											System.out.println(message);								
										}
							}														
				}            
				catch (SQLException ex) {
				ex.printStackTrace();
				System.out.println("SQL ERROR " + ex.getMessage());
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
								
				/// send email for Contact us button
				if (event_name.equalsIgnoreCase("CONTACT_US"))
				{								
						System.out.println("contact us - sending email");											
						EmailSender.sendEmail("info@slidepiper.com", 
								"Contact us has been clicked",
								"Hello, <BR><BR>This is Jacob Salesmaster. <BR>I am your website alerts representative.<BR><BR>The contact us button has been clicked. This is the message:<BR> "+ param3 + "<BR><BR> Glad to serve you, <BR>Jacob Salesmaster<BR>SlidePiper Alerts System"
								);
				}
				
				/// send email for Contact us button
				if (event_name.equalsIgnoreCase("SUBSCRIBE"))
				{								
						System.out.println("subscribe event - sending email");											
						EmailSender.sendEmail("info@slidepiper.com", 
								"Contact has subscribed to the mailing list.",
								"Contact has subscribed to the mailing list. <BR><BR>Contact email: "+ param3 + "<BR><BR> Glad to serve you, <BR>Jacob Salesmaster<BR>SlidePiper Email Subscription Supervisor"
								);
				}

						
	}
}
