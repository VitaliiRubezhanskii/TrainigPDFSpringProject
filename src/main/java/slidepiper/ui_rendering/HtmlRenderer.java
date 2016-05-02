package slidepiper.ui_rendering;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;

import slidepiper.config.ConfigProperties;
import slidepiper.dataobjects.*;
import slidepiper.db.DbLayer;
import slidepiper.salesman_servlets.Geolocation;

import java.util.Map;
import java.io.StringWriter;
import java.io.Writer;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.io.OutputStreamWriter;
import java.util.List;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

// this whole thing needs to use StringBuilder to be faster. In the future...

// this class renders HTML from objects when needed.
// first: need to generate report HTML from the AlertData object.
public class HtmlRenderer {
	
	
	
		public static String getActionsRow(AlertData ai)
		{
		  // actions
			String actionsHtml="";						
			ArrayList<String> actions = ai.getActions();
			Boolean printAdded = false;
			Boolean downloadAdded = false;
			if (!actions.isEmpty())
			{
				 actionsHtml = "<u> Actions performed: </u>";
				 for(String action : actions)
					{
								 switch (action)
								 {
								 		case "PRINT":
								 			if (printAdded == false)
								 			{
								 					actionsHtml += " print ";
								 					printAdded= true;
								 			}
								 			break;
								 		case "DOWNLOAD": 
								 			if (downloadAdded == false)
								 			{
										 			actionsHtml += " download ";
										 			downloadAdded = true;
								 			}
								 			break;
								 		default: actionsHtml += (" " + action + " ");
								 }																	
					}				 
			}
			return getFreeTextRow(actionsHtml);
		}
	
