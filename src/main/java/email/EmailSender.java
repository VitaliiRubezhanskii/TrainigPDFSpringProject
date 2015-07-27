package email;

import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

public class EmailSender {

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
		  
	    System.out.println("email login with user " + username + " pw " + password);
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
		       			       
		       	 
		       System.out.println("EmailSender Cust alert mail sent succesfully! msg " + msg);
		   } catch (MessagingException e) {		   			
			   		System.out.println("ERROR sending message " + e.getMessage() + " stack: " + e.getStackTrace());
		        throw new RuntimeException(e);
		      }

	}
}
