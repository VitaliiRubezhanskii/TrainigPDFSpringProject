package slidepiper.aws;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;

import javax.mail.*;
import javax.mail.internet.*;

import com.slidepiper.model.component.UserUtils;
import com.slidepiper.model.entity.User;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;

/**
 * @deprecated
 */
public class AmazonSES {

    // Amazon: This address must be verified.
    static final String FROM = "SlidePiper <" + ConfigProperties.getProperty("amazon_default_from_email") + ">";
    static String TO = null;
    static String BODY = null;
    static String SUBJECT = null;

    // Amazon SES SMTP credentials. Note that your SMTP credentials are different from your AWS credentials.
    static final String SMTP_USERNAME = ConfigProperties.getProperty("amazon_smtp_username");
    static final String SMTP_PASSWORD = ConfigProperties.getProperty("amazon_smtp_password");

    // Amazon SES SMTP host name.
    static final String HOST = "email-smtp.us-east-1.amazonaws.com";

    // Amazon: The port you will connect to on the Amazon SES SMTP endpoint. We are choosing port 25 because we will use
    // STARTTLS to encrypt the connection.
    static final int PORT = 25;

    /**
     * Check if salesman has email notifications enabled.
     *
     * @param notificationData - The notification data from SQL query - notification[2] = salesman email.
     * @return true/false if email notifications are enabled or not.
     */
    public static boolean isSalesmanEmailNotificationsEnabled(String salesmanEmail) {
        Map<String, Object> salesmanDetails = new HashMap<String, Object>();
        salesmanDetails = DbLayer.getSalesman(salesmanEmail);

        return (boolean) salesmanDetails.get("email_notifications_enabled");
    }

    /**
     * Set the necessary parameters to send a notification email.
     *
     * @param notificationData - The notification data from SQL query: customerEmail, documentName, salesmanEmail.
     * @param eventDataMap - The event data from the Viewer.
     */
    public static void setEventEmailParams(String[] notificationData, Map<String, String> eventDataMap)
            throws URISyntaxException {
        Map<String, String> emailParams = new HashMap<String, String>();
        int mailTypeId = 0;

        if (notificationData[0].equals("default@example.com")) {
            emailParams.put("customerEmail", "Generic Link");
        } else {
            emailParams.put("customerEmail", notificationData[0]);
        }


        String notificationEmail = notificationData[2];
        User user = UserUtils.findUser(notificationData[2]);
        if (Objects.nonNull(user.getExtraData())
                && Objects.nonNull(user.getExtraData().getNotificationEmail())) {
            notificationEmail = user.getExtraData().getNotificationEmail();
        }
        emailParams.put("documentName", notificationData[1]);
        emailParams.put("salesmanEmail", notificationEmail);
        emailParams.put("logoUrl", ConfigProperties.getProperty("app_url"));

        switch(eventDataMap.get("eventName")) {
            case "VIEWER_WIDGET_ASK_QUESTION":
                mailTypeId = 1;
                emailParams.put("eventName", "sent you a message on");
                emailParams.put("messageText", eventDataMap.get("param_2_varchar").toString());
                emailParams.put("messageReplyEmail", eventDataMap.get("param_3_varchar").toString());
                break;
        }

        try {

            // Set email fields once necessary email parameters have been filled.
            setEmailFields(mailTypeId, emailParams);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    /**
     * Set the TO, SUBJECT, and BODY fields for the notification email.
     *
     * The FROM is set in config.properties (notifications@slidepiper.com).
     *
     * @param emailParams - The parameters for the email, as set in @function setEmailParams().
     * @throws IOException
     */
    public static void setEmailFields(int mailTypeId, Map<String, String> emailParams)
            throws IOException, URISyntaxException {

        switch(mailTypeId) {
            case 1:
                String fromEmail = null;

                if (null == emailParams.get("messageReplyEmail") || emailParams.get("messageReplyEmail").equals("")) {
                    fromEmail = emailParams.get("customerEmail");
                } else {
                    fromEmail = emailParams.get("messageReplyEmail");
                }

                TO = emailParams.get("salesmanEmail");
                SUBJECT = fromEmail + " " + emailParams.get("eventName") + " " + emailParams.get("documentName");
                BODY = getEmailNotificationsTemplate(emailParams);
                break;

            case 2:
            case 3:
                TO = emailParams.get("salesmanEmail");
                SUBJECT = emailParams.get("subject");
                BODY = emailParams.get("body");
                break;
        }

        if (null != FROM && null != TO && null != SUBJECT && null != BODY) {
            try {
                sendEmail();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }


    /**
     * Get the email notifications template.
     *
     * Template is written with FreeMarker Templates. The template used the emailParams object for the tags.
     *
     * @param emailParams - The parameters for the email, as set in @function setEmailParams().
     * @return body - the stringified email body template.
     * @throws IOException
     */
    public static String getEmailNotificationsTemplate(Map<String, String> emailParams)
            throws IOException, URISyntaxException {
        String body = null;
        Configuration cfg = new Configuration();

        URL url = AmazonSES.class.getResource("/email-templates");
        cfg.setDirectoryForTemplateLoading(new File(url.toURI()));

        Template template = cfg.getTemplate("EmailNotification.ftl");
        StringWriter stringwriter = new StringWriter();

        try {
            template.process(emailParams, stringwriter);
        } catch (TemplateException e) {
            e.printStackTrace();
        }

        body = stringwriter.toString();

        return body;
    }


    /**
     * Amazon SES function to send a notification email.
     *
     * @throws Exception
     */
    public static void sendEmail() throws Exception {

        // Create a Properties object to contain connection configuration information.
        Properties props = System.getProperties();
        props.put("mail.transport.protocol", "smtps");
        props.put("mail.smtp.port", PORT);

        // Set properties indicating that we want to use STARTTLS to encrypt the connection.
        // The SMTP session will begin on an unencrypted connection, and then the client
        // will issue a STARTTLS command to upgrade to an encrypted connection.
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");

        // Create a Session object to represent a mail session with the specified properties.
        Session session = Session.getDefaultInstance(props);

        // Create a message with the specified information.
        MimeMessage msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress(FROM));
        msg.setRecipient(Message.RecipientType.TO, new InternetAddress(TO));
        msg.setSubject(SUBJECT);
        msg.setContent(BODY, "text/html");

        // Create a transport.
        Transport transport = session.getTransport();

        // Send the message.
        try {
            System.out.println("Attempting to send an email through the Amazon SES SMTP interface...");

            // Connect to Amazon SES using the SMTP username and password you specified above.
            transport.connect(HOST, SMTP_USERNAME, SMTP_PASSWORD);

            // Send the email.
            transport.sendMessage(msg, msg.getAllRecipients());
            System.out.println("SP: Email sent! Subject: " +  SUBJECT);
        } catch (Exception ex) {
            System.out.println("The email was not sent.");
            System.out.println("Error message: " + ex.getMessage());
        }
        finally {
            // Close and terminate the connection.
            transport.close();
        }
    }
}
