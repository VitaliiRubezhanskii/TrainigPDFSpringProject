package slidepiper.email;

import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import slidepiper.dataobjects.AlertData;
import slidepiper.dataobjects.MessageInfo;
import slidepiper.db.DbLayer;
import slidepiper.keepalive.KeepAlivePacket;
import slidepiper.ui_rendering.BarChartRenderer;
import slidepiper.ui_rendering.HtmlRenderer;

public class EmailSender {

	// general send email function, used by the other ones.
	public static void sendEmail(String to, String subj, String msg)
	{
		  final String username = "jacob.salesmaster@gmail.com"; 	
		  final String password = "jacobsales";//"yourpassword";
		  //System.out.println("user pw for email is: " + salesmanEmailpassword);
		  Properties props = new Properties();
		  props.put("mail.smtp.host", "smtp.gmail.com");
		  props.put("mail.smtp.socketFactory.port", "465");
		  props.put("mail.smtp.socketFactory.class",
				  	"javax.net.ssl.SSLSocketFactory");
		  props.put("mail.smtp.auth", "true");
		  props.put("mail.smtp.port", "465");	    
		  
	    //System.out.println("email login with user " + username + " pw " + password);
		  Session session = Session.getDefaultInstance(props,
		  new javax.mail.Authenticator() {
		             protected PasswordAuthentication getPasswordAuthentication() {
		             return new PasswordAuthentication(username,password);
		                     }
		     });
		   try {
		       Message emessage = new MimeMessage(session);
		       emessage.setFrom(new InternetAddress(username));
		       			     
		       emessage.setRecipients(Message.RecipientType.TO,
		       InternetAddress.parse(to));	       
		       emessage.setSubject(subj);
		       
		       emessage.setText(msg);
		       emessage.setContent(msg, "text/html; charset=utf-8");
		       Transport.send(emessage);
		       			       
		       	 
		       //System.out.println("Sent ALERT email. msg=" + msg);
		   } catch (MessagingException e) {		   			
			   		System.out.println("ERROR sending message " + e.getMessage() + " stack: " + e.getStackTrace());
		        throw new RuntimeException(e);
		      }

	}
	
	// send alert email
	public static void sendAlertEmail(String id, String sessionId)
	{
		  MessageInfo mi = DbLayer.getMessageInfo(id);
		  System.out.println("alert email to : " + mi.getSalesManEmail());
		  
		  String logoHtml = "<img src='www.slidepiper.com/img/logoOriginal.png' style='background-color: black;'></img>";
		  
		  String appname = System.getenv("OPENSHIFT_APP_NAME");									
			String currentviewslink;
			String chatlink;
			String urlprefix;			
			
			if (appname==null) //running locally
			{
				urlprefix = "localhost:8080/sp/";				 
			}
			else
			{
				 if (appname.equalsIgnoreCase("slidepipertest"))
				 {
					 urlprefix = "http://slidepipertest-slidepiper.rhcloud.com/"; 					 
				 }
				 else
					 if (appname.equalsIgnoreCase("sp")) 
					 {
						 urlprefix = "http://www.slidepiper.com/";						 
					 }
					 else
					 {
						 urlprefix="???? unknown ???";						 
					 }							 
			}
			
			currentviewslink = urlprefix + "viewbarchart.jsp?session_id=" + sessionId;

			String custname = DbLayer.getCustomerName(mi.getCustomerEmail(), mi.getSalesManEmail());
			String getParams = "sessionid="+sessionId+"&salesman="+DbLayer.getSalesmanName(mi.getSalesManEmail())+"&custname="+ custname +"&role=1";
			chatlink = urlprefix + "pdfjs/chatwindow.html?" + getParams;			
			String fullchatlink= urlprefix+"pdfjs/viewer.html?file=/file/" + mi.getId() + "&" + getParams;
			
			String subj = "SlidePiper Alert for " +
					DbLayer.getCustomerName(mi.getCustomerEmail(),mi.getSalesManEmail()) +
					" (" + mi.getCustomerEmail() + ")";
					  			  

			EmailSender.sendEmail(mi.getSalesManEmail(), 
					subj,				
					HtmlRenderer.addEnclosingHtml(
								logoHtml 
								+"Hello, <BR><BR>This is Jacob Salesmaster. <BR>I am your customer alerts representative.<BR><BR>"  
								+HtmlRenderer.addEnclosingBorders(mi.getCustomerEmail() + " has just clicked on the link you sent him!")
								+" <BR><BR>"
								+HtmlRenderer.addEnclosingBorders(
								"<u>What next?</u><BR><BR>"
								+HtmlRenderer.getButtonHtml(chatlink, "<u>Quick Chat</u> with " + custname) + "<BR>"
								+HtmlRenderer.getButtonHtml(fullchatlink, "<u>Full Chat</u> + <u>Live Pitch</u> with " + custname) +"<BR>"
								+ HtmlRenderer.getButtonHtml(currentviewslink, "View Current Report"))
								+"<BR><BR> Glad to serve you, <BR>Jacob Salesmaster<BR>SlidePiper Alerts System"
					)
			);

	}
	// report email after customer stops viewing presentation
	// called from KeepAliveTask
	public static void sendReportEmail(KeepAlivePacket p)
	{					
			MessageInfo mi = DbLayer.getMessageInfo(p.getMsgId());													
			AlertData ai = DbLayer.getAlert(p.getSessionId(),mi.getSalesManEmail());
			
			// first of all: let's get the url to the barchart image.
			// session id I have in alertdata.
			String barchartImageUrl = BarChartRenderer.getBarChartLink(ai.getSession_id());
			
			// i=0 not important. no buttons or divs filled with code here. it's email.
			String logoHtml = "<img src='www.slidepiper.com/img/logoOriginal.png' style='background-color: black;'></img>";

			String barChartImageHtml = "<img src='"+barchartImageUrl+"'></img>";			
			String msg = 
					HtmlRenderer.addEnclosingHtml(
							logoHtml+ "Hello, <BR><BR> This is Jacob Salesmaster. <BR> I am your SlidePiper reports representative. Please carefully review the following report. <BR><BR>"									
									+HtmlRenderer.addEnclosingBorders(
											HtmlRenderer.GenerateAlertHtml(ai, 0))+
											barChartImageHtml+
							 "<BR><BR>Glad to serve you, <BR>Jacob Salesmaster<BR>SlidePiper Reports Team"
					);
			
			System.out.println("Getcustname for custemail " +  mi.getCustomerEmail() +" sm email " + mi.getSalesManEmail());
			String subj = "SlidePiper Report for " +
					DbLayer.getCustomerName(mi.getCustomerEmail(),mi.getSalesManEmail()) +
					" (" + mi.getCustomerEmail() + ")";
					 
			EmailSender.sendEmail(mi.getSalesManEmail(), subj , msg);
	}
}
