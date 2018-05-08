package slidepiper.db;

import slidepiper.config.ConfigProperties;

public class Analytics {

  /**
   * Data.
   */
  
  public static final String sqlFilesList =
		"SELECT\n"
				+ "  id AS file_hash,\n"
				+ "  name AS file_name,\n"
				+ "  timestamp AS date_added_or_modified,\n"
				+ "  id_ai AS id,\n"
				+ "  is_process_mode AS is_process_mode\n"
				+ "FROM slides\n"
				+ "WHERE sales_man_email = ? AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
				+ "ORDER BY date_added_or_modified";
  
  
  /**
   * The query only returns the default_customer_email file links.
   * 
   * File bounce rate calculation:
   * 1. A file has one or more links which has one or more sessions.
   * 2. Each session is said to be bounced if it has only one VIEW_SLIDE event.
   * 3. A file's bounce rate is calculated by dividing the number of bounced sessions by the
   * total number of sessions.
   */
  public static final String sqlFileData =
        "SELECT\n"
	  + "  file_hash,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS file_sum_open,\n"
      + "  (SUM(IF(event_name = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE' AND count_distinct_pages_viewed>1,1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_bounce_rate,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE', view_duration, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS average_view_duration,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE', count_distinct_pages_viewed, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS average_pages_viewed,\n"
      + "  SUM(IF(event_name = 'CLICKED_CTA', 1, 0)) AS users_cta\n"
      + "FROM view_file_agg_by_session_event_name\n"
      + "WHERE file_hash = ?";
  
  
  /**
   * Get files data given a salesman and a customer email address.
   */
  public static final String sqlFileCustomerData =
        "SELECT\n"
	  + "  file_hash,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS file_sum_open,\n"
      + "  (SUM(IF(event_name = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE' AND count_distinct_pages_viewed>1,1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_bounce_rate,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE', view_duration, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS average_view_duration,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE', count_distinct_pages_viewed, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS average_pages_viewed,\n"
      + "  SUM(IF(event_name = 'CLICKED_CTA', 1, 0)) AS users_cta\n"
      + "FROM view_file_agg_by_session_event_name\n"
      + "WHERE file_hash = ? AND customer_email = ?";
  
  
  public static final String sqlTopExitPage =
        "SELECT t1.param1int AS top_exit_page\n"
      + "FROM customer_events AS t1\n"
      + "INNER JOIN (SELECT MAX(id) AS max_id FROM customer_events WHERE (param3str = 'LAST_SLIDE' OR (event_name = 'VIEW_SLIDE' AND LENGTH(session_id) = 36)) AND param1int >= 1 AND param2float >= 1 GROUP BY session_id) AS t2 ON t2.max_id = t1.id\n"
      + "INNER JOIN (SELECT id, slides_id, sales_man_email FROM msg_info WHERE slides_id=? AND sales_man_email=?) AS t3 ON t3.id = t1.msg_id\n"
      + "GROUP by t1.param1int\n"
      + "ORDER BY COUNT(t1.param1int) DESC, SUM(t1.param2float), t1.param1int DESC\n"
      + "LIMIT 1";

  
  public static final String sqlCustomersList =
      "SELECT\n"
      + "  first_name,\n"
      + "  last_name,\n"
      + "  company,\n"
      + "  email,\n"
      + "  customers.timestamp AS 'date',\n"
      + "  COALESCE(groupName, ''),\n"
	  + "  id\n"
      + "FROM customers\n"
      + "WHERE sales_man = ? AND email NOT IN ('" + ConfigProperties.getProperty("default_customer_email") + "', '" + ConfigProperties.getProperty("test_customer_email") + "')\n"
      + "ORDER BY date";
  
  
  public static final String sqlCustomersFilesList =
      "SELECT\n"
      + "  msg_info.customer_email,\n"
      +	"  IF(customers.name != '', customers.name, customers.email) AS customer_full_name_or_email,\n"
      + "  msg_info.slides_id AS file_hash,\n"
      + "  slides.name AS file_name\n"
      + "FROM msg_info\n"
      + "JOIN customers ON msg_info.sales_man_email = customers.sales_man AND msg_info.customer_email = customers.email\n"
      + "JOIN slides ON msg_info.slides_id = slides.id AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
      + "WHERE msg_info.sales_man_email=? AND msg_info.customer_email NOT IN ('" + ConfigProperties.getProperty("default_customer_email") + "', '" + ConfigProperties.getProperty("test_customer_email") + "')\n"
      + "GROUP BY msg_info.customer_email, msg_info.slides_id\n"
      + "ORDER BY customer_full_name_or_email";
  
  
  /**
   * Charts.
   */
  
