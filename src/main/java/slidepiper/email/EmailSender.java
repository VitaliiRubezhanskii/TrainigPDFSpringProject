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
		       			       
		       	 
		       System.out.println("Sent ALERT email. msg=" + msg);
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
		  
		  String logoHtml = "<img src='www.slidepiper.com/img/logoOriginal.png' style='background-color: black;'>SlidePiper</img>";

		  
		  String appname = System.getenv("OPENSHIFT_APP_NAME");									
			String currentviewslink;
			String chatlink = "www.google.com";
			if (appname==null) //running locally
			{
				currentviewslink = "localhost:8080/sp/viewbarchart.jsp?session_id=" + sessionId;				
			}
			else
			{
				 if (appname.equalsIgnoreCase("slidepipertest"))
				 {
					 currentviewslink = "http://slidepipertest-slidepiper.rhcloud.com/viewbarchart.jsp?session_id=" + sessionId;
				 }
				 else
					 if (appname.equalsIgnoreCase("sp")) 
					 {
						 currentviewslink = "http://www.slidepiper.com/viewbarchart.jsp?session_id=" + sessionId;
					 }
					 else
					 {
						 	currentviewslink = "CANNOT MAKE LINK";
					 }							 
			}
					  			  
			EmailSender.sendEmail(mi.getSalesManEmail(), 
					"SlidePiper Alert for email " + mi.getCustomerEmail(),
					logoHtml +
					"Hello, <BR><BR>This is Jacob Salesmaster. <BR>I am your customer alerts representative.<BR><BR>" + mi.getCustomerEmail() + " has just clicked on the link you sent him! <BR><BR>"
					+"<u>What would you like do next?</u><BR><a href='"+chatlink+"'>Connect to Chat</a><BR><a href='"+currentviewslink+"'>View Current Report</a>"
					+"<BR><BR> Glad to serve you, <BR>Jacob Salesmaster<BR>SlidePiper Alerts System"
					);

	}
	// report email after customer stops viewing presentation
	// called from KeepAliveTask
	public static void sendReportEmail(KeepAlivePacket p)
	{					
			MessageInfo mi = DbLayer.getMessageInfo(p.getMsgId());													
			AlertData ai = DbLayer.getAlert(p.getSessionId(),mi.getSalesManEmail());					
			// i=0 not important. no buttons or divs filled with code here. it's email.
			  String logoHtml = "<img src='www.slidepiper.com/img/logoOriginal.png' style='background-color: black;'>SlidePiper</img>";
			  
			String msg = logoHtml+ "Hello, <BR><BR> This is Jacob Salesmaster. <BR> I am your SlidePiper reports representative. Please carefully review the following report. <BR><BR>";
			
			System.out.println("Getcustname for custemail " +  mi.getCustomerEmail() +" sm email " + mi.getSalesManEmail());
			String subj = "SlidePiper Report for " +
					DbLayer.getCustomerName(mi.getCustomerEmail(),mi.getSalesManEmail()) +
					" (" + mi.getCustomerEmail() + ")";
					
			msg += HtmlRenderer.GenerateAlertHtml(ai, 0);					
			msg += "<BR><BR>Glad to serve you, <BR>Jacob Salesmaster<BR>SlidePiper Reports Team";
			EmailSender.sendEmail(mi.getSalesManEmail(), subj , msg);
	}
}
