package slidepiper.ui_rendering;

import java.util.ArrayList;

import slidepiper.dataobjects.*;
import slidepiper.db.DbLayer;

// this whole thing needs to use StringBuilder to be faster. In the future...

// this class renders HTML from objects when needed.
// first: need to generate report HTML from the AlertData object.
public class HtmlRenderer {
	
	
	
		public static String getActionsRow(AlertData ai)
		{
		  // actions
			String actionsHtml="";						
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
			return getFreeTextRow(actionsHtml);
		}
	
		/// generate 
		public static String getReportHtml(AlertData ai, String chatMessages) 
		{											
			String reportHTML="";			
												
			String emailmailto = "<a style=\"color:white\" href=\"mailto:"
					+ ai.getCustomer_email()
					+ "?Subject=Followup to our last email.\">"
					+ ai.getCustomer_email() + "</a>";											
			String custname = ai.getCustomer_name() + emailmailto;
					
			String reportTitleRow = getTitleRow("SlidePiper Report");		
			String alertRow = getAlertRow("viewed", ai.getSlides_name(), custname, ai.getOpen_time());
			 
			String deviceInfoRows =
					getFreeTextRow("<u>Device Information</u>")+
					getFreeTextRow(ai.getAll_browser_data());			
						
			String chatMessagesRow = getFreeTextRow("<u>Messages in Chat Window:</u>")
					+getFreeTextRow(chatMessages);

			String barchartImageUrl = BarChartRenderer.getBarChartLink(ai.getSession_id());
			String barchartrow = getImageRow(barchartImageUrl);
									
			String originalMessageRow = getFreeTextRow("<u>Original Message</u>")
					+getFreeTextRow(ai.getMessage_text());			
			
			reportHTML = reportTitleRow + 
					alertRow + 
					barchartrow +
					chatMessagesRow +
					deviceInfoRows +					
					originalMessageRow; 
			
			reportHTML = addEnclosingHtml(reportHTML);
			return reportHTML;			
	}
		
		

		
		public static String getAlertHtml(MessageInfo mi, CustomerSession cs, String currentviewslink, String chatlink, String fullchatlink) 
		{											
			String alertHTML="";			
												
			String emailmailto = "<a style=\"color:white\" href=\"mailto:"
					+ mi.getCustomerEmail()
					+ "?Subject=Followup to our last email.\">"
					+ mi.getCustomerEmail() + "</a>";											
			String custname = DbLayer.getCustomerName(mi.getCustomerEmail(),mi.getSalesManEmail()) + emailmailto;
					
			String alertTitleRow = getTitleRow("SlidePiper Open Alert");		
			String alertRow = getAlertRow("opened", DbLayer.getSlidesName(mi.getSlidesId()), custname, "");
			 					
			String originalMessageRow = getFreeTextRow("<u>Original Message</u>")
					+getFreeTextRow(mi.getMsgText());
			
			String whatNextTitleRow = getTitleRow("What Next?");

			String whatNextRows = whatNextTitleRow; // start from this
			
			whatNextRows = whatNextRows + HtmlRenderer.getButtonRow(currentviewslink, "View Current Slides Report ") + "<BR>";
			
			System.out.println("Detecting mobile/PC device: browser data is " + cs.getAll_browser_data());			
			if (cs.getAll_browser_data().contains("Is mobile device: true"))
			{			
					System.out.println("Detected mobile device");
					whatNextRows = 
							whatNextRows + 
							getFreeTextRow("<BR>Customer is using a mobile device, chat is not available for mobile devices.<BR>");
			}
			else
			{
				System.out.println("Detected PC, not mobile.");
				whatNextRows = whatNextRows	+
						HtmlRenderer.getButtonRow(chatlink, "<b>Quick Chat</b> with " + custname) + "<BR>"
						+HtmlRenderer.getButtonRow(fullchatlink, "<b>Full Chat</b> + <b>Live Pitch</b> with " + custname) +"<BR>";
			}
			
			alertHTML = alertTitleRow + 
					alertRow + 										
					originalMessageRow+
					whatNextRows;					
			
			alertHTML = addEnclosingHtml(alertHTML);
			return alertHTML;			
	}
		
		
		public static String addEnclosingHtml(String text)
		{
			String htmlStart = 
		    "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">"
		    +"<html>"
		    +"<head>"
		    +"<title>SlidePiper email</title>"
		    +"</head>"
		    +"<body leftmargin=\"0\" marginwidth=\"0\" topmargin=\"0\" marginheight=\"0\" offset=\"0\">"
		    +"<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" valign=\"top\" align=\"center\">"		        
		    +"<tr><td width=\"100%\" valign=\"top\">"  
		    +"<img src='www.slidepiper.com/img/logoOriginal.png' height=\"68\" width=\"400\" border=\"0\" hspace=\"5\" vspace=\"5\" align=\"left\" style='background-color: black;'></img>"       
		    +"</td></tr>"
		    + "<tr><td>"
		    + "<p style=\"font-size:12px; line-height: 14px; font-family:Arial, Helvetica, sans-serif; margin: 0; padding : 0 ; color:#356560;\">"    
		    + "Hello,<BR>"
		    +"This is Jacob Salesmaster.<BR>"
				+"I am your SlidePiper e-mail representative. Please carefully review the following e-mail.<BR><BR></BR></p>"   
		    +"</td></tr>";
			
			// table is still open here at the end!
			
			String htmlEnd = 
						"</table>"
				    +"<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" valign=\"top\" align=\"center\">"
				    +"<tr><td>"
				    +"<p style=\"font-size:12px; line-height: 14px; font-family:Arial, Helvetica, sans-serif; margin: 0; padding : 0 ; color:#356560;\"><BR>"
				    +"<BR>Glad to serve you, <BR>Jacob Salesmaster<BR>SlidePiper Email Team</p>"   
				    +"</td></tr>"
						+"</table>   " 								   
				    +"</body>"
				    +"</html>";
			
				return htmlStart + text + htmlEnd;
		}
		
