package slidepiper.db;

import slidepiper.config.ConfigProperties;

public class Analytics {

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
      + "  (SUM(IF(`event_name` = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE' AND count_event>1,1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_bounce_rate,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE', view_duration, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS average_view_duration,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE', count_event, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS average_pages_viewed\n"
      + "FROM view_file_agg_by_session_event_name\n"
      + "RIGHT JOIN slides ON slides.id = file_hash\n"
      + "INNER JOIN msg_info ON msg_info.slides_id = slides.id\n"
      + "WHERE msg_info.sales_man_email=? AND msg_info.sales_man_email != '' AND msg_info.customer_email='" + ConfigProperties.getProperty("default_customer_email") + "'\n"
      + "GROUP BY slides.id\n"
      + "ORDER BY slides.name, slides.timestamp";
  
  
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
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) * (1 - (SUM(IF(`event_name` = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE' AND count_event>1,1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0))) AS file_sum_actual_view\n"
      + "FROM view_file_agg_by_session_event_name_date\n"
      + "WHERE file_hash=? AND salesman_email=?\n"
      + "GROUP BY date";
  
  
  public static final String sqlTopExitPage =
        "SELECT param1int AS top_exit_page\n"
      + "FROM customer_events\n"
      + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
      + "WHERE msg_info.slides_id=? AND msg_info.sales_man_email=? AND param3str = 'LAST_SLIDE' AND param1int >= 1 AND param2float >= 1\n"
      + "GROUP by param1int\n"
      + "ORDER BY COUNT(param1int) DESC, SUM(param2float), param1int DESC\n"
      + "LIMIT 1";


  public static final String sqlUsersCta =
        "SELECT COUNT(DISTINCT session_id)\n"
      + "FROM customer_events\n"
      + "INNER JOIN msg_info ON msg_info.id = customer_events.msg_id\n"
      + "WHERE msg_info.slides_id=? AND msg_info.sales_man_email=? AND event_name = 'CLICKED_CTA'";
}
