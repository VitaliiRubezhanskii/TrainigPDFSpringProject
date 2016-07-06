package slidepiper.salesman_servlets;

import java.io.BufferedReader;

import slidepiper.config.ConfigProperties;
import slidepiper.dataobjects.Customer;
import slidepiper.dataobjects.Presentation;
import slidepiper.db.Analytics;
import slidepiper.db.DbLayer;
import slidepiper.email.EmailSender;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLDecoder;
import java.sql.Date;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.tomcat.jni.File;
import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/ManagementServlet")
public class ManagementServlet extends HttpServlet {
  
  private static final long serialVersionUID = 1L;
  //private final String MAIL_HOST = "smtp.gmail.com";
   // private final String MAIL_FROM = "slidepiper";
   // private final String MAIL_PASSWORD = "p57nXU4N";
    
    //static File[] listOfFiles;
  //static File folder;
//  static HashMap<String, int[]> map;
//  boolean repeatFunction = false;
//  Thread thread;
//  static ArrayList<String[]> data;
  
    public ManagementServlet() {      
        super();
    }

  public void init(ServletConfig config) throws ServletException {
    // to start auto put in web.xml:
/*
<servlet>
    <servlet-name>ManagementServlet</servlet-name>
    <servlet-class>slidepiper.salesman_servlets.ManagementServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
</servlet>
*/
      System.out.println("Init ManagementServlet");
      DbLayer.init();       
  }
    
