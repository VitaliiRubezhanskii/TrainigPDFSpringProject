package slidepiper.ui_rendering;

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
//					System.out.println("Alerts html: " + alertsHTML);
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
				 messagesHtml = "<u>The customer sent these messages: </u><BR>";
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
				 actionsHtml = "<u> Actions performed: </u>";
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

									
			String emailmailto = "<a style=\"color:yellow\" href=\"mailto:"
					+ ai.getCustomer_email()
					+ "?Subject=Followup to our last email.\">"
					+ ai.getCustomer_email() + "</a>";
			
			String reco_text = "<u> Recommendation:</u> Send e-mail to ";
			if (!qs.isEmpty()) reco_text = "<u> Recommendation: </u> Call ";
			
			recommendation_text = "<div class=\"recommendation" + i
					+ "\">" + reco_text + ai.getCustomer_name() + " ("
					+ emailmailto + ")" + "</div>";
			alertHTML += "<li data-role=\"list-divider\">"
					+ recommendation_text + " </li>";
			
			description_text = "Viewed presentation: \"	"
					+ ai.getSlides_name() + "\"";
			clicked_text = "Opened at " + ai.getOpen_time() + "<BR>";
			
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
				// done button: removed for now.
				/*
				+ "<a href=\"\" sessId=\""
				+ ai.getSession_id()
				+ "\" "
				+ " class=\"doneButton"
				+ i
				+ "\" ui-btn ui-shadow ui-btn-inline ui-mini ui-icon-check ui-btn-icon-left\" data-inline=\"true\" data-mini=\"true\">"
				+ "<div sessId=\"" + ai.getSession_id() + "\""
				+ " id=\"" + ai.getSession_id() + "\""
				+ ">Done</div></a>"
				*/
				
				+ "</div>"														 
				+ "<div class=\"ui-block-a\">"
				//+ "<div class=\"d3barchart" + i + "\">BARCHART HERE</div>"
			//	+ "</div>"				
				+ "<BR> <div class=\"ui-block-a\">"
				+ "<u>Original e-mail sent: </u> <BR>" 
				+ ai.getMessage_text()
				+ "</div>"
				
   			+ "<BR> <div class=\"ui-block-a\">"
				+ "<u>Customer's Device Information: </u> <BR>" 
				+ ai.getAll_browser_data()
				+ "</div>"
				
				+ "</div></li>";
			// end main responsive div, and listitem element.
			
			return alertHTML;			
		}
		
		
		
		/*
		 * doesn't work in email html
		public static String getRoundedCornersStyle()
		{			
				return 
						" style='"
						+".rcorners { "
				    +" border-radius: 25px;"
				    +" border: 2px solid #8AC007;"
				    +" padding: 20px; ' ";				       
		}
		*/
		
		public static String getLinkableButtonStyle()
		{
			return 
			" style='"
			+"	    background: none repeat scroll 0 0 #075482;"
			+"	    border: medium none;"
			+"	    color: #FFFFFF;"
			+"	    cursor: pointer;"
			+"	    margin-bottom: 26px;"
			+"	    padding: 8px;"
		   +" '  ";		
		}
		
		
		public static String getButtonHtml(String url, String text)
		{
			/* not good, submitting to external page. (shows msg)
			return 
				"<form action=\"" +url+ "\" method=\"get\">"
				+"<button " + getLinkableButtonStyle() + ">"+text+"</button>"
				+"</form>";
			*/
			return 
					// illegal html - button inside a, but may work.
					"<a href='" +url+ "'>" 
					+"<button " + getLinkableButtonStyle() + ">"+text+"</button>"
					+"</a>";
		}
		
		public static String addEnclosingBorders(String a)		
		{
			// does not work in html email
			//				return "<div " + getRoundedCornersStyle() + ">" + a + "</div>";
									
			//according to tips here: http://chipcullen.com/html-email-and-borders/
			return  "<table>"+
				"<td style=\"border-left: solid 1px #e9e9e9; background: #ffffff\" bgcolor=\"ffffff\">" 
			+a+ "&nbsp;</td>  </table>";
			
			// can also put:  width="20"
		}
		
		public static String addEnclosingHtml(String a)
		{
			return 
					
			"<!DOCTYPE html>"
			+"<html>"			    
			+"<head>"				
		  +"<meta http-equiv='Content-Type' content='text/html;charset=ISO 8859-8' >"
			+"</head>"
		  +"<body>"
			+ a
			+"</body>"
			+"</html>";
		}
}
