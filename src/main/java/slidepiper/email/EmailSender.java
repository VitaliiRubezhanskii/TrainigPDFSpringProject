package slidepiper.email;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.services.gmail.Gmail;
import com.slidepiper.model.component.UserUtils;
import com.slidepiper.model.entity.User;

import slidepiper.aws.AmazonSES;
import slidepiper.config.ConfigProperties;
import slidepiper.dataobjects.AlertData;
import slidepiper.dataobjects.CustomerSession;
import slidepiper.dataobjects.MessageInfo;
import slidepiper.db.DbLayer;
import slidepiper.keepalive.KeepAlivePacket;
import slidepiper.ui_rendering.BarChartRenderer;
import slidepiper.ui_rendering.HtmlRenderer;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;

public class EmailSender {
  
  /** A regex for capturing a merge tag. */
  private static final String MERGE_TAG_REGEX =
      "\\" + ConfigProperties.getProperty("merge_tag_start_character") + "(.+?)"
      + "\\" + ConfigProperties.getProperty("merge_tag_end_character");
  
  /** The delimiter used for separating the merge tag parts. */
  private static final String MERGE_TAG_DELIMITER =
      ConfigProperties.getProperty("merge_tag_delimiter");
  
  /** Merge tag types representations. */
  public static final String MERGE_TAG_FILE = "file";
  public static final String MERGE_TAG_FIRST_NAME = "first-name";
  public static final String MERGE_TAG_LAST_NAME = "last-name";
  public static final String MERGE_TAG_SALESMAN_FIRST_NAME = "salesman-first-name";
  public static final String MERGE_TAG_SALESMAN_LAST_NAME = "salesman-last-name";
  
  
	// general send email function, used by the other ones.
	public static void sendEmail(String to, String subj, String msg)
	{
		  final String username = "david.salesmaster@gmail.com"; 	
		  final String password = "salesdavidgreat2000";//"yourpassword";
		  //System.out.println("user pw for email is: " + salesmanEmailpassword);
		  Properties props = new Properties();
		  props.put("mail.smtp.host", "smtp.gmail.com");
		  props.put("mail.smtp.socketFactory.port", "465");
		  props.put("mail.smtp.socketFactory.class",
				  	"javax.net.ssl.SSLSocketFactory");
		  props.put("mail.smtp.auth", "true");
		  props.put("mail.smtp.port", "465");	    
		  
	    //System.out.println("email login with user " + username + " pw " + password);
		  Session session = Session.getInstance(props,
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
	public static void sendAlertEmail(String id, String sessionId) {
		MessageInfo mi = DbLayer.getMessageInfo(id);		  		  
		String currentviewslink;
		String chatlink;
		String urlprefix = ConfigProperties.getProperty("viewer_url", mi.getSalesManEmail()) + "/";
		
		String custname = DbLayer.getCustomerName(mi.getCustomerEmail(), mi.getSalesManEmail());
		String getParams = "sessionid="+sessionId+"&salesman="+DbLayer.getSalesmanName(mi.getSalesManEmail())+"&customername="+ custname +"&role=1";
		
		currentviewslink = urlprefix + "viewbarchart.jsp?session_id=" + sessionId;
		chatlink = urlprefix + "pdfjs/chatwindow.html?" + getParams;
		CustomerSession cs = DbLayer.getSessionData(sessionId);
		
		String subj = null;
		String givenEmailAddressAtOpenSlidesEvent = DbLayer.getOpenSlidesEventEmailAddress(cs.getSession_id());
		if (null != givenEmailAddressAtOpenSlidesEvent
		  && ! givenEmailAddressAtOpenSlidesEvent.equals(mi.getCustomerEmail())) {
		  subj = DbLayer.getOpenSlidesEventEmailAddress(cs.getSession_id()) +
          " opened " + DbLayer.getSlidesName(mi.getSlidesId());     
		} else {
		  subj = DbLayer.getCustomerName(mi.getCustomerEmail(),mi.getSalesManEmail()) +
          " opened " + DbLayer.getSlidesName(mi.getSlidesId());
		}
								 			
		String msgtext = HtmlRenderer.getAlertHtml(mi, cs, currentviewslink, chatlink); 
		
		Map<String, String> emailParams = new HashMap<String, String>();
		
		String notificationEmail = mi.getSalesManEmail();
		User user = UserUtils.findUser(mi.getSalesManEmail());
    if (Objects.nonNull(user.getExtraData())
        && Objects.nonNull(user.getExtraData().getNotificationEmail())) {
      notificationEmail = user.getExtraData().getNotificationEmail();
    }
		emailParams.put("salesmanEmail", notificationEmail);
		
		emailParams.put("subject", subj);
		emailParams.put("body", msgtext);
		
		int mailTypeId = 2;
		
		try {
			AmazonSES.setEmailFields(mailTypeId, emailParams);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	// report email after customer stops viewing presentation
	// called from KeepAliveTask
	public static void sendReportEmail(KeepAlivePacket p) {					
		MessageInfo mi = DbLayer.getMessageInfo(p.getMsgId());													
		AlertData ai = DbLayer.getAlert(p.getSessionId(),mi.getSalesManEmail());			
		String chatMessages = "";
		ArrayList<String> msgs = DbLayer.getChatMessages(p.getSessionId());			
		for(String msg : msgs) {
			chatMessages += (msg+"<BR>");
		}			
		
		if (msgs.isEmpty()) {
			chatMessages = "No messages.";
		}
		
		String subj = null;
		String givenEmailAddressAtOpenSlidesEvent = DbLayer.getOpenSlidesEventEmailAddress(ai.getSession_id());
		
    if (null != givenEmailAddressAtOpenSlidesEvent
      && ! givenEmailAddressAtOpenSlidesEvent.equals(mi.getCustomerEmail())) {
      subj = DbLayer.getOpenSlidesEventEmailAddress(ai.getSession_id()) +
          " viewed " + DbLayer.getSlidesName(mi.getSlidesId());     
    } else {
      subj = DbLayer.getCustomerName(mi.getCustomerEmail(),mi.getSalesManEmail()) +
          " viewed " + DbLayer.getSlidesName(mi.getSlidesId());
    }
		
		String msgtext = HtmlRenderer.getReportHtml(ai, chatMessages);
		
		// write in session without enclosing html. only enclosing table.
		DbLayer.updateSessionReport(p.getSessionId(), "<table>"+msgtext+"</table>");
		
		Map<String, String> emailParams = new HashMap<String, String>();
		
		String notificationEmail = mi.getSalesManEmail();
    User user = UserUtils.findUser(mi.getSalesManEmail());
    if (Objects.nonNull(user.getExtraData())
        && Objects.nonNull(user.getExtraData().getNotificationEmail())) {
      notificationEmail = user.getExtraData().getNotificationEmail();
    }
		emailParams.put("salesmanEmail", notificationEmail);
		
		emailParams.put("subject", subj);
		emailParams.put("body", msgtext);
		
		int mailTypeId = 3;
		
		try {
			AmazonSES.setEmailFields(mailTypeId, emailParams);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	
	/**
   * Create a merge tag set.
   *    
   * @param inputText An array containing text strings to be searched for merge tags.
   * 
   * @return A unique set containing MERGE_TAG_REGEX merge tags that were found in
   * inputText strings.
   */
	 public static Set<String> createMergeTagSet(String[] inputTextArray) {
	   Matcher matcher;
	   Pattern pattern = Pattern.compile(MERGE_TAG_REGEX, Pattern.CASE_INSENSITIVE);
     Set<String> mergeTagSet = new HashSet<String>();
	   
	   for (int i = 0; i < inputTextArray.length; i++) {
       matcher = pattern.matcher(inputTextArray[i]);
       
       while (matcher.find()) {
         mergeTagSet.add(matcher.group(1));
       }
     }
	   
	   return mergeTagSet;
	 }
	
	 
	 /**
	  * Create a merge tag map.
	  * 
	  * @param mergeTagSet A merge tag set. 
	  * @param customerEmail The customer email.
	  * @param salesmanEmail The salesman email.
	  * 
	  * @return A map containing merge tags and their replacements.
	  */
	 public static Map<String, String> createMergeTagMap(Set<String> mergeTagSet,
	     String customerEmail, String salesmanEmail) {
     
	   List<String> mergeTagPart = new ArrayList<String>();
	   Map<String, String> mergeTagMap = new HashMap<String, String>();
     
	   for (String mergeTag : mergeTagSet) {
       mergeTagPart = Arrays.asList(mergeTag.split(MERGE_TAG_DELIMITER));
       
       switch (mergeTagPart.get(0).toLowerCase()) {
         case MERGE_TAG_FILE:
           String fileHash = mergeTagPart.get(1);
           String fileLinkHash = DbLayer.setFileLinkHash(customerEmail, fileHash, salesmanEmail);
           String fileLink = ConfigProperties.getProperty("viewer_url", salesmanEmail)
               + ConfigProperties.FILE_VIEWER_PATH + "?"
               + ConfigProperties.getProperty("file_viewer_query_parameter") + "="
               + fileLinkHash;
           mergeTagMap.put(mergeTag, fileLink);
           break;
           
         case MERGE_TAG_FIRST_NAME:     
           mergeTagMap.put(mergeTag, DbLayer.getCustomer(customerEmail, salesmanEmail)
               .get("first_name"));
           break;
           
         case MERGE_TAG_LAST_NAME:
           mergeTagMap.put(mergeTag, DbLayer.getCustomer(customerEmail, salesmanEmail)
               .get("last_name"));
           break;
           
         case MERGE_TAG_SALESMAN_FIRST_NAME:
	       if (null != DbLayer.getSalesman(salesmanEmail).get("first_name")) {
	         mergeTagMap.put(mergeTag, DbLayer.getSalesman(salesmanEmail).get("first_name").toString());
	       } else {
	    	   mergeTagMap.put(mergeTag, "");
	       }
           break;
           
         case MERGE_TAG_SALESMAN_LAST_NAME:
	       if (null != DbLayer.getSalesman(salesmanEmail).get("last_name")) {
		     mergeTagMap.put(mergeTag, DbLayer.getSalesman(salesmanEmail).get("last_name").toString());
		   } else {
		     mergeTagMap.put(mergeTag, "");
		   }
           break;
       }
     }
        
     return mergeTagMap;
   }
	 
	 
	/**
	 * Search for merge tags in a given text and replace them with their replacements.
	 * 
	 * @param searchReplaceMap A merge tag map.
   * @param inputText The text to be processed for searching and replacing merge tags.
   * 
	 * @return A processed inputText where merge tags were replaced with their replacements.
	 */
	public static String searchReplaceMergeTag(Map<String, String> searchReplaceMap,
	    String inputText) {
  	
	  Pattern pattern = Pattern.compile(MERGE_TAG_REGEX, Pattern.CASE_INSENSITIVE); 
	  Matcher matcher = pattern.matcher(inputText);
    StringBuffer sb = new StringBuffer();
    
    while (matcher.find()) {
      String replacement = searchReplaceMap.get(matcher.group(1));
      if (null != replacement) {    
        matcher.appendReplacement(sb, replacement);
      }
    }
    
    return matcher.appendTail(sb).toString();
  }
	
	
	/**
	 * Send a Gmail email via Google Gmail API.
	 * 
	 * @param customerEmail The customer email, i.e. the "to:" address.
	 * @param salesmanEmail The customer email, i.e. the "from:" address.
	 * @param emailSubject The email subject.
	 * @param emailBody The email body.
	 * @param emailBody The email body.
	 * 
	 * @return True or false whether an email was sent or not.
	 */
  public static boolean sendGmailEmail(String customerEmail, String salesmanEmail,
      String emailSubject, String emailBody, String accessToken) throws IOException, MessagingException {
    
    Credential credential = gmail.createGoogleCredential(accessToken);
    Gmail gmailService = gmail.getGmailService(credential);
    MimeMessage email = gmail.createEmail(customerEmail, salesmanEmail, emailSubject, emailBody);
    
    try {
      gmail.sendMessage(gmailService, "me", email);
      return true;
    } catch(GoogleJsonResponseException ex) {
      System.err.println(ex.getMessage());
      return false;
    }
  }
}
