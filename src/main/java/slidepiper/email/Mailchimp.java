package slidepiper.email;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

import org.apache.commons.codec.binary.Base64;
import org.apache.http.client.ClientProtocolException;
import org.json.JSONObject;

public class Mailchimp {

    /**
     * 
     * @param email     The user email.
     * @param firstName The user first name.
     * @param lastName  The user last name.
     * @param password  The user password.
     * @return          The subscribing process response code.
     * @throws ClientProtocolException
     * @throws IOException
     */
    public static int SubscribeUser(String email, String firstName, String lastName, String password)
        throws ClientProtocolException, IOException {

      String endPoint = "https://us13.api.mailchimp.com/3.0/lists/fd9674d4d4/members/";
      String userName = "anystring";
      String apiKey = "d79ca7693fd47f63d1febc7f5e2434a4-us13";
      
      String authString = userName + ":" + apiKey;
      byte[] authEncodingBytes = Base64.encodeBase64(authString.getBytes());
      String authEncodingBytesString = new String(authEncodingBytes);
      
      JSONObject data = new JSONObject();
      JSONObject merge_fields = new JSONObject();
      
      merge_fields.put("FNAME", firstName);
      merge_fields.put("LNAME", lastName);
      merge_fields.put("PASSWORD", password);
      data.put("email_address", email);
      data.put("status", "subscribed");
      data.put("merge_fields", merge_fields);
      
      int responseCode = 0;
      
      try {
        URL url = new URL(endPoint);

        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setDoInput(true);
        connection.setRequestProperty  ("Authorization", "Basic " + authEncodingBytesString);
        connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
        
        OutputStream os = connection.getOutputStream();
        OutputStreamWriter osw = new OutputStreamWriter(os, "UTF-8");
        
        osw.write(data.toString());
        osw.flush();
        osw.close();
        
        responseCode = connection.getResponseCode();
        System.out.println("SP: Mailchimp response code: " + responseCode);
        
        String message = connection.getResponseMessage();
        System.out.println("SP: Mailchimp response message: " + message);
        
        BufferedReader in = new BufferedReader(
            new InputStreamReader(connection.getInputStream()));
        String inputLine;
        StringBuffer response = new StringBuffer();
    
        while ((inputLine = in.readLine()) != null) {
          response.append(inputLine);
        }
        in.close();
        System.out.println("SP: Mailchimp response: " + response.toString());
        
      } catch(Exception e) {
        e.printStackTrace();
      }
      
      return responseCode;
    }
}