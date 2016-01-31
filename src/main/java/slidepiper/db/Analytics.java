package slidepiper.db;

public class Analytics {
  
  public static final String sqlFileList =
      "SELECT id, name FROM slides WHERE sales_man_email=? ORDER BY name";
  
  
  /**
   * File bounce rate calculation:
   * 1. A file has one or more links which has one or more sessions.
   * 2. Each session is said to be bounced if it doesn't contain any VIEW_SLIDE event.
   * 3. A file's bounce rate is calculated by dividing the number of bounced sessions by the
   * total number of sessions.
   */
  public static final String sqlFileData =
        "SELECT\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS sum_file_open,\n"
      + "  (SUM(IF(`event_name` = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE',1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_bounce_rate\n"
      + "FROM file_event_aggregate_by_session_event_name_view\n"
      + "WHERE salesman_email=? AND file_hash=?\n"
      + "GROUP BY file_hash\n";
  
  
  /**
   * sum_actual_view is calculated as sum_file_open - (1 * file_bounce_rate)
   */
  public static final String sqlFileLineChart = 
        "SELECT\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS sum_file_open,\n"
      + "  (SUM(IF(`event_name` = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE',1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0)) AS file_bounce_rate,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) * (1 - (SUM(IF(`event_name` = 'OPEN_SLIDES',1,0)) - SUM(IF(event_name = 'VIEW_SLIDE',1,0))) / SUM(IF(event_name = 'OPEN_SLIDES',1,0))) AS sum_actual_view,\n"
      + "  date\n"
      + "  FROM file_event_aggregate_by_session_event_name_date_view\n"
      + "  WHERE salesman_email=? AND file_hash=?\n"
      + "  GROUP BY file_hash, date\n";
  
  
  public static final String sqlFileLinksData =
      "SELECT\n"
      + "  slides.name AS file_name,\n"
      + "  customer_events.msg_id AS file_link,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS sum_open_file,\n"
      + "  file_link_bounce_rate_view.file_link_bounce_rate AS file_link_bounce_rate,\n"
      + "  SUM(IF(event_name = 'VIEW_SLIDE', param2float, 0)) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS file_avg_slide_view_duration\n"
      + "FROM customer_events\n"
      + "INNER JOIN msg_info ON customer_events.msg_id = msg_info.id\n"
      + "INNER JOIN slides ON msg_info.slides_id = slides.id\n"
      + "INNER JOIN file_link_bounce_rate_view ON customer_events.msg_id = file_link_bounce_rate_view.msg_id\n"
      + "WHERE slides.sales_man_email=?\n"
      + "GROUP BY customer_events.msg_id";
}