  public static final String sqlFileBarChart =
        "SELECT\n"
      + "  page_number,\n"
      + "  AVG(view_duration) AS average_view_duration\n"
      + "FROM view_file_page_duration_agg_by_session_page_number\n"
      + "WHERE file_hash=? AND salesman_email=?\n"
      + "GROUP BY page_number\n"
      + "ORDER BY page_number";
  
  
  public static final String sqlFileCustomerBarChart =
        "SELECT\n"
      + "  page_number,\n"
      + "  AVG(view_duration) AS average_view_duration\n"
      + "FROM view_file_page_duration_agg_by_session_page_number\n"
      + "WHERE file_hash=? AND salesman_email=? AND customer_email=?\n"
      + "GROUP BY page_number\n"
      + "ORDER BY page_number";
  
  
  /**
   * sum_actual_view is calculated as sum_file_open - (1 * file_bounce_rate)
   */
  public static final String sqlFileLineChart = 
        "SELECT\n"
      + "  date,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS file_sum_open,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE' AND count_distinct_pages_viewed>1,1,0)) AS file_sum_actual_view\n"
      + "FROM view_file_agg_by_session_event_name_date\n"
      + "WHERE file_hash=? AND salesman_email=?\n"
      + "GROUP BY date\n"
      + "HAVING file_sum_open > 0";
  
  
  public static final String sqlFileCustomerLineChart = 
        "SELECT\n"
      + "  date,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS file_sum_open,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE' AND count_distinct_pages_viewed>1,1,0)) AS file_sum_actual_view\n"
      + "FROM view_file_agg_by_session_event_name_date\n"
      + "WHERE file_hash=? AND salesman_email=? AND customer_email=?\n"
      + "GROUP BY date\n"
      + "HAVING file_sum_open > 0";

  
  public static final String sqlFileVisitorsMap =
        "SELECT\n"
      + "  param_9_varchar AS latitude,\n"
      + "  param_10_varchar AS longitude,\n"
      + "  param_5_varchar AS city,\n"
      + "  param_3_varchar AS country,\n"
      + "  COUNT(*) as total_views\n"
      + "FROM customer_events\n"
      + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
      + "WHERE msg_info.slides_id=? AND msg_info.sales_man_email=? AND event_name = 'OPEN_SLIDES' AND msg_info.customer_email != '" + ConfigProperties.getProperty("test_customer_email") + "'\n"
      + "GROUP BY param_2_varchar, param_4_varchar\n"
      + "HAVING latitude IS NOT NULL AND longitude IS NOT NULL AND param_2_varchar IS NOT NULL";
  
  
  public static final String sqlFileCustomerVisitorsMap =
        "SELECT\n"
      + "  param_9_varchar AS latitude,\n"
      + "  param_10_varchar AS longitude,\n"
      + "  param_5_varchar AS city,\n"
      + "  param_3_varchar AS country,\n"
      + "  COUNT(*) as total_views\n"
      + "FROM customer_events\n"
      + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
      + "WHERE msg_info.slides_id=? AND msg_info.sales_man_email=? AND msg_info.customer_email=? AND event_name = 'OPEN_SLIDES'\n"
      + "GROUP BY param_2_varchar, param_4_varchar\n"
      + "HAVING latitude IS NOT NULL AND longitude IS NOT NULL AND param_2_varchar IS NOT NULL";
  
  
  /* Widgets Events Data */
  
  /**
   * Get total number of YouTube video plays per document.
   */
  public static final String sqlFileTotalNumberYouTubePlays = 
	    "SELECT\n"
	  +	"  count(event_name) AS number_of_plays\n" 
	  + "FROM customer_events\n"
	  + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
    + "WHERE event_name = 'VIEWER_WIDGET_VIDEO_YOUTUBE_PLAYED'\n"
    + "AND msg_info.sales_man_email = ?\n"
    + "AND msg_info.slides_id = ?\n"
    + "AND msg_info.customer_email <> '" + ConfigProperties.getProperty("test_customer_email") + "'";
  
  
  /**
   * Get total number of YouTube video plays per file link.
   */
  public static final String sqlFileLinkTotalNumberYouTubePlays = 
		"SELECT\n"
	  +	"	count(event_name) AS number_of_plays\n" 
	  + "FROM customer_events\n"
	  + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
    + "WHERE event_name = 'VIEWER_WIDGET_VIDEO_YOUTUBE_PLAYED'\n"
    + "AND msg_info.sales_man_email = ?\n"
    + "AND msg_info.slides_id = ?\n"
	  + "AND msg_info.customer_email = ?";
  
  
  /**
   * Get questions asked per file.
   */
  public static final String sqlFileWidgetAskQuestion = 
      "SELECT\n"
    + "  DATE_FORMAT(customer_events.timestamp, '%d-%b-%Y') AS date,\n"
    + "  param_2_varchar AS ask_question_message,\n" 
    + "  param_3_varchar AS ask_question_reply_to_email\n"
    + "FROM customer_events\n"
    + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
    + "WHERE event_name = 'VIEWER_WIDGET_ASK_QUESTION'\n"
    + "AND msg_info.sales_man_email = ?\n"
    + "AND msg_info.slides_id = ?\n"
    + "AND msg_info.customer_email <> '" + ConfigProperties.getProperty("test_customer_email") + "'";
  

