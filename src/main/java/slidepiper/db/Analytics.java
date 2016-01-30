package slidepiper.db;

public class Analytics {
  
  public static final String sqlFileData =
      "SELECT\n"
      + "  slides.name AS file_name,\n"
      + "  customer_events.msg_id AS file_link,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS sum_open_file,\n"
      + "  file_link_bounce_rate_view.file_link_bounce_rate AS file_link_bounce_rate,\n"
      + "  SUM(param2float) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS file_avg_slide_view_duration\n"
      + "FROM customer_events\n"
      + "INNER JOIN msg_info ON customer_events.msg_id = msg_info.id\n"
      + "INNER JOIN slides ON msg_info.slides_id = slides.id\n"
      + "INNER JOIN file_link_bounce_rate_view ON customer_events.msg_id = file_link_bounce_rate_view.msg_id\n"
      + "WHERE slides.sales_man_email=?\n"
      + "GROUP BY customer_events.msg_id";
}
