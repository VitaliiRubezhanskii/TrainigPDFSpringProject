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
      + "  timestamp AS date_added_or_modified\n"
      + "FROM slides\n"
      + "WHERE sales_man_email = ? AND slides.fk__document_status__status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
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
  public static final String sqlFilesDataByName =
        "SELECT\n"
      + "  slides.id AS file_hash,\n"
      + "  slides.name AS file_name,\n"
      + "  msg_info.id AS file_link,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS file_sum_open,\n"
      + "  (SUM(IF(event_name = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE' AND count_distinct_pages_viewed>1,1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_bounce_rate,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE', view_duration, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS average_view_duration,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE', count_distinct_pages_viewed, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS average_pages_viewed,\n"
      + "  SUM(IF(event_name = 'CLICKED_CTA', 1, 0)) AS users_cta,\n"
      + "  0.5 * SUM(IF(event_name = 'VIEW_SLIDE' AND count_distinct_pages_viewed>1,1,0)) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) + 0.5 * SUM(IF(event_name = 'CLICKED_CTA', 1, 0)) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_performance\n"
      + "FROM view_file_agg_by_session_event_name\n"
      + "RIGHT JOIN slides ON slides.id = file_hash AND slides.fk__document_status__status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
      + "INNER JOIN msg_info ON msg_info.slides_id = slides.id\n"
      + "WHERE msg_info.sales_man_email=? AND msg_info.sales_man_email != '' AND msg_info.customer_email='" + ConfigProperties.getProperty("default_customer_email") + "'\n"
      + "GROUP BY slides.id\n"
      + "ORDER BY file_name, slides.timestamp";
  
  
  public static final String sqlFilesDataByPerformance =
	        "SELECT\n"
	      + "  slides.id AS file_hash,\n"
	      + "  slides.name AS file_name,\n"
	      + "  msg_info.id AS file_link,\n"
	      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS file_sum_open,\n"
	      + "  (SUM(IF(event_name = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE' AND count_distinct_pages_viewed>1,1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_bounce_rate,\n"
	      + "  SUM(IF(event_name = 'VIEW_SLIDE', view_duration, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS average_view_duration,\n"
	      + "  SUM(IF(event_name = 'VIEW_SLIDE', count_distinct_pages_viewed, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS average_pages_viewed,\n"
	      + "  SUM(IF(event_name = 'CLICKED_CTA', 1, 0)) AS users_cta,\n"
	      + "  0.5 * SUM(IF(event_name = 'VIEW_SLIDE' AND count_distinct_pages_viewed>1,1,0)) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) + 0.5 * SUM(IF(event_name = 'CLICKED_CTA', 1, 0)) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_performance\n"
	      + "FROM view_file_agg_by_session_event_name\n"
	      + "RIGHT JOIN slides ON slides.id = file_hash AND slides.fk__document_status__status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
	      + "INNER JOIN msg_info ON msg_info.slides_id = slides.id\n"
	      + "WHERE msg_info.sales_man_email=? AND msg_info.sales_man_email != '' AND msg_info.customer_email='" + ConfigProperties.getProperty("default_customer_email") + "'\n"
	      + "GROUP BY slides.id\n"
	      + "ORDER BY file_performance DESC, slides.timestamp";
  
  
  /**
   * Get files data given a salesman and a customer email address.
   */
  public static final String sqlFilesCustomerData =
        "SELECT\n"
      + "  file_hash,\n"
      + "  slides.name AS file_name,\n"
      + "  view_file_agg_by_session_event_name.file_link,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS file_sum_open,\n"
      + "  (SUM(IF(event_name = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE' AND count_distinct_pages_viewed>1,1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_bounce_rate,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE', view_duration, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS average_view_duration,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE', count_distinct_pages_viewed, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS average_pages_viewed,\n"
      + "  SUM(IF(event_name = 'CLICKED_CTA', 1, 0)) AS users_cta,\n"
      + "  0.5 * SUM(IF(event_name = 'VIEW_SLIDE' AND count_distinct_pages_viewed>1,1,0)) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) + 0.5 * SUM(IF(event_name = 'CLICKED_CTA', 1, 0)) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_performance#,\n"
      + "  #customers.name AS customer_name,\n"
      + "  #customer_email\n"
      + "FROM view_file_agg_by_session_event_name\n"
      + "INNER JOIN slides ON slides.id = file_hash AND slides.fk__document_status__status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
      + "INNER JOIN customers ON customers.sales_man = salesman_email AND customers.email = customer_email\n"
      + "WHERE salesman_email=? AND customer_email=?\n"
      + "GROUP BY file_hash, customer_email\n"
      + "ORDER BY customers.name, slides.name, slides.timestamp\n";
  
  
  public static final String sqlTopExitPage =
        "SELECT param1int AS top_exit_page\n"
      + "FROM customer_events\n"
      + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
      + "WHERE msg_info.slides_id=? AND msg_info.sales_man_email=? AND param3str = 'LAST_SLIDE' AND param1int >= 1 AND param2float >= 1\n"
      + "GROUP by param1int\n"
      + "ORDER BY COUNT(param1int) DESC, SUM(param2float), param1int DESC\n"
      + "LIMIT 1";
  
  
  public static final String sqlCustomersList =
      "SELECT\n"
      + "  first_name,\n"
      + "  last_name,\n"
      + "  company,\n"
      + "  email,\n"
      + "  customers.timestamp AS 'date',\n"
      + "  COALESCE(groupName, '')\n"
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
      + "JOIN slides ON msg_info.slides_id = slides.id AND slides.fk__document_status__status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
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
  
  
  public static final String sqlFilePerformanceChart = 
	    "SELECT\n"
	  + "  t1.date,\n"
	  + "  t1.file_performance AS max_file_performance,\n"
	  + "  t4.avg_file_performance,\n"
	  + "  t3.individual_file_performance,\n"
	  + "  COALESCE(s1.name, 'File Not Found') AS max_performance_name,\n"
	  + "  COALESCE(s2.name, 'File Not Found') AS file_performance_name\n"
      + "FROM view_file_performance_agg_by_date_file_hash as t1\n"
	  + "INNER JOIN (SELECT date, salesman_email, max(file_performance) AS max_file_performance FROM picascrafxzhbcmd.view_file_performance_agg_by_date_file_hash GROUP BY date, salesman_email) AS t2 ON t1.date = t2.date AND t1.salesman_email = t2.salesman_email AND t1.file_performance = t2.max_file_performance\n"
	  + "LEFT JOIN picascrafxzhbcmd.slides AS s1 ON t1.file_hash = s1.id AND s1.fk__document_status__status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
	  + "INNER JOIN (SELECT date, file_hash, file_performance AS individual_file_performance FROM picascrafxzhbcmd.view_file_performance_agg_by_date_file_hash WHERE file_hash = ?) AS t3 ON t1.date = t3.date\n"
	  + "LEFT JOIN picascrafxzhbcmd.slides AS s2 ON t3.file_hash = s2.id AND s2.fk__document_status__status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
	  + "INNER JOIN (SELECT date, salesman_email, AVG(file_performance) AS avg_file_performance FROM picascrafxzhbcmd.view_file_performance_agg_by_date_file_hash GROUP BY date, salesman_email) AS t4 ON t1.date = t4.date AND t1.salesman_email = t4.salesman_email\n"
	  + "WHERE t1.salesman_email = ?\n"
      + "GROUP BY t1.date, t1.salesman_email\n"
      + "ORDER BY t1.date";

  
  
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
   * Get notifications for notifications toolbar.
   * 
   * Get max 50 notifications.
   * 
   * @see 'Format result from TIMEDIFF as dd:hh:mm:ss' http://stackoverflow.com/questions/12024989/format-result-from-timediff-in-dayshoursminsec
   */
  public static final String sqlToolbarNotifications = 
      "SELECT\n"
	+ "  customer_events.id,\n"	  
	+ "  event_name AS 'event',\n"
    + "  is_notification_read AS 'isRead',\n"		  
	+ "  slides.name AS 'documentName',\n"
	+ "  msg_info.customer_email AS 'customerEmail',\n"
	+ "  customer_events.timestamp AS 'timestamp',\n"
	+ "  current_timestamp() AS 'currentTime',\n"
	+ "  param_3_varchar AS 'messageReplyEmail',\n"
	+ "  param_11_varchar AS 'enteredEmailAddress'\n"
	+ "FROM customer_events\n"
	+ "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
	+ "INNER JOIN slides ON msg_info.slides_id = slides.id AND slides.fk__document_status__status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
	+ "WHERE event_name IN ('OPEN_SLIDES', 'VIEWER_WIDGET_ASK_QUESTION')\n"
	+ "AND msg_info.sales_man_email = ?\n"
	+ "AND customer_events.timestamp > '2016-01-01'\n"
	+ "AND msg_info.customer_email <> '" + ConfigProperties.getProperty("test_customer_email") + "'"
	+ "ORDER BY id DESC LIMIT 50";
  
  
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
	+ "INNER JOIN slides ON msg_info.slides_id = slides.id AND slides.fk__document_status__status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
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
    + "  msg_info.sales_man_email AS 'salesmanEmail'\n"
    + "FROM picascrafxzhbcmd.customer_events\n"
    + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
    + "INNER JOIN slides ON msg_info.slides_id = slides.id AND slides.fk__document_status__status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
    + "WHERE customer_events.id = ?";

  
  /**
   * Get viewer data for SlidePiper Integrations.
   */
  public static final String sqlSessionData = 
	  "SELECT\n"
	+ "  t1.param1int AS page_number,\n"
	+ "  t1.event_name AS event,\n"
	+ "  COUNT(t1.event_name) AS count_event,\n"
	+ "  FLOOR(t2.view_duration) AS view_duration\n"
	+ "FROM customer_events AS t1\n"
	+ "INNER JOIN view_file_page_duration_agg_by_session_page_number AS t2 ON t1.param1int = t2.page_number AND t1.session_id = t2.session_id\n"
	+ "WHERE t1.session_id = ?\n"
	+ "GROUP BY t1.param1int, t1.event_name\n"
	+ "ORDER BY t1.param1int";
}
