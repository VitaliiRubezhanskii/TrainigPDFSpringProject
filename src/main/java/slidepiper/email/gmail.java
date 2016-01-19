package slidepiper.email;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.repackaged.org.apache.commons.codec.binary.Base64;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Properties;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import slidepiper.config.ConfigProperties;

public class gmail {
  
  /**
   * @see https://developers.google.com/gmail/api/quickstart/java
   */
  /** Global instance of the JSON factory. */
  private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

  /** Global instance of the HTTP transport. */
  private static HttpTransport HTTP_TRANSPORT;

  static {
    try {
      HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
    } catch (Throwable t) {
      t.printStackTrace();
      System.exit(1);
    }
  }
  
  
  /**
   * Creates a Google Credential object.
   * 
   * @see https://developers.google.com/api-client-library/java/google-api-java-client/oauth2
   * @see send_email.js
   * 
   * @param accessToken An access token received from the Google JavaScript API
   * authentication process.
   *  
   * @return a Google Credential object.
   */
  public static GoogleCredential createGoogleCredential(String accessToken) {
    return new GoogleCredential().setAccessToken(accessToken);
  }

    
  /**
   * Build and return an authorized Gmail client service.
   * 
   * @see https://developers.google.com/gmail/api/quickstart/java
   * 
   * @return an authorized Gmail client service
   * @throws IOException
   */
  public static Gmail getGmailService(Credential credential) throws IOException {
    return new Gmail.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential)
        .setApplicationName(ConfigProperties.getProperty("gmail_builder_application_name"))
        .build();
  }
  
  
  /**
   * Create a MimeMessage using the parameters provided.
   * 
   * @see https://developers.google.com/gmail/api/guides/sending
   *
   * @param to Email address of the receiver.
   * @param from Email address of the sender, the mailbox account.
   * @param subject Subject of the email.
   * @param bodyText Body text of the email.
   * @return MimeMessage to be used to send email.
   * @throws MessagingException
   */
  public static MimeMessage createEmail(String to, String from, String subject,
    String bodyText) throws MessagingException {
    Properties props = new Properties();
    Session session = Session.getDefaultInstance(props, null);
    
    MimeMessage email = new MimeMessage(session);
    
    email.setFrom(new InternetAddress(from));
    email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(to));
    email.setSubject(subject);
    email.setText(bodyText);
    return email;
  }
  
  
  /**
   * Create a Message from an email
   * 
   * @see https://developers.google.com/gmail/api/guides/sending
   *
   * @param email Email to be set to raw of message
   * @return Message containing base64url encoded email.
   * @throws IOException
   * @throws MessagingException
   */
  public static Message createMessageWithEmail(MimeMessage email)
      throws MessagingException, IOException {
    ByteArrayOutputStream bytes = new ByteArrayOutputStream();
    email.writeTo(bytes);
    String encodedEmail = Base64.encodeBase64URLSafeString(bytes.toByteArray());
    Message message = new Message();
    message.setRaw(encodedEmail);
    return message;
  }
  
  
  /**
   * Send an email from the user's mailbox to its recipient.
   * 
   * @see https://developers.google.com/gmail/api/guides/sending
   *
   * @param service Authorized Gmail API instance.
   * @param userId User's email address. The special value "me"
   * can be used to indicate the authenticated user.
   * @param email Email to be sent.
   * @throws MessagingException
   * @throws IOException
   */
  public static void sendMessage(Gmail service, String userId, MimeMessage email)
      throws MessagingException, IOException {
    Message message = createMessageWithEmail(email);
    message = service.users().messages().send(userId, message).execute();
  
    System.out.println(message.toPrettyString());
  }
}
