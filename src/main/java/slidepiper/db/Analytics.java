package slidepiper.db;

import slidepiper.config.ConfigProperties;

public class Analytics {
  
  /*
  public static final String sqlFileList =
      "SELECT id, name FROM slides WHERE sales_man_email=? ORDER BY name";
  */
  
  /**
   * File bounce rate calculation:
   * 1. A file has one or more links which has one or more sessions.
   * 2. Each session is said to be bounced if it has only one VIEW_SLIDE event.
   * 3. A file's bounce rate is calculated by dividing the number of bounced sessions by the
   * total number of sessions.
   */
  public static final String sqlFileData =
        "SELECT\n"
      + "  file_hash,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS sum_file_open,\n"
      + "  (SUM(IF(`event_name` = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE' AND count_event>1,1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_bounce_rate\n"
      + "FROM view_file_agg_by_session_event_name_min_1_sec_min_1_page\n"
      + "WHERE param2float>=1 AND salesman_email=? AND file_hash=?\n"
      + "GROUP BY file_hash";
  
  
  /**
   * The query only returns the default_customer_email file links.
   */
  public static final String sqlFilesData =
        "SELECT\n"
      + "  slides.id AS file_hash,\n"
      + "  slides.name AS file_name,\n"
      + "  msg_info.id AS file_link,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS sum_file_open,\n"
      + "  (SUM(IF(`event_name` = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE' AND count_event>1,1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_bounce_rate\n"
    + "  FROM view_file_agg_by_session_event_name_min_1_sec_min_1_page\n"
    + "  RIGHT JOIN slides ON slides.id = file_hash\n"
    + "  INNER JOIN msg_info ON msg_info.slides_id = slides.id\n"
    + "  WHERE msg_info.sales_man_email=? AND msg_info.sales_man_email != '' AND msg_info.customer_email='default@example.com'\n"
    + "  GROUP BY msg_info.id\n"
    + "  ORDER BY slides.name";
  
  
  public static final String sqlFileBarChart =
        "SELECT\n"
      + "  param1int AS page_number,\n"
      + "  AVG(param2float) AS average_view_duration\n"
      + "FROM customer_events\n"
      + "INNER JOIN msg_info ON msg_info.id = msg_id\n"
      + "INNER JOIN slides ON slides.id = msg_info.slides_id\n"
      + "WHERE event_name = 'VIEW_SLIDE' AND param1int>=1 AND param2float>=1 AND slides.sales_man_email=? AND slides.id=?\n"
      + "GROUP BY event_name, page_number\n"
      + "ORDER BY page_number";
  
  
  /**
   * sum_actual_view is calculated as sum_file_open - (1 * file_bounce_rate)
   */
  public static final String sqlFileLineChart = 
        "SELECT\n"
      + "  date,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS sum_file_open,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) * (1 - (SUM(IF(`event_name` = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE' AND count_event>1,1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0))) AS sum_actual_view\n"
      + "FROM view_file_agg_by_session_event_name_date_min_1_sec_min_1_page\n"
      + "WHERE salesman_email=? AND file_hash=?\n"
      + "GROUP BY file_hash, date";
  
  
  /*
  public static final String sqlFileLinksData =
      "SELECT\n"
      + "  slides.name AS file_name,\n"
      + "  customer_events.msg_id AS file_link,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS sum_open_file,\n"
      + "  file_link_bounce_rate_view.file_link_bounce_rate AS file_link_bounce_rate\n"
      + "  # SUM(IF(event_name = 'VIEW_SLIDE', param2float, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS file_avg_slide_view_duration\n"
      + "FROM customer_events\n"
      + "INNER JOIN msg_info ON customer_events.msg_id = msg_info.id\n"
      + "INNER JOIN slides ON msg_info.slides_id = slides.id\n"
      + "INNER JOIN file_link_bounce_rate_view ON customer_events.msg_id = file_link_bounce_rate_view.msg_id\n"
      + "WHERE slides.sales_man_email=?\n"
      + "GROUP BY customer_events.msg_id";
  */
}
