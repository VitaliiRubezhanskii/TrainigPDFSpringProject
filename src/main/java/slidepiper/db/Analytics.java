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
      + "  DATE_FORMAT(timestamp, '%d-%b-%Y %H:%i:%s') AS date_added_or_modified\n"
      + "FROM slides\n"
      + "WHERE sales_man_email = ?\n"
      + "ORDER BY timestamp DESC";
  
  
  /**
   * The query only returns the default_customer_email file links.
   * 
   * File bounce rate calculation:
   * 1. A file has one or more links which has one or more sessions.
   * 2. Each session is said to be bounced if it has only one VIEW_SLIDE event.
   * 3. A file's bounce rate is calculated by dividing the number of bounced sessions by the
   * total number of sessions.
   */
  public static final String sqlFilesData =
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
      + "RIGHT JOIN slides ON slides.id = file_hash\n"
      + "INNER JOIN msg_info ON msg_info.slides_id = slides.id\n"
      + "WHERE msg_info.sales_man_email=? AND msg_info.sales_man_email != '' AND msg_info.customer_email='" + ConfigProperties.getProperty("default_customer_email") + "'\n"
      + "GROUP BY slides.id\n"
      + "ORDER BY slides.name, slides.timestamp";
  
  
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
      + "  email\n"
      + "FROM customers\n"
      + "WHERE sales_man = ? AND email != '" + ConfigProperties.getProperty("default_customer_email") + "'\n"
      + "ORDER BY first_name, last_name";
  
  
  public static final String sqlCustomersData =
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
    + "RIGHT JOIN slides ON slides.id = file_hash\n"
    + "INNER JOIN msg_info ON msg_info.slides_id = slides.id\n"
    + "WHERE msg_info.sales_man_email=? AND msg_info.sales_man_email != '' AND msg_info.customer_email='" + ConfigProperties.getProperty("default_customer_email") + "'\n"
    + "GROUP BY slides.id\n"
    + "ORDER BY slides.name, slides.timestamp";
  
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
  
  
  public static final String sqlFilePerformanceChart = 
        "SELECT\n"
      + "  t1.date,\n"
      + "  MAX(t1.file_performance) AS max_file_performance,\n"
      + "  AVG(t1.file_performance) AS avg_file_performance,\n"
      + "  t2.file_performance AS individual_file_performance\n"
      + "FROM view_file_performance_agg_by_date_file_hash as t1\n"
      + "LEFT JOIN view_file_performance_agg_by_date_file_hash AS t2 ON t2.date = t1.date AND t2.file_hash = ?\n"
      + "WHERE t1.salesman_email = ?\n"
      + "GROUP BY t1.date\n"
      + "HAVING individual_file_performance IS NOT NULL\n"
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
      + "WHERE msg_info.slides_id=? AND msg_info.sales_man_email=? AND event_name = 'OPEN_SLIDES'\n"
      + "GROUP BY param_2_varchar, param_4_varchar\n"
      + "HAVING latitude IS NOT NULL AND longitude IS NOT NULL AND param_2_varchar IS NOT NULL";
}
