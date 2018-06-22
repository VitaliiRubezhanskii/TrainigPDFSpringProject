package slidepiper.db;

import com.google.gson.internal.LinkedTreeMap;
import com.slidepiper.dto.CustomerDTO;
import com.slidepiper.model.customer.Customer;
import com.slidepiper.repository.CustomerRepository;
import com.slidepiper.repository.DocumentRepository;
import com.slidepiper.repository.IpWhitelistRepository;
import org.hashids.Hashids;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import slidepiper.constants.Constants;
import javax.xml.bind.DatatypeConverter;
import java.sql.*;
import java.util.*;


@Configuration
@PropertySource(name = "myProperties", value = "config.properties")
public class DbLayer {
    private static Boolean initialized = false;

	@Value("${customerDocuments.hashids.salt}")  private  String salt;
	@Value("${customerDocuments.hashids.minHashLength}") private  int minHashLength;
	@Value("${customerDocuments.hashids.alphabet}") private  String alphabet;

    @Autowired
	private  CustomerRepository customerRepository;
    @Autowired
	private DocumentRepository documentRepository;
    @Autowired
    private IpWhitelistRepository ipWhitelistRepository;

    public static void init() {
        if (initialized==false) {
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

	//add new customer.
	public int addNewCustomer(CustomerDTO customerDTO){
		Customer customer=new Customer();
		customer.setEmail(customerDTO.getCustomerEmail());
		customer.setFirstName(customerDTO.getCustomerFirstName());
		customer.setLastName(customerDTO.getCustomerLastName());
		customer.setCompany(customerDTO.getCustomerCompany());
		customer.setUsername(customerDTO.getSalesMan());
		customer.setCustomerId(customerDTO.getCustomerID());
		customer.setPhoneNumber(customerDTO.getCustomerPhone());
		customer.setName(customerDTO.getCustomerFirstName()+" "+customerDTO.getCustomerLastName());
		customer.setCustomerGroup(customerDTO.getCustomerGroup());

		if (customerRepository.findCustomerByEmailAndSalesMan(customerDTO.getCustomerEmail(),
				customerDTO.getSalesMan()) == null &&
				!isCustomerIDExist(customerDTO.getCustomerID(), customerDTO.getSalesMan())) {
			customerRepository.save(customer);
			return 1;
		}else if (null != customerDTO.getSubAction() && customerDTO.getSubAction().equals("add")) {
			return  -1;
		}else if (null != customerDTO.getSubAction() && customerDTO.getSubAction().equals("update")) {
			customerRepository.updateCustomer(customer.getFirstName(), customer.getLastName(), customer.getName(), customer.getCompany(),
					customer.getCustomerGroup(), customer.getCustomerId(), customer.getPhoneNumber(), customer.getUsername(), customer.getEmail());
		}
		return 0;
    }

	/**
   * Check if a customer record exists in the DB.
   *
   * @param customerEmail The customer email.
   * @param  The salesman email.
   *
   * @return True if a record exists in the DB, otherwise false.
   */
	public  boolean isCustomerExist(String salesManEmail, String customerEmail) {
		return customerRepository.findCustomerByEmailAndSalesMan(salesManEmail, customerEmail) != null;
	}
	/**
	 * Check if a customer record exists in the DB.
	 *
	 * @param customerID The customer email.
	 * @param salesmanEmail The salesman email.
	 *
	 * @return True if a record exists in the DB, otherwise false.
	 */
	public boolean isCustomerIDExist(String customerID, String salesmanEmail) {
		return customerRepository.findCustomerByCustomerIdAndSalesMan(customerID, salesmanEmail) != null;
	}
	/**
	 * Check if a customer record exists in the DB.
	 *
	 * @param customerID The customer email.
	 * @param salesmanEmail The salesman email.
	 *
	 * @return True if a record exists in the DB, otherwise false.
	 */
	public  boolean isCustomerIDTakenByAnotherUser(String customerID, String customerEmail, String salesmanEmail) {
		return customerRepository.findCustomerByCustomerIdAndEmailAndSalesMan(customerID, customerEmail, salesmanEmail).size() <= 1;
	}

	  /**
	   * Check if client IP in request matches IP for file in ip_whitelist table.
	   * 
	   * @param fileLinkHash - The file link hash being opened.
	   * @param ip - The IP address of the client request.
	   * @return isIPMatchClientIP - If the client IP matches the IP in the DB.
	   */
	  public  boolean isIPMatchClientIP(String fileLinkHash, String ip) {
		  Object bool=ipWhitelistRepository.isIPMatchClientIP(fileLinkHash, ip);
		  System.out.println(bool.toString()+"--isIPMatchClientIP--");
		  return true;
	  }

//		Constants.updateConstants();
//		try {
//		  Class.forName("com.mysql.cj.jdbc.Driver");
//		} catch (ClassNotFoundException e) {
//		  e.printStackTrace();
//		}
//
//		String sql = "SELECT EXISTS(\n"
//						+ "SELECT\n"
//						+ "	whitelist_ip\n"
//						+ "FROM ip_whitelist\n"
//						+ "INNER JOIN slides ON ip_whitelist.FK_file_id_ai = slides.id_ai "
//				        + "AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
//						+ "INNER JOIN msg_info ON msg_info.slides_id = slides.id\n"
//					    + "WHERE whitelist_ip = ?\n"
//					    + "AND msg_info.id = ?\n"
//					+ ")";
//
//		Connection conn = null;
//		boolean isIPMatchClientIP = false;
//
//	    try {
//		  conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
//		  PreparedStatement ps = conn.prepareStatement(sql);
//
//		  ps.setString(1, ip);
//		  ps.setString(2, fileLinkHash);
//		  ResultSet rs = ps.executeQuery();
//
//		  while(rs.next()) {
//			  isIPMatchClientIP = rs.getBoolean(1);
//		  }
//
//	    } catch (SQLException e) {
//	 		e.printStackTrace();
//		} finally {
//	        if (null != conn) {
//	          try {
//	            conn.close();
//	          } catch (SQLException ex) {
//	            ex.printStackTrace();
//	          }
//	        }
//	    }
//
//		return isIPMatchClientIP;
//	  }
    	
//      /**
//       * Get the file ID from a file hash.
//       *
//       * @param fileHash The file hash.
//       * @return The file ID.
//       */
//      private static int getFileIdFromFileHash(String fileHash) {
//
//        Constants.updateConstants();
//        try {
//          Class.forName("com.mysql.cj.jdbc.Driver");
//        } catch (ClassNotFoundException e) {
//          e.printStackTrace();
//        }
//        Connection conn = null;
//
//        String sql = "SELECT id_ai FROM slides WHERE id = ? AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')";
//
//        int fileId = 0;
//
//        try {
//          conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
//          PreparedStatement stmt = conn.prepareStatement(sql);
//          stmt.setString(1, fileHash);
//
//          ResultSet rs = stmt.executeQuery();
//          if (rs.next()) {
//            fileId = rs.getInt(1);
//          }
//        } catch (SQLException e) {
//          e.printStackTrace();
//        }
//
//        return fileId;
//      }

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
      public  String setFileLinkHash(String customerEmail, String fileHash,
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
				Hashids hashids=new Hashids(salt, minHashLength,alphabet);

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
      public  int setWidgetSettings(JSONObject widgetSetting, String fileHash) {

		  System.out.println("-------setWidgetSettings------");

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

		  int fileId=(int) documentRepository.getDocumentFromFileHash(fileHash).getId();
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