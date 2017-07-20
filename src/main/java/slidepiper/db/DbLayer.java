package slidepiper.db;

import org.apache.commons.io.IOUtils;
import org.hashids.Hashids;
import org.json.JSONArray;
import org.json.JSONObject;
import slidepiper.config.ConfigProperties;
import slidepiper.constants.Constants;
import slidepiper.dataobjects.Customer;
import slidepiper.dataobjects.MessageInfo;
import slidepiper.dataobjects.Presentation;

import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

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
						DriverManager.registerDriver(new com.mysql.cj.jdbc.Driver());
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
	      } finally{ if(conn!=null){ conn.close();} }
	    }   
	    catch (Exception ex) {
	      System.out.println("err: " + ex.getMessage());
	    }
	    
	  }


	//add new customer.
	public static int addNewCustomer(String subAction, String salesMan, String firstName, String lastName, String company, String groupName, String email){
		
		// customer does not exist.
		if (getCustomerName(email, salesMan) == null)
		{
		 
				String query = "INSERT INTO customers(email, name, first_name, last_name, sales_man, company, groupName) VALUES (?, ?, ?, ?, ?, ?, ?)";
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
							preparedStatement.setString(7, groupName);
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
		  String sql = "UPDATE customers SET first_name = ?, last_name = ?, name = ?, company = ?, groupName = ? WHERE sales_man = ? AND email = ?";
		  
		  try {
        conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
        PreparedStatement stmt = conn.prepareStatement(sql);
        stmt.setString(1, firstName);
        stmt.setString(2, lastName);
        stmt.setString(3, firstName + " " + lastName);
        stmt.setString(4, company);
        stmt.setString(5, groupName);
        stmt.setString(6, salesMan);
        stmt.setString(7, email);
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
	          Class.forName("com.mysql.cj.jdbc.Driver");
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
				+ " WHERE sales_man_email=? AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION');";
		
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
      Class.forName("com.mysql.cj.jdbc.Driver");
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
	   * Check if client IP in request matches IP for file in ip_whitelist table.
	   * 
	   * @param fileLinkHash - The file link hash being opened.
	   * @param ip - The IP address of the client request.
	   * @return isIPMatchClientIP - If the client IP matches the IP in the DB.
	   */
	  public static boolean isIPMatchClientIP(String fileLinkHash, String ip) {
		  
		Constants.updateConstants();
		try {
		  Class.forName("com.mysql.cj.jdbc.Driver");
		} catch (ClassNotFoundException e) {
		  e.printStackTrace();
		}
		
		String sql = "SELECT EXISTS(\n"
						+ "SELECT\n" 
						+ "	whitelist_ip\n"
						+ "FROM ip_whitelist\n"
						+ "INNER JOIN slides ON ip_whitelist.FK_file_id_ai = slides.id_ai AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
						+ "INNER JOIN msg_info ON msg_info.slides_id = slides.id\n"
					    + "WHERE whitelist_ip = ?\n"
					    + "AND msg_info.id = ?\n"
					+ ")";
		
		Connection conn = null;
		boolean isIPMatchClientIP = false;
		
	    try {
		  conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
		  PreparedStatement ps = conn.prepareStatement(sql); 
		  
		  ps.setString(1, ip);
		  ps.setString(2, fileLinkHash);
		  ResultSet rs = ps.executeQuery();
		  
		  while(rs.next()) {
			  isIPMatchClientIP = rs.getBoolean(1);
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
	    
		return isIPMatchClientIP;
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
    	 * Get the fileHash from a file link hash.
    	 * 
    	 * @param fileLinkHash
    	 * @return fileHash - The fileHash determined by the result of the SQL query.
    	 */
    	public static String getFileHashFromFileLinkHash(String fileLinkHash) {
    		
        Constants.updateConstants();
        try {
          Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
        
    		String fileHash = null;
    		String sql = "SELECT slides_id AS fileHash FROM msg_info WHERE id = ?";
    		
    		Connection conn = null;
    		try {
    			conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
    			PreparedStatement ps = conn.prepareStatement(sql);
    			ps.setString(1, fileLinkHash);
    			ResultSet rs = ps.executeQuery();
    		  
    		  while (rs.next()) {
    				fileHash = rs.getString("fileHash");
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
    		
    		return fileHash;
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
          Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
        Connection conn = null;
        
        String sql = "SELECT id_ai FROM slides WHERE id = ? AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')";
        
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
          Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
        
        String sql = 
              "SELECT slides.id_ai\n"
            + "FROM slides\n"
            + "JOIN msg_info ON msg_info.slides_id = slides.id\n"
            + "WHERE msg_info.id = ? AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')";
        
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
            + " INNER JOIN slides ON msg_info.slides_id=slides.id AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')"
            + " WHERE msg_info.customer_email=? AND msg_info.sales_man_email=?";
        List<String[]> fileLinkList = new ArrayList<String[]>();
        
        try {
          Constants.updateConstants();
          
          try {
            Class.forName("com.mysql.cj.jdbc.Driver");
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
       * Get salesman's notifications from DB.
       * 
       * This method will return notifications either for the Toolbar or for the Notifications Table.
       * 
       * @param salesmanEmail - The salesman email.
       * @param sql - The SQL query.
       * @return notifications - The salesman's notifications.
       */
      public static JSONArray getNotifications(String salesmanEmail, String sql) {
    	  Connection conn = null;
    	  JSONArray notifications = new JSONArray();
          
          try {
            Constants.updateConstants();
            conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
            PreparedStatement ps = conn.prepareStatement(sql);

            ps.setString(1, salesmanEmail);
            
            ResultSet rs = ps.executeQuery();
            ResultSetMetaData md = rs.getMetaData();
			int columnCount = md.getColumnCount();
			
			while (rs.next()) {
			 JSONObject notification = new JSONObject();
			 
			 for (int i = 1; i <= columnCount; i++) {
				 switch (md.getColumnClassName(i)) {
			       case "java.lang.String":
			    	   notification.put(md.getColumnLabel(i), rs.getString(i));
			    	   break;
			    
			       case "java.lang.Integer":
			    	   notification.put(md.getColumnLabel(i), rs.getInt(i));
			    	   break;
			    	   
			       case "java.lang.Boolean":
			    	   notification.put(md.getColumnLabel(i), rs.getBoolean(i));
			    	   break;
			    	   
			       case "java.sql.Timestamp":
			    	   java.util.Calendar cal = Calendar.getInstance();
			    	   cal.setTimeZone(TimeZone.getTimeZone("UTC"));
			    	   
			    	   notification.put(md.getColumnLabel(i), rs.getTimestamp(i, cal));
			    	   break;
				 }
    		 }
			 
			 notifications.put(notification);
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
    	  
		return notifications;
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
			Class.forName("com.mysql.cj.jdbc.Driver");
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
  	 * Get the salesman email from a fileHash.
  	 * 
  	 * @param fileHash - The fileHash.
  	 * @return salesmanEmail - The salesman's email resulting from the SQL query based on
  	 * the fileHash.
  	 */
  	public static String getSalesmanEmailFromFileHash(String fileHash) {
  		
      Constants.updateConstants();
      try {
        Class.forName("com.mysql.cj.jdbc.Driver");
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      }
      
      String salesmanEmail = null;
      String sql = "SELECT sales_man_email AS salesman_email FROM slides WHERE id = ? AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION') LIMIT 1";
      
      Connection conn = null;
      try {
      	conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
      	PreparedStatement ps = conn.prepareStatement(sql);
      	ps.setString(1, fileHash);
      	ResultSet rs = ps.executeQuery();
      	
      	while (rs.next()) {
      		salesmanEmail = rs.getString("salesman_email");
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
  		
  		return salesmanEmail;
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
	        Class.forName("com.mysql.cj.jdbc.Driver");
	      } catch (ClassNotFoundException e) {
	        e.printStackTrace();
	      }
	 		
	      String sql = 
	      		"SELECT\n"
	    		  + "  data\n"
	    		  + "FROM widget\n"
	    		  + "WHERE FK_file_id_ai = ?";
	 		
	   		JSONArray widgetsSettings = new JSONArray();
	   		
	   		try {
	   		  conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
	        PreparedStatement ps = conn.prepareStatement(sql);
	        
	        ps.setInt(1, fileId);
	        ResultSet rs = ps.executeQuery();
			  
				  while (rs.next()) {
						JSONObject widget = new JSONObject();
						widget.put("widgetData", rs.getString("data"));
						widgetsSettings.put(widget);
				  }
				  
				  System.out.println(widgetsSettings.length());
				  
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
	   	
	   	public static JSONObject getWidgetsSettingsByWidgetType(int fileId, String type) {
	   	  JSONObject widget = new JSONObject();
	   	  
  	   	Connection conn = null;
        Constants.updateConstants();
        try {
          Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
       
        String sql = 
            "SELECT\n"
            + "  data,\n"
            + "  type\n"
            + "FROM widget\n"
            + "WHERE FK_file_id_ai = ?\n"
            + "AND type = ?";
       
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement ps = conn.prepareStatement(sql);
          ps.setInt(1, fileId);
          ps.setString(2, type);
          ResultSet rs = ps.executeQuery();
          
          if (rs.next()) {
            widget.put("widgetData", rs.getString("data"));
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
	   	  
	   	  return widget;
	   	}

	   	/**
       * Get widget metrics for the Viewer from the DB.
       * 
       * @param parameterList A list of parameters required for the SQL query.
       * @param sql The SQL query to execute.
       * 
       * @return The fetched tabular data from the DB.
       */
      public static JSONObject getViewerWidgetMetrics(ArrayList<String> parameterList, String sql) {
        
      	Constants.updateConstants();
        try {
          Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }

        JSONObject widgetMetrics = new JSONObject();
        
        Connection conn = null;
        try {
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
            widgetMetrics.put("metrics", row);
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
        
        return widgetMetrics;
      }

     /**
       * Add a customer or salesman event to the DB.
       * 
       * @param tableName The table in the DB in which the event would be inserted into.
       * @param eventName The event name.
       * @param eventDataMap A map connecting between tableName column names and values.
       * 
       * @returns id - the id of the notification just inserted.
       */
      public static long setEvent(String tableName, String eventName, Map<String, String> eventDataMap) {
        String sqlColumns = "event_name";
        String sqlValues = "?";
        long id = 0;
        
        for (Map.Entry<String, String> mapEntry : eventDataMap.entrySet()) {
          sqlColumns += "," + mapEntry.getKey();
          sqlValues += ",?";
        }
          
        String sqlInsert = "INSERT INTO " + tableName + " (" + sqlColumns + ") VALUES (" + sqlValues + ")";
        
        Connection conn = null;
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
          PreparedStatement ps = conn.prepareStatement(sqlInsert, Statement.RETURN_GENERATED_KEYS);
          
          ps.setString(1, eventName);
          int i = 2;
          for (Map.Entry<String, String> mapEntry : eventDataMap.entrySet()) {
            ps.setString(i , mapEntry.getValue());
            i++;
          }
                   
          ps.executeUpdate();
          
          ResultSet rs = ps.getGeneratedKeys();
          if (rs.next()) {
        	  id = rs.getLong(1);
          }
          
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
        
        return id;
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
       * Mark a notification as read.
       * 
       * @param id - The notification id in the customer_events table.
       */
      public static void setNotificationRead(int id) {
    	Connection conn = null;
    	
    	String sql = "UPDATE customer_events SET is_notification_read = true WHERE customer_events.id = ?";
    	
    	try {
    		conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass); 
    		PreparedStatement ps = conn.prepareStatement(sql);
    		
    		ps.setInt(1, id);
    		ps.executeUpdate();
    		
    		System.out.println("SP: Notification Marked Read: " + id);
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
       * Add a Salesman to the DB after performing validation tests. 
       * 
       * @param company   The salesman company.
       * @param email     The salesman email.
       * @param emailClient The salesman email client (Gmail or Outlook).
       * @param firstName   The salesman first name.
       * @param lastName    The salesman last name.
       * @param magic     An administrator password.
       * @param password    The salesman password for logging in.
       * @param promoCode   The promo code. 
       * 
       * @return    A status code representing possible validation errors,
       *        and addition success.  
     * @throws IOException 
       */
      public static int setSalesman(String company, String email, String emailClient, String firstName, String lastName, String password, String signupCode,
    		  String telephone, String promoCode, String viewerToolbarBackground, InputStream viewerToolbarLogoImage, String viewerToolbarLogoLink, String viewerToolbarCTABackground,
    		  String viewerToolbarCta2IsEnabled, String viewerToolbarCta3IsEnabled,
    		  String viewerToolbarCta2Text, String viewerToolbarCta2Link, String viewerToolbarCta1Text, String viewerToolbarCta1Link) throws IOException {
    	  
        int statusCode = 0;

        Constants.updateConstants();
		
		try {
          Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
		
        if (isSalesmanExist(email)) {
          statusCode = 100;
        } else if (! signupCode.equals("piperroi")) {
		  statusCode = 101;
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
          			 + "viewer_toolbar_cta1_collapse_max_width, viewer_toolbar_cta2_collapse_max_width, viewer_toolbar_find_color, telephone, promo_code)\n"
          			 + "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'true', ?, ?, '3px', 'bold 14px Ariel, sans-serif',\n"
            		 + "'3px 5px', '4px 10px 5px', ?, ?, ?, ?, '', ?, ?, '650px', '950px', '1260px', ?, ?, ?)";

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
                stmt.setString(30, promoCode);
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
            Class.forName("com.mysql.cj.jdbc.Driver");
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
            Class.forName("com.mysql.cj.jdbc.Driver");
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
            Class.forName("com.mysql.cj.jdbc.Driver");
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
       * Set a provider access token.
       * 
       * @return The access token.
       */
      public static String setAccessToken(int userId, String provider, String accessToken, Long expiresIn,
          String refreshToken, String redirectUri) {
        
        Constants.updateConstants();
        try {
          Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
        Connection conn = null;
        
        String sql = "INSERT INTO integration (fk_user_id, provider, accessToken, expiresIn, refreshToken, redirectUri) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE accessToken = VALUES(accessToken), expiresIn = VALUES(expiresIn), refreshToken = VALUES(refreshToken), redirectUri = VALUES(redirectUri)";
        
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);  
          PreparedStatement ps = conn.prepareStatement(sql);
          
          ps.setInt(1, userId);
          ps.setString(2, provider);
          ps.setString(3, accessToken);
          ps.setLong(4, expiresIn);
          ps.setString(5, refreshToken);
          ps.setString(6, redirectUri);
          ps.executeUpdate();
          
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
        
        return accessToken;
      }
      
      
      public static void setSalesmenDocumentSettings (Boolean isAlertEmailEnabled, Boolean isReportEmailEnabled,
    		  			Boolean isNotificationEmailEnabled, String salesMan) {
    	  
    	  /**
    	   * @param viewerChatIsEnabled, isAlertEmailEnabled, isReportEmailEnabled
    	   * These settings decide whether chat is enabled, and whether report or alert emails will be 
    	   * sent when a customer opens a salesman's document
    	   */
    	  
    	  Connection conn = null;
    	  
    	  String query = "UPDATE sales_men SET email_alert_enabled = ?, email_report_enabled = ?, email_notifications_enabled = ? WHERE email = ?";
    	  
    	  System.out.println(query);
    	  
    	  try {
    		  conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
              PreparedStatement stmt = conn.prepareStatement(query);
              stmt.setBoolean(1, isAlertEmailEnabled);
              stmt.setBoolean(2, isReportEmailEnabled);
              stmt.setBoolean(3,  isNotificationEmailEnabled);
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
      public static int setWidgetSettings(JSONObject widgetSetting, String fileHash) {
      	int resultCode = 0;
    	
        Constants.updateConstants();
        try {
          Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
          e.printStackTrace();
        }
        Connection conn = null;
        
        String sql = "INSERT INTO widget (FK_file_id_ai, type, data) VALUES (?, ?, ?)\n"
		        		   + "ON DUPLICATE KEY UPDATE\n"
		        		   + "data = VALUES(data)";
        
        JSONObject data = widgetSetting.getJSONObject("data");
        int fileId = DbLayer.getFileIdFromFileHash(fileHash);
        String type = String.valueOf(data.getInt("widgetId"));
        
        try {
          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);	
          PreparedStatement ps = conn.prepareStatement(sql);
          
          ps.setInt(1, fileId);
          ps.setString(2, type);
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

