package slidepiper.views;

import java.util.ArrayList;


import slidepiper.dataobjects.*;

// this whole thing needs to use StringBuilder to be faster. In the future...

// this class renders HTML from objects when needed.
// first: need to generate report HTML from the AlertData object.
public class HtmlRenderer {
		public static String GenerateAlertsHtml(ArrayList<AlertData> alertsdata)
		{
					String alertsHTML ="";
									
					// loop on alerts
					int i=0;
					for(AlertData ai : alertsdata)
					{
						alertsHTML += GenerateAlertHtml(ai, i);
						i++;						
					}		
					System.out.println("Alerts html: " + alertsHTML);
					return alertsHTML;
		}
		
		/// generate for alertdata. i is index in list.
		public static String GenerateAlertHtml(AlertData ai, int i) 
		{											
			String description_text;
			String clicked_text;			
			String messagesHtml;
			String actionsHtml;			
			String recommendation_text;						
			String alertHTML="";
			
			messagesHtml = "";			
			ArrayList<String> qs = ai.getQuestions();
			if (!qs.isEmpty())
			{
				 messagesHtml = "The customer sent these messages: <BR>";
				 for(String q : qs)
					{
						messagesHtml += q;
						messagesHtml += "<BR>";											
					}				 
			}
			
			actionsHtml = "";			
			ArrayList<String> actions = ai.getActions();
			if (!actions.isEmpty())
			{
				 actionsHtml = "Actions performed: ";
				 for(String action : actions)
					{
								 switch (action)
								 {
								 		case "PRINT": actionsHtml += " print "; 
								 		case "DOWNLOAD": actionsHtml += " download ";
								 		default: actionsHtml += (" " + action + " ");
								 }																	
					}				 
			}

									
			String emailmailto = "<a style=\"color:white\" href=\"mailto:"
					+ ai.getCustomer_email()
					+ "?Subject=Followup to our last email.\">"
					+ ai.getCustomer_email() + "</a>";
			recommendation_text = "<div class=\"recommendation" + i
					+ "\">" + ai.getCustomer_name() + " ("
					+ emailmailto + ")" + "</div>";
			alertHTML += "<li data-role=\"list-divider\">"
					+ recommendation_text + " </li>";
			
			description_text = "Viewed presentation: \""
					+ ai.getSlides_name() + "\"";
			clicked_text = "Opened at " + ai.getOpen_time()
			+ "<BR><BR> Message: <BR>" +
			ai.getMessage_text() + "<BR>";
			
			alertHTML += "<li>";
			//id is session num, to get it later in history screen.
			alertHTML += "<div id=\"" + ai.getSession_id() + "\" class=\"ui-grid-b ui-responsive\">";

			alertHTML += "<div class=\"ui-block-a\">" 					
				+ description_text													
				+ "<BR>" 
				+ clicked_text
				+ "<div>"
				+ messagesHtml
				+ "</div>"
				+ "<div>"
				+ actionsHtml
				+ "</div>"				
				+ "<a href=\"\" sessId=\""
				+ ai.getSession_id()
				+ "\" "
				+ " class=\"doneButton"
				+ i
				+ "\" ui-btn ui-shadow ui-btn-inline ui-mini ui-icon-check ui-btn-icon-left\" data-inline=\"true\" data-mini=\"true\">"
				+ "<div sessId=\"" + ai.getSession_id() + "\""
				+ " id=\"" + ai.getSession_id() + "\""
				+ ">Done</div></a> </div>"														 
				+ "<div class=\"ui-block-b\">"
				+ "<div class=\"d3barchart" + i + "\"></div>"
				+ "</div></div></li>";
			// end main responsive div, and listitem element.
			
			return alertHTML;			
		}
		
		
		
		
		
		
		
		
	

}
