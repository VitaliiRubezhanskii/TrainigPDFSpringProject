package slidepiper.db;

public class Analytics {
  
  public static final String sqlFileData =
        "SELECT\n"
      + "  slides.name AS file_name,\n"
      + "  msg_id AS file_link,\n"
      + "  SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) AS sum_open_file,\n"
      + "\n"
      + "  /* Calculate the file bounce rate:\n"
      + "  1. A file has one or more sessions.\n"
      + "  2. Each session can be bounced if there isn't any VIEW_SLIDE event, or unbounced otherwise.\n"
      + "  3. A file's bounce rate is calculated by dividing the number of bounced sessions by the\n"
      + "     total number of sessinos.\n"
      + "  */\n"
      + "  (SELECT\n"
      + "    ((SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)) - SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)))\n"
      + "        / SUM(IF(event_name = 'OPEN_SLIDES', 1, 0)))\n"
      + "    FROM (SELECT event_name FROM customer_events GROUP BY msg_id, session_id, event_name)\n"
      + "        AS customer_events)\n"
      + "    AS file_bounce_rate,\n"
      + "\n"
      + "# Calculate the file average slide view duration.\n"
      + "SUM(param2float) / SUM(IF(event_name = 'VIEW_SLIDE', 1, 0)) AS file_avg_slide_view_duration\n"
      + "\n"
      + "FROM customer_events\n"
      + "INNER JOIN msg_info ON customer_events.msg_id = msg_info.id\n"
      + "INNER JOIN slides ON msg_info.slides_id = slides.id\n"
      + "WHERE slides.sales_man_email=?\n"
      + "GROUP BY msg_id";
}