  /***********************    GET METHODS   *********************************/
  
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException {
  
    JSONObject data = new JSONObject();
    ArrayList<String> parameterList = new ArrayList<String>();
    List<String[]> sqlData = new ArrayList<String[]>();
    
    switch (request.getParameter("action")) {
      case "getMailType":
        String mailType = DbLayer.getSalesmanMailType(request.getParameter("salesmanEmail"));
        data.put("mailType", mailType);
        break;
        
        
      case "getFileLinkHash":
        try {
          String customerEmail = request.getParameter("customerEmail");
          String salesmanEmail = request.getParameter("salesmanEmail");
          
          if (! DbLayer.isCustomerExist(salesmanEmail, customerEmail)) {  
            DbLayer.addNewCustomer(null, salesmanEmail, "Test", "Viewer", null, customerEmail);
          }
          
          String fileHash = request.getParameter("fileHash");
          String fileLinkHash = DbLayer.setFileLinkHash(customerEmail, fileHash, salesmanEmail);
          
          data.put("fileLinkHash", fileLinkHash);  
        } catch (Exception e) {
          System.err.println("Error message: " + e.getMessage());
          e.printStackTrace();
        }
        break;
        
        
      case "getFilesList":
        parameterList.add(request.getParameter("salesmanEmail"));
        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFilesList);
        data.put("filesList", sqlData);
        break;
        
      case "getFilesData":
        parameterList.add(request.getParameter("salesmanEmail"));
        switch (request.getParameter("sortChoice")){
      		case "fileName":
      			sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFilesDataByName);
      			break;
      		case "performance":
      			sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFilesDataByPerformance);
      			break;
      		case "noSort":
      			sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFilesDataByName);
      			break;
        }
        data.put("filesData", sqlData);
        break;
      
      case "getFilesCustomerData":
        parameterList.add(request.getParameter("salesmanEmail"));
        parameterList.add(request.getParameter("customerEmail"));
        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFilesCustomerData);        
        data.put("filesCustomerData", sqlData);
        break;
      
	    case "getTopExitPage":
        parameterList.add(request.getParameter("fileHash"));
        parameterList.add(request.getParameter("salesmanEmail"));
        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlTopExitPage);
        data.put("topExitPage", sqlData);
        break;
        
	    case "getCustomersList":
        parameterList.add(request.getParameter("salesmanEmail"));
        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlCustomersList);        
        data.put("customersList", sqlData);
        break;
        
	    case "getCustomersFilesList":
        parameterList.add(request.getParameter("salesmanEmail"));
        switch (request.getParameter("sortChoice")){
        	case "customerName":
        		sqlData = DbLayer.getEventData(parameterList, Analytics.sqlCustomersFilesList);
        }
        data.put("customersFilesList", sqlData);
        break;
        
	    case "getFileBarChart":
        parameterList.add(request.getParameter("fileHash"));
        parameterList.add(request.getParameter("salesmanEmail"));
        if (null == request.getParameter("customerEmail") || request.getParameter("customerEmail").equals("")) {
          sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileBarChart);
        } else {
          parameterList.add(request.getParameter("customerEmail"));
          sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileCustomerBarChart);
        }
        data.put("fileBarChart", sqlData);
        break;
      
      case "getFileLineChart":
        parameterList.add(request.getParameter("fileHash"));
        parameterList.add(request.getParameter("salesmanEmail"));
        if (null == request.getParameter("customerEmail") || request.getParameter("customerEmail").equals("")) {
          sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileLineChart);
        } else {
          parameterList.add(request.getParameter("customerEmail"));
          sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileCustomerLineChart);
        }
        data.put("fileLineChart", sqlData);
        break;
        
      case "getFilePerformanceChart":
        parameterList.add(request.getParameter("fileHash"));
        parameterList.add(request.getParameter("salesmanEmail"));
        sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFilePerformanceChart);
        data.put("filePerformanceChart", sqlData);
        break;
        
      case "getFileVisitorsMap":
        parameterList.add(request.getParameter("fileHash"));
        parameterList.add(request.getParameter("salesmanEmail"));
        if (null == request.getParameter("customerEmail") || request.getParameter("customerEmail").equals("")) {
          sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileVisitorsMap);
        } else {
          parameterList.add(request.getParameter("customerEmail"));
          sqlData = DbLayer.getEventData(parameterList, Analytics.sqlFileCustomerVisitorsMap);
        }
        data.put("fileVisitorsMap", sqlData);
        break;
        
      case "getWidgetsSettings":
        int fileId = 0;
        boolean isViewer = false;
        
        if (null != request.getParameter("fileLinkHash")) {
          String fileLinkHash = request.getParameter("fileLinkHash");
          fileId = DbLayer.getFileIdFromFileLinkHash(fileLinkHash);
          isViewer = true;
        } else if (null != request.getParameter("fileHash")) {
          String fileHash = request.getParameter("fileHash");
          fileId = DbLayer.getFileIdFromFileHash(fileHash);
        }
        
        if (0 != fileId) {
          data.put("widgetsSettings", DbLayer.getWidgetsSettings(fileId, isViewer));
        }
        break;
	  }
	  
	  response.setContentType("application/json; charset=UTF-8");
    PrintWriter output = response.getWriter(); // TODO: is output redundant as I can write response.getWriter().print(data);
    output.print(data);  // TODO: is this statment needed?
    output.close(); // TODO: is this statment needed?
  }
  
  
  /***********************     DO-POST    *********************************/

  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    StringBuffer jb = new StringBuffer();
    DbLayer.init();
    //System.out.println("post req");
      String line = null;
      try {
        BufferedReader reader = request.getReader();
          while ((line = reader.readLine()) != null)
            jb.append(line);
      } catch (Exception e) {
        System.out.println("problem here!");
      }
      
      System.out.println("JSON received at MgmtServlet: " + jb.toString());
      try{      
      JSONObject input = new JSONObject(jb.toString());
      String action = input.getString("action");
      JSONObject output = new JSONObject();
      
      System.out.println("action at MgmtServlet: " + action);
      
      int salesman_found = 0;
      
      JSONObject data = input.has("data") ? input.getJSONObject("data") : null; 
      Map<String, String> eventDataMap = new HashMap<String, String>();
      switch(action){     
      case "changeSalesmanPassword":
        System.out.println("Salesman change pw");
              
        // check old pw given and in db
        if (input.getString("oldpassword").equalsIgnoreCase(DbLayer.getSalesmanPassword(input.getString("email"))))
        {
            DbLayer.setPassword(input.getString("email"), input.getString("newpassword"));            
            output.put("success", 1);
            System.out.println("pw change successfully");
        }
        else
        {
          output.put("success", 0);
          System.out.println("error changing pw");
        }       
        break;
            
        case "salesmanLogin":
          System.out.println("Salesman logging in");
          int login_ok = 0;
          
          if (DbLayer.getSalesmanPassword(
              input.getString("email")).equalsIgnoreCase(
                  input.getString("password")))
          {
              login_ok = 1;
          }         
          output.put("salesman", login_ok);
          break;
          
        case "getSalesmanData":
          //System.out.println("Sending salesmandata");       
          ArrayList<Customer> custs = DbLayer.getMyCustomers(input.getString("email"));
          //System.out.println("input email: " + input.getString("email") + " # customers: " + custs.size());          
          output.put("myCustomers", custs);         
          ArrayList<Presentation> mypres = DbLayer.getMyPresentations(input.getString("email"));
          output.put("presentations", mypres);
          //System.out.println("Sending salesmandata.done");
          break;
          
        case "sendPresentationToCustomer":                  
          String msgtext = input.getString("msgtext");
          String msgsubj = input.getString("msgsubj");
                    
          try
          {
              msgtext = URLDecoder.decode(msgtext, "UTF-8");  
              msgsubj = URLDecoder.decode(msgtext, "UTF-8");
          }
          catch (Exception e)
          {
                System.out.println("Error decoding msg "  + msgtext);
                System.out.println("Error decoding msg " + e.getMessage());
          }
          
          String msglink = ConfigProperties.getProperty("app_url") + "/pdfjs/viewer.html?file=/" + ConfigProperties.getProperty("app_contextpath") + "file/" + input.getString("docid") + "#zoom=page-fit";

          msgtext = msgtext + "<br>" + msglink;
                            
          int timezone_offset = Integer.parseInt(input.getString("timezone_offset_min"));
          System.out.println("sending msg from:  "  + input.getString("salesman_email") + " tz offset " + timezone_offset);         
          
          //does not really send, just write to db. sent using mailto.
            DbLayer.sendMessage(input.getString("docid"), input.getString("salesman_email"), "no email password", input.getString("customeremails"),
              input.getString("slides_ids"), msgtext, "", msgsubj, timezone_offset
              );
          
          // message will be sent using mailto!!!
                        
          System.out.println("In sendPresToCust done.");
          output.put("succeeded", 1); //success signal          
          // important --> link is used in mailto
          output.put("link", msglink); //link for message
          output.put("mailtype", DbLayer.getSalesmanMailType(input.getString("salesman_email"))); //link for message
          break;
                            
        case "addNewCustomer":
          System.out.println("add/update new cust");          
          String subAction = null;
          try {
            subAction = input.getString("subAction");
          } catch (Exception ex) {
            subAction = null;
          }
          
          output.put("newCustomer", DbLayer.addNewCustomer(
              subAction, input.getString("salesmanEmail"),
              input.getString("customerFirstName"), input.getString("customerLastName"),
              input.getString("customerCompany"), input.getString("customerEmail")));
          break;
                            
        case "deleteCustomer":
          System.out.println("deleting cust " + input.getString("customer_email") + " " + input.getString("salesman_email"));
          DbLayer.deleteCustomer(input.getString("customer_email"),input.getString("salesman_email"));
          break;          

        case "deletePresentation":
          System.out.println("deleting pres " + input.getString("presentation") + " " + input.getString("salesman_email"));
          DbLayer.deletePresentation(input.getString("presentation"), input.getString("salesman_email"));
          break;
        
        
        case "setCustomerEvent":
          eventDataMap.put("msg_id", URLDecoder.decode(data.getString("linkHash"), "UTF-8"));
          eventDataMap.put("session_id", URLDecoder.decode(data.getString("sessionId"), "UTF-8"));
          
          eventDataMap.put("param_1_varchar",
              URLDecoder.decode(data.getString("id"), "UTF-8"));
          eventDataMap.put("param_2_varchar",
              URLDecoder.decode(data.getString("buttonText"), "UTF-8"));
          eventDataMap.put("param_3_varchar",
              URLDecoder.decode(data.getString("destinationUrl"), "UTF-8"));
          
          DbLayer.setEvent(DbLayer.CUSTOMER_EVENT_TABLE,
              URLDecoder.decode(data.getString("eventName"), "UTF-8"), eventDataMap);
          break;
   
        case "setSalesmanDocumentSettings":
        	String isChatEnabled = Boolean.toString(input.getBoolean("isChatEnabled"));
        	Boolean isAlertEmailEnabled = input.getBoolean("isAlertEmailEnabled");
        	Boolean isReportEmailEnabled = input.getBoolean("isReportEmailEnabled");
        	String salesMan = input.getString("salesMan");
        	
        	System.out.println("Chat: " + isChatEnabled + ", Alert: " + isAlertEmailEnabled + ", Report: " + isReportEmailEnabled 
 				   + ", User: " + salesMan);
        	
        	DbLayer.setSalesmenDocumentSettings(isChatEnabled, isAlertEmailEnabled, isReportEmailEnabled, salesMan);
        	
        	output.put("result", "success");
        	break;
          
        case "createCustomersFilelinks":
          JSONArray customersFilelinks = new JSONArray();
          for (int i = 0; i < data.getJSONArray("data").length(); i++) {
            JSONObject group = data.getJSONArray("data").getJSONObject(i);
            String customerEmail = group.getString("customerEmail");
            JSONArray fileHashes = group.getJSONArray("fileHashes");
            
            JSONObject customer = new JSONObject();
            JSONArray files = new JSONArray();
            
            for (int j = 0; j < fileHashes.length(); j++) { 
              JSONObject file = new JSONObject();
              file.put("fileHash", fileHashes.getString(j));
              file.put("fileLink",
                  DbLayer.setFileLinkHash(
                    customerEmail,
                    fileHashes.getString(j),
                    input.getString("salesmanEmail"))
              );
              files.put(file);
            }
            customer.put("customerEmail", group.getString("customerEmail"));
            customer.put("files", files);
            customersFilelinks.put(customer);
          }
          
          output.put("customersFilelinks", customersFilelinks);
          break;
          
        case "setUserEvent":
        	eventDataMap.put("email", URLDecoder.decode(data.getString("email"), "UTF-8"));
        	DbLayer.setEvent(DbLayer.SALESMAN_EVENT_TABLE, URLDecoder.decode(data.getString("event_name"),
        			"UTF-8"), eventDataMap);
          break;
          
          
        case "setWidgetsSettings":
          JSONArray widgetsSettings = input.getJSONArray("widgetsSettings");
          String fileHash = input.getString("fileHash");
          
          int resultCode = DbLayer.setWidgetsSettings(fileHash, widgetsSettings);
          output.put("resultCode", resultCode);
          break;
          
          
        case "sendEmail":
          String emailBody = URLDecoder.decode(data.getString("emailBody"), "UTF-8");
          String emailSubject = URLDecoder.decode(data.getString("emailSubject"), "UTF-8");
          String[] emailMessageArray = {emailSubject, emailBody};
          
          // Create a merge tag set.
          Set<String> mergeTagSet = EmailSender.createMergeTagSet(emailMessageArray);
          
          // Iterate through customers for replacing merge tags (if any) and sending emails.
          JSONArray customerEmailArray = data.getJSONArray("customerEmailArray");
          String salesmanEmail = URLDecoder.decode(data.getString("salesmanEmail"), "UTF-8");
          int emailSent = 0;
          
          for (int i = 0; i < customerEmailArray.length(); i++) {
            if (0 < mergeTagSet.size()) {
              Map<String, String> mergeTagMap = EmailSender.createMergeTagMap(mergeTagSet,
                customerEmailArray.getString(i), salesmanEmail);
            
              emailSubject = EmailSender.searchReplaceMergeTag(mergeTagMap, emailSubject);
              emailBody = EmailSender.searchReplaceMergeTag(mergeTagMap, emailBody);
            }
            
            // Send emails. If an API is not existent, then use below mailto workaround.
            boolean isEmailSent = false;
            switch(data.getString("salesmanEmailClient")) {
              case "gmail":
                isEmailSent = EmailSender.sendGmailEmail(customerEmailArray.getString(i),
                    salesmanEmail, emailSubject, emailBody, data.getString("accessToken"));
                break;    
            }
            
            // Record event.
            if (isEmailSent) {
              eventDataMap.put("email", salesmanEmail);
              
              eventDataMap.put("param_1_varchar", data.getString("accessToken"));
              eventDataMap.put("param_2_varchar", data.getString("salesmanEmailClient"));
              eventDataMap.put("param_3_varchar", salesmanEmail);
              eventDataMap.put("param_4_varchar", customerEmailArray.getString(i));
              eventDataMap.put("param_5_varchar", emailSubject);
              eventDataMap.put("param_1_mediumtext", emailBody);
              
              DbLayer.setEvent(DbLayer.SALESMAN_EVENT_TABLE,
                  ConfigProperties.getProperty("event_sent_email"), eventDataMap);
              
              emailSent++;
              emailSubject = emailMessageArray[0];
              emailBody = emailMessageArray[1];
            }
          }
          
          // Return response to frontend.
          switch(data.getString("salesmanEmailClient")) {
            case "gmail":
              output.put("isApi", true);
              output.put("emailSent", emailSent);
              break;
            
            // mailto sending emails mechanism.
            default:
              output.put("isApi", false);
              output.put("customerEmail", customerEmailArray.getString(0));
              output.put("emailSubject", emailSubject);
              output.put("emailBody", emailBody);
          }
          break;
      }
      
        String res = output.toString();
        response.setCharacterEncoding("utf-8");
        response.setContentType("application/json");
        response.getWriter().write(res);
        response.getWriter().flush();
      } catch(Exception e){
        System.out.println("problem form doPost method: ");
        e.printStackTrace();
      }
  }   
}