		/// generate 
		public static String getReportHtml(AlertData ai, String chatMessages) 
		{	
			
			Configuration cfg = new Configuration();
			try {
				cfg.setDirectoryForTemplateLoading(new File("/users/maxprais/documents/workspace/templates"));
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			String reportHTML = "";
			//String html = "";
	        try {
	            //Load template from source folder
	        	Template template = cfg.getTemplate("ReportTemplate.ftl");

	             
	            // Build the data-model
	            Map<String, Object> data = new HashMap<String, Object>();

	            List<String> mailReportData = new ArrayList<String>();
	            String deviceInfoRows =
						getFreeTextRow("<u>Device Information</u>")+
						getFreeTextRow(ai.getAll_browser_data());			
				
	            String input = ai.getAll_browser_data();
	            System.out.print("**********Device data: " + input);
	            
	            Pattern pattern;
	            Matcher matcher;
	            String regex = "false";
	            
	            pattern = Pattern.compile(regex);
	            matcher = pattern.matcher(input);
	            
	            System.out.println("Current REGEX is: "+regex);
	            System.out.println("Current INPUT is: "+input);
	            String mobileDeviceStr;
	            Boolean isFound = matcher.find();
	            System.out.print("Looking at:" + isFound);
	            
	            if (isFound) {
	            	System.out.print("**********Answer: No");
	            	mobileDeviceStr = "No";
	            }
	            else {
	            	System.out.print("**********Answer: Yes");
	            	mobileDeviceStr = "Yes";
	            }
	            
				String chatMessagesRow = getFreeTextRow("<u>Messages in Chat Window:</u>")
						+getFreeTextRow(chatMessages);
				String appUrl = ConfigProperties.getProperty("app_url");
				
				//String barchartImageUrl = BarChartRenderer.getBarChartLink(ai.getSession_id());
				//String barchartrow = getImageRow(barchartImageUrl);
//				List<String> questions = ai.getQuestions();
//				List<String> mailReportQuestions = new ArrayList<String>();
//				
//				mailReportQuestions.add(questions.get(0));
//				mailReportQuestions.add(questions.get(1));
//				mailReportQuestions.add(questions.get(2));
				
	            
	            //mailReportData.add(DbLayer.getSlidesName(ai.getSlides_id()));
	            mailReportData.add(ai.getCustomer_name());
	            mailReportData.add(ai.getCustomer_email());
	            mailReportData.add(ai.getOpen_time());
	            mailReportData.add(ai.getSlides_id());
	            //mailReportData.add(barchartImageUrl);
	            //mailReportData.add(barchartrow);
	            mailReportData.add(mobileDeviceStr);
	            //mailReportData.add(chatMessagesRow);
	            
	            data.put("customerName", ai.getCustomer_name());
	            data.put("customerEmail", ai.getCustomer_email());
	            data.put("openTime", ai.getOpen_time());
	            data.put("device", mobileDeviceStr);
	            data.put("messages", chatMessages);
	            data.put("mailReportData", mailReportData);
	            data.put("documentName", DbLayer.getSlidesName(ai.getSlides_id()));
	            data.put("logoUrl", appUrl);
	            //data.put("mailReportQuestions", mailReportQuestions);
	            
     
	            // Console output
	            Writer out = new OutputStreamWriter(System.out);
	            template.process(data, out);
	            out.flush();
	 
	            // File output
	            //String path = System.getProperty("user.home");
	            Writer file = new FileWriter (new File("FTL_helloreport.txt"));
	            template.process(data, file);
	            file.flush();
	            file.close();
	            
	            StringWriter stringwriter = new StringWriter();
	            template.process(data, stringwriter);
	            
	            
	            
	           reportHTML = stringwriter.toString();
	            System.out.println("***************ReportHTML: " + reportHTML);
	            
	             
	        } catch (IOException e) {
	            e.printStackTrace();
	        } catch (TemplateException e) {
	            e.printStackTrace();
	        }
			
			
			
//			String reportHTML="";
//			
//			//System.out.println("MAKING REPORT HTML: custemail " + ai.getCustomer_email() + " ok");
//												
//			String emailmailto = "<a style=\"color:grey\" href=\"mailto:"
//					+ ai.getCustomer_email()
//					+ "?Subject=Followup to our last email.\">"
//					+ ai.getCustomer_email() + "</a>";											
//			String custname = ai.getCustomer_name() + " (" + emailmailto + ")";
//					
//			String reportTitleRow = getTitleRow("SlidePiper Report");		
//			String alertRow = getAlertRow("viewed", ai.getSlides_name(), custname, ai.getOpen_time());
//			 
//			String deviceInfoRows =
//					getFreeTextRow("<u>Device Information</u>")+
//					getFreeTextRow(ai.getAll_browser_data());			
//						
//			String chatMessagesRow = getFreeTextRow("<u>Messages in Chat Window:</u>")
//					+getFreeTextRow(chatMessages);
//
//			String barchartImageUrl = BarChartRenderer.getBarChartLink(ai.getSession_id());
//			String barchartrow = getImageRow(barchartImageUrl);
			
//			String recotext = "<u>Recommendation</u>: ";
//			
//			if (chatMessages.contains("No messages"))
//			{
//						recotext = recotext+ "Send e-mail to " + custname;
//			}
//			else
//			{
//				recotext = recotext+ "Call " + custname;
//			}
//			
//			String recommendationRow = getBoldBigRow(recotext);
//			
//			String actionsRow = getActionsRow(ai);
//			
//			reportHTML = reportTitleRow + "<BR>" +
//					recommendationRow +
//					alertRow +					 
//					actionsRow + 
//					barchartrow +
//					chatMessagesRow + "<BR>"+
//					deviceInfoRows; 
						
			return reportHTML;			
	}

		public static String getAlertHtml(MessageInfo mi, CustomerSession cs, String currentviewslink, String chatlink, String fullchatlink) 
		{	
			
			Configuration cfg = new Configuration();
			try {
				cfg.setDirectoryForTemplateLoading(new File("/src/main/resources/templates"));
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			String alertHTML = "";
			String html = "";
	        try {
	            //Load template from source folder
	        	Template template = cfg.getTemplate("AlertTemplate.ftl");
//	            Template template = cfg.getTemplate(HtmlRenderer.class.getClassLoader().getResource("AlertTest.ftl").getFile());
	             
	            // Build the data-model
	            Map<String, Object> data = new HashMap<String, Object>();
	            //data.put("message", "Hello World!");
	 
	            //List parsing 
//	            List<String> countries = new ArrayList<String>();
//	            countries.add("India");
//	            countries.add("United States");
//	            countries.add("Germany");
//	            countries.add("France");
	          //data.put("countries", countries);
	            
	            //AlertData ai;
	            //Map<String, String> mailData = new HashMap<String, String>();
	            //String alertRow = getAlertRow("opened", DbLayer.getSlidesName(mi.getSlidesId()), custname, "");
	            //String custname = DbLayer.getCustomerName(mi.getCustomerEmail(),mi.getSalesManEmail()) + " (" + emailmailto + ")"; 
	            List<String> mailAlertData = new ArrayList<String>();
	            
	            //ArrayList alerts = DbLayer.getAlerts(mi.getSalesManEmail());
	            
	            //mailData.add("opened");
	            String appUrl = ConfigProperties.getProperty("app_url");
	            mailAlertData.add(DbLayer.getSlidesName(mi.getSlidesId()));
	            mailAlertData.add(DbLayer.getCustomerName(mi.getCustomerEmail(), mi.getSalesManEmail()));
	            mailAlertData.add(mi.getCustomerEmail());
	            
	            data.put("documentName", DbLayer.getSlidesName(mi.getSlidesId()));
	            data.put("customerName", DbLayer.getCustomerName(mi.getCustomerEmail(), mi.getSalesManEmail()));
	            data.put("customerEmail", mi.getCustomerEmail());
	            data.put("chatLink", fullchatlink);
	            data.put("mailAlertData", mailAlertData);
	            data.put("logoUrl", appUrl);
     
	            // Console output
	            Writer out = new OutputStreamWriter(System.out);
	            template.process(data, out);
	            out.flush();
	 
	            // File output
	            //String path = System.getProperty("user.home");
	            Writer file = new FileWriter (new File("FTL_helloworld.txt"));
	            template.process(data, file);
	            file.flush();
	            file.close();
	            
	            StringWriter stringwriter = new StringWriter();
	            template.process(data, stringwriter);
	            
	            
	            
	            html = stringwriter.toString();
	            System.out.println("***************HTML: " + html);
//	            alertHTML = template.toString();
	            
	             
	        } catch (IOException e) {
	            e.printStackTrace();
	        } catch (TemplateException e) {
	            e.printStackTrace();
	        }
			
//			String alertHTML="";			
//												
//			String emailmailto = "<a style=\"color:grey\" href=\"mailto:"
//					+ mi.getCustomerEmail()
//					+ "?Subject=Followup to our last email.\">"
//					+ mi.getCustomerEmail() + "</a>";					
//			String custname = DbLayer.getCustomerName(mi.getCustomerEmail(),mi.getSalesManEmail()) + " (" + emailmailto + ")";
//					
//			String alertTitleRow = getTitleRow("SlidePiper Open Alert");		
//			String alertRow = getAlertRow("opened", DbLayer.getSlidesName(mi.getSlidesId()), custname, "");
//			
//			String whatNextTitleRow = getTitleRow("What Next?");
//
//			String whatNextRows = whatNextTitleRow+"<BR>"; // start from this
//			
//			whatNextRows = whatNextRows + HtmlRenderer.getButtonRow(currentviewslink, "View Current Slides Report ");
//			
//					whatNextRows = whatNextRows	
//			Don't need chatlink			 +HtmlRenderer.getButtonRow(chatlink, "<b>Quick Chat</b>")  
//						+HtmlRenderer.getButtonRow(fullchatlink, "<b>Full Chat</b> + <b>Live Pitch</b>") +
//						  "<BR>";
//			
//			alertHTML = alertTitleRow + 
//					alertRow +
//					"<BR>"+
//					whatNextRows;					
//			
			//alertHTML = addEnclosingHtml(html);
			System.out.println("ALERT HTML SENT **********************\n" 
			//+ alertHTML
					);
	        
	        
			return html;			
	}
		
		
		public static String addEnclosingHtml(String text)
		{
			String htmlStart = 
		    "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">"
		    +"<html>"
		    +"<head>"
		    +"<title>SlidePiper email - look carefully</title>"
		    +"</head>"
		    +"<body leftmargin=\"0\" marginwidth=\"0\" topmargin=\"0\" marginheight=\"0\" offset=\"0\">"
		    +"<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" valign=\"top\" align=\"center\">"		        
		    +"<tr><td width=\"100%\" valign=\"top\">"  
		    +"<img src=\"www.slidepiper.com/img/logoOriginal.png\" height=\"68\" width=\"400\" border=\"0\" hspace=\"5\" vspace=\"5\" align=\"left\" style='background-color: black;'></img>"       
		    +"</td></tr>"
		    + "<tr><td>"
		    + "<p style=\"font-size:12px; line-height: 14px; font-family:Arial, Helvetica, sans-serif; margin: 0; padding : 0 ; color:#356560;\">"    
		    + "Hello,<BR>"
		    +"This is David Salesmaster.<BR>"
				+"I am your SlidePiper e-mail representative. Please carefully review the following information.<BR><BR></BR></p>"   
		    +"</td></tr>";
			
			// table is still open here at the end!
			
			String htmlEnd = 
						"</table>"
				    +"<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" valign=\"top\" align=\"center\">"
				    +"<tr><td>"
				    +"<p style=\"font-size:12px; line-height: 14px; font-family:Arial, Helvetica, sans-serif; margin: 0; padding : 0 ; color:#356560;\"><BR>"
				    +"<BR>Happy to serve you, <BR>David Salesmaster<BR>SlidePiper Email Team</p>"   
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
					"<BR><u>Presentation Name</u>: "+presname
					+"<BR><u>Customer Name</u>: "+custname;
			
					if (!openedat.equalsIgnoreCase(""))
					{
							alertrow = alertrow + "<BR><u>Opened at</u>: " + openedat;
					}

					
					alertrow = alertrow	+"<BR> </td></tr>";
					
					return alertrow;
		}
		
/*		public static String getMoreInfoRow(String device, String chatmsg, String orig_email)
		{
				return "<tr><td><span style=\"font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000;\">"         		
				+"<u>Device Information:</u> <BR>"
				+device 
				+"<BR><BR><u>Messages in Chat Window:</u><BR>"
				+chatmsg
				+"<BR><BR><u>Original e-mail:</u> <BR>"
				+orig_email
				+"<BR><BR></span></td></tr>";
		}*/
		
		public static String getFreeTextRow(String text)
		{
				return "<tr><td style=\"style=\"background-color: #ffffaa;\"><span style=\"font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000;\">"   
						+text+"</span></td></tr>";
		}
		
		public static String getBoldBigRow(String text)
		{
				return "<tr><td><span style=\"font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#000;\">"   
						+"<b>"+text+"</b></span></td></tr>";
		}

		
		public static String getImageRow(String url)
		{
			return " <tr><td width=\"100%\" valign=\"top\">"  
		    +"<img src=\""+url+"\" height=\"500\" width=\"550\" border=\"0\" hspace=\"5\" vspace=\"5\" align=\"left\"></img>"       
		    +"</td></tr>";
		}
		
		
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
		
		
		public static String getButtonRow(String url, String text)
		{
			/* not good, submitting to external page. (shows msg)
			return 
				"<form action=\"" +url+ "\" method=\"get\">"
				+"<button " + getLinkableButtonStyle() + ">"+text+"</button>"
				+"</form>";
			*/
			return 
					// illegal html - button inside a, but may work.
					"<tr><td><a href='" +url+ "'>" 
					+"<button " + getLinkableButtonStyle() + ">"+text+"</button>"
					+"</a></td></tr>";
		}
		
		
		// like accordion html
		public static String getCollapsibleItem(String heading, String content)
		{
				return						
				"<details>"
				+"<summary>"+heading+"</summary>"
				+"<p>"+content+"</p></details>";			   	        
		}
		
		/// generate history report for salesman
		public static String getHistoryHtml(String smemail) 
		{											
			String reportHTML="";
																									
			ArrayList<HistoryItem> his = DbLayer.getHistory(smemail);												
			for(HistoryItem hi : his)
			{
						String msgtitle = 
								"<b><u>" + hi.getSlidesName() + "</u> sent to <u>" + hi.getCustomerName() + "</u> ("
								+ hi.getCustomerEmail() + ") at " + hi.getTimestamp() +"</b>";
						
						//System.out.println("Title for history item: " + msgtitle);																		
						
						ArrayList<String> reports = DbLayer.getSessionReportsByMsgId(hi.getMsgId());
						String itemHTML="";
						for(String report : reports)
						{
									itemHTML += report;						
						}
						
						reportHTML += getCollapsibleItem(msgtitle, itemHTML);
			}
			
			// add enclosing table element.
			//reportHTML = reportHTML;
			
			//System.out.println("**************** History HTML is: " + reportHTML);
						
			//reportHTML = addEnclosingHtml(reportHTML);
			return reportHTML;			
	}
		


		
		//public static String getButtonRow(String text, String url)
		//{
//			return					
	//		"<tr>		    <td>		      <table border=\"0\" cellspacing=\"0\" cellpadding=\"0\">"
		//   +"     <tr>    <td align=\"center\" style=\"-webkit-border-radius: 7px; -moz-border-radius: 7px; border-radius: 7px;\" bgcolor=\"#e9703e\"><a href=\""+url+"\" target=\"_blank\" style=\"font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; padding: 12px 18px; border: 1px solid #e9703e; display: inline-block;\">"
		  // + text+" &rarr;</a></td>"
		    //+ "   </tr>    </table>   </td>  </tr>";
			
			
			/*return 
					"</table>"+ //close table element.
			"<div><!--[if mso]>"+
			  "<v:roundrect xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" href=\""+text+"\" style=\"height:40px;v-text-anchor:middle;width:200px;\" arcsize=\"0%\" stroke=\"f\" fill=\"t\">"+
			    "<v:fill type=\"tile\" src=\"\"http://imgur.com/5BIp9d0.gif\"\" color=\"#49a9ce\" />"+
			    "<w:anchorlock/>"+
			    "<center style=\"color:#ffffff;font-family:sans-serif;font-size:13px;font-weight:bold;\">"+text+"</center>"+
			  "</v:roundrect>"+
			"<![endif]--><a href=\""+url+"\" "+
			"style=\"background-color:#49a9ce;background-image:url(\"http://imgur.com/5BIp9d0.gif\");border-radius:px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:13px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;mso-hide:all;\">"+text+"</a></div>"
			
			//reopen table element.
			+"<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" valign=\"top\" align=\"center\">";*/
			
			//return "<table cellspacing=\"0\" cellpadding=\"0\"> <tr>"+ 
			//"<td align=\"center\" width=\"300\" height=\"40\" bgcolor=\"#000091\" style=\"-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #ffffff; display: block;\">"+
			//"<a href=\"" +url+  "\" style=\"font-size:16px; font-weight: bold; font-family: Helvetica, Arial, sans-serif; text-decoration: none; line-height:40px; width:100%; display:inline-block\"><span style=\"color: #FFFFFF\">"+text+"</span></a>"+
			//"</td>	</tr> </table>";
			
			
//			return "<table width='600' cellpadding='0' cellspacing='0' border='0' valign='top' align='center'><td align='center' width='300' height='40' bgcolor='#000091' style='-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #ffffff; display: block;'><a href='"+url+"' style='font-size:16px; font-weight: bold; font-family: Helvetica, Arial, sans-serif; text-decoration: none; line-height:40px; width:100%; display:inline-block'><span style='color: #FFFFFF'>"+text+"</span></a></td></tr> </table>";
			
			//return "<table width='600' cellpadding='0' cellspacing='0' border='0' valign='top' align='center'><td align='center' width='300' height='40' bgcolor='#000091' style='-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #ffffff; display: block;'><a href='"+"http://www.google.com"+"' style='font-size:16px; font-weight: bold; font-family: Helvetica, Arial, sans-serif; text-decoration: none; line-height:40px; width:100%; display:inline-block'><span style='color: #FFFFFF'>"+text+"</span></a></td></tr> </table>";
			
		//	return
		//	"<table cellpadding='0' cellmargin='0' border='0' height='44' width='178' style='border-collapse: collapse; border:5px solid #c62228'>"+
		//	 " <tr>   <td bgcolor='#c62228' valign='middle' align='center' width='174'>"+
		//	  "    <div style='font-size: 18px; color: #ffffff; line-height: 1; margin: 0; padding: 0; mso-table-lspace:0; mso-table-rspace:0;'>"+
		//	   "     <a href='"+url+"' style='text-decoration: none; color: #ffffff; border: 0; font-family: Arial, arial, sans-serif; mso-table-lspace:0; mso-table-rspace:0;' border='0'>"+text+"</a>"+
	////		    "  </div>			    </td>			  </tr>			</table>";
		///	
		//	
	//	}
		
}