  /**
   * Get questions asked per file link.
   */
  public static final String sqlFileLinkWidgetAskQuestion = 
    "SELECT\n"
    + "  DATE_FORMAT(customer_events.timestamp, '%d-%b-%Y') AS date,\n"
    + "  param_2_varchar AS ask_question_message,\n" 
    + "  param_3_varchar AS ask_question_reply_to_email\n"
    + "FROM customer_events\n"
    + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
    + "WHERE event_name = 'VIEWER_WIDGET_ASK_QUESTION'\n"
    + "AND msg_info.sales_man_email = ?\n"
    + "AND msg_info.slides_id = ?\n"
    + "AND msg_info.customer_email = ?";
  
  
  /**
   * Get likes count per file.
   */
  public static final String sqlFileCountLikes = 
  		"SELECT\n"
  	+ "  count(event_name)\n"
  	+ "FROM customer_events\n"
  	+ "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
  	+ "WHERE event_name = 'VIEWER_WIDGET_LIKE_CLICKED'\n"
  	+ "AND msg_info.sales_man_email = ?\n"
  	+ "AND msg_info.slides_id = ?\n"
  	+ "AND msg_info.customer_email <> '" + ConfigProperties.getProperty("test_customer_email") + "'";
  
  
  /**
   * Get likes count per customer.
   */
  public static final String sqlCustomerCountLikes = 
  		"SELECT\n"
  	+ "  count(event_name)\n"
  	+ "FROM customer_events\n"
  	+ "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
  	+ "WHERE event_name = 'VIEWER_WIDGET_LIKE_CLICKED'\n"
  	+ "AND msg_info.sales_man_email = ?\n"
  	+ "AND msg_info.slides_id = ?\n"
  	+ "AND msg_info.customer_email = ?";
  
  
  /**
   * Get unique views count per file.
   */
  public static final String sqlFileCountUniqueViews = 
      "SELECT\n"
    + "  COUNT(DISTINCT viewer_id),\n"
    + "  COUNT(DISTINCT session_id)\n"
    + "FROM customer_events\n"
    + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
    + "WHERE viewer_id IS NOT NULL\n"
    + "AND msg_info.sales_man_email = ?\n"
    + "AND msg_info.slides_id = ?\n"
    + "AND msg_info.customer_email <> '" + ConfigProperties.getProperty("test_customer_email") + "'";
  
  
  /**
   * Get unique views count per customer.
   */
  public static final String sqlCustomerCountUniqueViews = 
      "SELECT\n"
    + "  COUNT(DISTINCT viewer_id),\n"
    + "  COUNT(DISTINCT session_id)\n"
    + "FROM customer_events\n"
    + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
    + "WHERE viewer_id IS NOT NULL\n"
    + "AND msg_info.sales_man_email = ?\n"
    + "AND msg_info.slides_id = ?\n"
    + "AND msg_info.customer_email = ?";

  
  /**
   * Get notifications for notifications table.
   * 
   * Get max 1000 notifications.
   */
  public static final String sqlTableNotifications =
	  "SELECT\n"
	+ "  customer_events.id AS 'id',\n"	  
	+ "  msg_info.customer_email AS 'customerEmail',\n"
	+ "  event_name AS 'event',\n"		  
	+ "  customer_events.param_2_varchar AS 'messageText',\n"
	+ "  customer_events.param_3_varchar AS 'messageReplyEmail',\n"
	+ "  slides.name AS 'documentName',\n"
	+ "  customer_events.timestamp AS 'time',\n"
	+ "  param_11_varchar AS 'enteredEmailAddress'\n"
	+ "FROM customer_events\n"
	+ "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
	+ "INNER JOIN slides ON msg_info.slides_id = slides.id AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
	+ "WHERE event_name IN ('OPEN_SLIDES', 'VIEWER_WIDGET_ASK_QUESTION')\n"
	+ "AND msg_info.sales_man_email = ?\n"
	+ "AND msg_info.customer_email <> '" + ConfigProperties.getProperty("test_customer_email") + "'"
	+ "AND customer_events.timestamp > '2016-01-01'\n"
	+ "ORDER BY id DESC LIMIT 1000";
  
  
  /**
   * Get customer email, salesman email, and document name for email notifications. 
   */
  public static final String sqlEmailNotifications =
	  "SELECT\n"
	+ "  msg_info.customer_email AS 'customerEmail',\n"
    + "  slides.name AS 'documentName',\n"
    + "  msg_info.sales_man_email AS 'salesmanEmail',\n"
	+ "  customer_events.param_11_varchar\n"
    + "FROM picascrafxzhbcmd.customer_events\n"
    + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
    + "INNER JOIN slides ON msg_info.slides_id = slides.id AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
    + "WHERE customer_events.id = ?";

	/**
	 * Get files list for specific customer
	 */
	public static final String sqlFilesListForCustomer =
			"SELECT slides.id AS file_hash, name AS file_name, slides.timestamp AS date_added_or_modified, slides.id_ai AS id,\n" +
			" is_process_mode AS is_process_mode FROM slides, msg_info WHERE slides.sales_man_email = ?\n" +
			" AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n" +
			" AND slides.id = msg_info.slides_id\n" +
			" AND msg_info.customer_email = ?\n" +
			" ORDER BY date_added_or_modified";
}
