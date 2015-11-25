package slidepiper.email;

import java.util.ArrayList;
import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import slidepiper.config.ConfigProperties;
import slidepiper.dataobjects.AlertData;
import slidepiper.dataobjects.CustomerSession;
import slidepiper.dataobjects.MessageInfo;
import slidepiper.db.DbLayer;
import slidepiper.keepalive.KeepAlivePacket;
import slidepiper.ui_rendering.BarChartRenderer;
import slidepiper.ui_rendering.HtmlRenderer;

public class EmailSender {

	// general send email function, used by the other ones.
	public static void sendEmail(String to, String subj, String msg)
	{
		  final String username = "david.salesmaster@gmail.com"; 	
		  final String password = "davidsales2";//"yourpassword";
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
	
	public static String getUrlPrefix()
	{
		return ConfigProperties.getProperty("app_url") + "/";
	}
	
	// send alert email
	public static void sendAlertEmail(String id, String sessionId)
	{
		  MessageInfo mi = DbLayer.getMessageInfo(id);		  		  
			String currentviewslink;
			String chatlink;
			String urlprefix = getUrlPrefix();		
			
			String custname = DbLayer.getCustomerName(mi.getCustomerEmail(), mi.getSalesManEmail());
			String getParams = "sessionid="+sessionId+"&salesman="+DbLayer.getSalesmanName(mi.getSalesManEmail())+"&customername="+ custname +"&role=1";
			
			currentviewslink = urlprefix + "viewbarchart.jsp?session_id=" + sessionId;
			chatlink = urlprefix + "pdfjs/chatwindow.html?" + getParams;
			String fullchatlink= urlprefix+"pdfjs/viewer.html?file=" + ConfigProperties.getProperty("app_url") + "/file/" + mi.getId() + "&" + getParams;
			
			String subj = "SlidePiper Alert for " +
					DbLayer.getCustomerName(mi.getCustomerEmail(),mi.getSalesManEmail()) +
					" (" + mi.getCustomerEmail() + ")";						
					  			 			
			CustomerSession cs = DbLayer.getSessionData(sessionId);
			
			String msgtext = HtmlRenderer.getAlertHtml(mi, cs, currentviewslink, chatlink, fullchatlink); 
						
			EmailSender.sendEmail(mi.getSalesManEmail(), 
					subj,				
						msgtext
					);
			
			System.out.println("********** SENT ALERT EMAIL for " + mi.getSalesManEmail());
	}
	// report email after customer stops viewing presentation
	// called from KeepAliveTask
	public static void sendReportEmail(KeepAlivePacket p)
	{					
			MessageInfo mi = DbLayer.getMessageInfo(p.getMsgId());													
			AlertData ai = DbLayer.getAlert(p.getSessionId(),mi.getSalesManEmail());			
			String chatMessages = "";
			ArrayList<String> msgs = DbLayer.getChatMessages(p.getSessionId());			
			for(String msg : msgs)
			{
				chatMessages += (msg+"<BR>");
			}			
			if (msgs.isEmpty()) chatMessages = "No messages.";
			
			String custname = DbLayer.getCustomerName(mi.getCustomerEmail(),mi.getSalesManEmail());
			
//			System.out.println("Getcustname for custemail " +  mi.getCustomerEmail() +" sm email " + mi.getSalesManEmail() + " is " + custname);
			String subj = "SlidePiper Report for " +
					custname +
					" (" + mi.getCustomerEmail() + ")";
			
			String msg = HtmlRenderer.getReportHtml(ai, chatMessages);
			
			// write in session without enclosing html. only enclosing table.
			DbLayer.updateSessionReport(p.getSessionId(), "<table>"+msg+"</table>");
					 
			msg = HtmlRenderer.addEnclosingHtml(msg);
			EmailSender.sendEmail(mi.getSalesManEmail(), subj , msg);
			
			System.out.println("********** SENT REPORT EMAIL for " + mi.getSalesManEmail());
	}
}