		public static String getTitleRow(String title)	
		{
			return 
		    "<tr>  <td width=\"50%\" style=\"background-color: #075482; height: 28px;\">"
				+"<span style=\"font-weight: bold; color: #FFFFFF; font-size:15px; line-height: 28px; font-family: Arial, Helvetica, sans-serif;\">"  
				+title
				+"</span>"			
		    +"</td></tr>";		  		    
		}		

		
		public static String getAlertRow(String opened_or_viewed, String presname, String custname, String openedat)
		{
			 
					String alertrow = "<tr><td> <BR>Your presentation has been " + opened_or_viewed + 
					"<BR><u>Presentation Name</u>:"+presname
					+"<BR><u>Customer Name</u>: "+custname;
			
					if (!openedat.equalsIgnoreCase(""))
					{
							alertrow = alertrow + "<BR><u>Opened at</u>: " + openedat;
					}

					
					alertrow = alertrow	+"<BR> </td></tr>";
					
					return alertrow;
		}
		
		public static String getMoreInfoRow(String device, String chatmsg, String orig_email)
		{
				return "<tr><td><span style=\"font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000;\">"         		
				+"<u>Device Information:</u> <BR>"
				+device 
				+"<BR><BR><u>Messages in Chat Window:</u> <BR>"
				+chatmsg
				+"<BR><BR><u>Original e-mail:</u> <BR>"
				+orig_email
				+"<BR><BR></span></td></tr>";
		}
		
		public static String getFreeTextRow(String text)
		{
				return "<tr><td><span style=\"font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000;\">"   
						+text+"</span></td></tr>";
		}

		
		public static String getImageRow(String url)
		{
			return " <tr><td width=\"100%\" valign=\"top\">"  
		    +"<img src='"+url+"' height=\"100\" width=\"550\" border=\"0\" hspace=\"5\" vspace=\"5\" align=\"left\"></img>"       
		    +"</td></tr>";
		}
		
		public static String getButtonRow(String text, String url)
		{
			return 
			  "<tr><td><table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" valign=\"top\" align=\"center\">"    
			  +"<tr>   <td>    <table border=\"0\" cellspacing=\"0\" cellpadding=\"0\">   <tr>"
        +"<td align=\"center\" style=\"-webkit-border-radius: 7px; -moz-border-radius: 7px; border-radius: 7px;\" bgcolor=\"#e9703e\"><a href='"+url+"' target=\"_blank\" style=\"font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; padding: 12px 18px; border: 1px solid #e9703e; display: inline-block;\">"
        +text+" &rarr;</a></td>  </tr>  </table>  </td> </tr> </table> </td></tr>";
		}
		
}
