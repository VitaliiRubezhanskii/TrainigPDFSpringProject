package slidepiper.db;

import slidepiper.config.ConfigProperties;

public class ViewerAnalytics {
	
	 /**
   * Get likes count per file.
   */
  public static final String sqlFileCountLikes = 
  		"SELECT\n"
  	+ " count(event_name)\n"
  	+ "FROM customer_events\n"
  	+ "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
  	+ "WHERE event_name = 'VIEWER_WIDGET_LIKE_CLICKED'\n"
  	+ "AND msg_info.sales_man_email = ?\n"
  	+ "AND msg_info.slides_id = ?\n"
  	+ "AND msg_info.customer_email <> '" + ConfigProperties.getProperty("test_customer_email") + "'";
	
}
