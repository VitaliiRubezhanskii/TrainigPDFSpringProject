package slidepiper.ui_rendering;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import javax.net.ssl.HttpsURLConnection;

public class BarChartRenderer {
	
			private static final String USER_AGENT = "Mozilla/5.0";
	// get persistent image link to barchart from its session id.
			public static String getBarChartLink(String sessionId)
			{
					String url;
					String imageCaptureUrl;
					String imageUrl="NOT SET. ERROR";
					
				  String appname = System.getenv("OPENSHIFT_APP_NAME");									
					if (appname==null) //running locally
					{
						url = "localhost:8080/sp";				
					}
					else
 				  if (appname.equalsIgnoreCase("slidepipertest"))
				   {
					 url = "http://slidepipertest-slidepiper.rhcloud.com";
				   }
				 else
				 if (appname.equalsIgnoreCase("sp")) 
				 {
					 url = "http://www.slidepiper.com";
				 }
				 else
				 {
					 	url = "CANNOT MAKE LINK";
				 }				
				
					url += ("/viewbarchart.jsp?session_id="+sessionId);
					
					// make the full url for img capture.
					imageCaptureUrl="http://codemongo-spdomain.rhcloud.com/?url=\""+url+"\"";
					try
					{
						
						// based on: 
						// http://www.mkyong.com/java/how-to-send-http-request-getpost-in-java/
							URL obj = new URL(url);					
							HttpURLConnection con = (HttpURLConnection) obj.openConnection();													
							con.setRequestMethod("GET");
							con.setRequestProperty("User-Agent", USER_AGENT);
							int responseCode = con.getResponseCode();
							System.out.println("\nBARCHARTRENDER: Sending 'GET' request to URL : " + imageCaptureUrl);
							System.out.println("Response Code : " + responseCode);
							
							BufferedReader in = new BufferedReader(
							        new InputStreamReader(con.getInputStream()));
							String inputLine;
							StringBuffer response = new StringBuffer();
							while ((inputLine = in.readLine()) != null) {
								response.append(inputLine);
							}
							in.close();
							//print result
							System.out.println("Received image code: " + response.toString());
							
							String imageCode=response.toString().trim();
							
							imageUrl = "http://codemongo-spdomain.rhcloud.com/" + imageCode;
							System.out.println("final url " + imageUrl);
					} catch (Exception ex) {
								System.out.println("exception rendering barchart link");
								ex.printStackTrace();
					}
					
					return imageUrl;
			}
}
