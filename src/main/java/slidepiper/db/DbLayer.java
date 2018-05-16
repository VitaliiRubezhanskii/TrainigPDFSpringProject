package slidepiper.db;

import com.google.gson.internal.LinkedTreeMap;
import org.hashids.Hashids;
import org.json.JSONArray;
import org.json.JSONObject;
import slidepiper.config.ConfigProperties;
import slidepiper.constants.Constants;

import javax.xml.bind.DatatypeConverter;
import java.sql.*;
import java.util.*;

public class DbLayer {
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

	//add new customer.
	public static int addNewCustomer(String subAction, String salesMan, String firstName, String lastName,
									 String company, String groupName, String email, String customerID, String phone){
		
		// customer does not exist.
		if (getCustomerName(email, salesMan) == null && !isCustomerIDExist(customerID, salesMan))
		{
		 
				String query = "INSERT INTO customers(email, name, first_name, last_name, sales_man, company, groupName, customer_id, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
							preparedStatement.setString(8, customerID);
							preparedStatement.setString(9, phone);
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
		  String sql = "UPDATE customers SET first_name = ?, last_name = ?, " +
				  "name = ?, company = ?, groupName = ?, " +
				  "customer_id = ?, phone = ? WHERE sales_man = ? AND email = ?";
		  
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
	  	stmt.setString(8, customerID);
	  	stmt.setString(9, phone);
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
	 * Check if a customer record exists in the DB.
	 *
	 * @param customerID The customer email.
	 * @param salesmanEmail The salesman email.
	 *
	 * @return True if a record exists in the DB, otherwise false.
	 */
	public static boolean isCustomerIDExist(String customerID, String salesmanEmail) {
		boolean isCustomerIDExist = false;
		Connection conn = null;
		String sql = "SELECT customer_id FROM customers WHERE customer_id=? AND sales_man=?";

		try {
			conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
			PreparedStatement stmt = conn.prepareStatement(sql);
			stmt.setString(1, customerID);
			stmt.setString(2, salesmanEmail);
			ResultSet rs = stmt.executeQuery();

			rs.last();
			if (1 == rs.getRow()) {
				isCustomerIDExist = true;
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

		return isCustomerIDExist;
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
		String sql = "SELECT subdomain FROM sales_men WHERE email=?";

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
	     * Get a file link widget settings.
	     * 
	     * @return the file link widget settings.
	     */
	   	public static JSONArray getWidgetsSettings(long fileId) {
	   		
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
	    		  + "WHERE FK_file_id_ai = ? AND type IN ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11')";
	 		
	   		JSONArray widgetsSettings = new JSONArray();
	   		
	   		try {
	   		  conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
	        PreparedStatement ps = conn.prepareStatement(sql);
	        
	        ps.setLong(1, fileId);
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

	public static JSONArray getViewerWidgetsSettings(long fileId) {

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
						+ "WHERE FK_file_id_ai = ? AND type IN ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11') " +
						"AND ((data->'$.data.isEnabled' = true AND data->'$.data.items[0].enabled' IS NULL) " +
						"OR (data->'$.data.isEnabled' IS NULL AND data->'$.data.items[0].enabled' = true)) " +
						// Adding widget 5 if only horizontal hopper is enabled
						"UNION " +
						"SELECT data\n" +
						"FROM widget\n" +
						"WHERE FK_file_id_ai = ?\n" +
						"      AND type=5\n" +
						"AND JSON_EXTRACT(data, '$.data.isHorizontalHopperEnabled')";

		JSONArray widgetsSettings = new JSONArray();

		try {
			conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
			PreparedStatement ps = conn.prepareStatement(sql);

			ps.setLong(1, fileId);
			ps.setLong(2, fileId);
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

	// if no cust, returns null.
	public static boolean isCustomerCanAccessDocument(String customer_email, String channel_friendly_id, String salesman_email){
		boolean canAccess = false;

		String query =
				"SELECT id FROM msg_info WHERE customer_email=? AND id=? AND sales_man_email=?;";

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
				statement.setString(2, channel_friendly_id.toLowerCase());
				statement.setString(3, salesman_email.toLowerCase());
				ResultSet resultset = statement.executeQuery();
				// should run only once, limit 1 above.
				if (resultset.next()) {
					canAccess = true;
				}
			} finally{ if(conn!=null){ conn.close();}	}
		} catch (Exception ex) {
			System.out.println("exception in isCustomerCanAccessDocument");
			ex.printStackTrace();

		}

		return canAccess;
	}

	/**
	 * Get all documents customer uploaded on specific portals.
	 *
	 * @param salesman_email A principal name.
	 * @param portalsForCustomer List of portals for every customer
	 *
	 * @return The fetched tabular data from the DB.
	 */
	public static List<String[]> getDocumentsForSpecificPortal(String salesman_email, LinkedTreeMap portalsForCustomer) {
		StringBuilder builder = new StringBuilder();

        ArrayList<String> values = ((ArrayList<String>) portalsForCustomer.get("hash"));

        String[] valueArray = values.toArray(new String[0]);
		values.forEach((v) -> {
			builder.append("?,");
		});

		String sqlQuery = "SELECT customers.email as customer_email, slides.name as portal_name, customer_documents.name as file_name," +
				" customer_documents.friendly_id as file_hash, slides.id as portal_hash FROM customer_documents, msg_info, customers, slides\n" +
				" WHERE customers.sales_man = ? AND msg_info.customer_email = ?\n" +
				" AND msg_info.customer_email = customers.email AND customers.id = customer_documents.customer_id\n" +
				" AND customer_documents.channel_id = msg_info.id_ai AND slides.id = msg_info.slides_id AND msg_info.id IN (" +
				builder.deleteCharAt( builder.length() -1 ).toString() +
				") ORDER BY file_name";

		Connection conn = null;
		List<String[]> dataEventList = new ArrayList<String[]>();

		try {
			conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
			PreparedStatement ps = conn.prepareStatement(sqlQuery);
			ps.setString(1, salesman_email);
			ps.setString(2, portalsForCustomer.get("customer").toString());

			for (int i = 0; i < values.size(); i++) {
				ps.setString(i+3, values.get(i).toString());
				System.out.println(values.get(i).toString());
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
}