package slidepiper.integration;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.oltu.oauth2.client.OAuthClient;
import org.apache.oltu.oauth2.client.URLConnectionClient;
import org.apache.oltu.oauth2.client.request.OAuthClientRequest;
import org.apache.oltu.oauth2.client.response.OAuthJSONAccessTokenResponse;
import org.apache.oltu.oauth2.common.exception.OAuthProblemException;
import org.apache.oltu.oauth2.common.exception.OAuthSystemException;
import org.apache.oltu.oauth2.common.message.types.GrantType;
import org.json.JSONObject;

import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;

@SuppressWarnings("serial")
@WebServlet("/integration/hubspot")
public class HubSpot extends HttpServlet {
  
  /**
   * Production client id: a313b2b6-19ce-48ea-8141-2feb08cc38a0
   * Development client id: 194d882f-f932-4d41-9e0b-4d3b37fbf94b
   */
  private final static String CLIENT_ID = "194d882f-f932-4d41-9e0b-4d3b37fbf94b";
  
  /**
   * Production client secret: 0e7c8403-411b-400e-ab62-747911834f23
   * Development client secret: dec1aaa9-28b4-4b14-b3ea-239bcfcf8942
   */
  private final static String CLIENT_SECRET = "dec1aaa9-28b4-4b14-b3ea-239bcfcf8942";
  
  /**
   * Production app id: 37355
   * Development app id: 37426
   */
  private final static String APP_ID = "37426";
  
  /**
   * Production event type id: 15660
   * Development event type id: 15663
   */
  private final static String EVENT_TYPE_ID = "15663";
  
  
  /**
   * Initialize oAuth connection and set initial access token.
   */
	protected void doGet(HttpServletRequest servletRequest, HttpServletResponse servletResponse)
			throws ServletException, IOException {

    OAuthClientRequest oAuthRequest = null;
    String redirectUri = ConfigProperties.getProperty("app_url") + "/integration/hubspot";
    
	  if (null == servletRequest.getParameter("code")) {
  		try {
  		  oAuthRequest = OAuthClientRequest
  				.authorizationLocation("https://app.hubspot.com/oauth/authorize")
  				.setClientId(CLIENT_ID)
  				.setRedirectURI(redirectUri)
  				.setScope("timeline")
  				.buildQueryMessage();
  		} catch (OAuthSystemException e) {
  			e.printStackTrace();
  		}
  		
  		servletResponse.sendRedirect(oAuthRequest.getLocationUri());
	  } else {
	    try {
	      oAuthRequest = OAuthClientRequest
          .tokenLocation("https://api.hubapi.com/oauth/v1/token")
          .setGrantType(GrantType.AUTHORIZATION_CODE)
          .setClientId(CLIENT_ID)
          .setClientSecret(CLIENT_SECRET)
          .setRedirectURI(redirectUri)
          .setCode(servletRequest.getParameter("code"))
          .buildQueryMessage();
      } catch (OAuthSystemException e) {
        e.printStackTrace();
      }
	    
      OAuthClient oAuthClient = new OAuthClient(new URLConnectionClient());
      try {
        OAuthJSONAccessTokenResponse oAuthResponse = oAuthClient.accessToken(oAuthRequest);
        
        byte[] emailBase64 = null;
        Cookie[] cookies = servletRequest.getCookies();
        if (cookies != null) {
         for (Cookie cookie : cookies) {
           if (cookie.getName().equals("SalesmanEmailBase64")) {
               emailBase64 = Base64.getDecoder().decode(cookie.getValue());
            }
          }
        }
        String email = new String(emailBase64, StandardCharsets.UTF_8);
        Map<String, Object> salesMan = DbLayer.getSalesman(email);
        int userId = (int) salesMan.get("id");
        
        setAccessToken(userId, oAuthResponse, redirectUri);
      } catch (OAuthSystemException | OAuthProblemException e) {
        e.printStackTrace();
      }
      
      servletResponse.sendRedirect(ConfigProperties.getProperty("app_url") + "/dashboard.html");
	  }
	}
	
	
	/**
	 * Set access token.
	 */
	private static void setAccessToken(int userId, OAuthJSONAccessTokenResponse oAuthResponse, String redirectUri) {
	  String accessToken = oAuthResponse.getAccessToken();
    Long expiresIn = oAuthResponse.getExpiresIn();
    String refreshToken = oAuthResponse.getRefreshToken();
    
    DbLayer.setAccessToken(userId, "hubspot", accessToken, expiresIn, refreshToken, redirectUri);
  }
	
	
	/**
	 * Get access token based on refresh token.
	 */
  public static String getNewAccessToken(int userId, String refreshToken, String redirectUri) {
    OAuthClientRequest oAuthRequest = null;
    String accessToken = null;
	  
	  try {
	    oAuthRequest = OAuthClientRequest
        .tokenLocation("https://api.hubapi.com/oauth/v1/token")
        .setGrantType(GrantType.REFRESH_TOKEN)
        .setClientId(CLIENT_ID)
        .setClientSecret(CLIENT_SECRET)
        .setRedirectURI(redirectUri)
        .setRefreshToken(refreshToken)
        .buildQueryMessage();
    } catch (OAuthSystemException e) {
      e.printStackTrace();
    }
	  
	  OAuthClient oAuthClient = new OAuthClient(new URLConnectionClient());
    try {
      OAuthJSONAccessTokenResponse oAuthResponse = oAuthClient.accessToken(oAuthRequest);
      setAccessToken(userId, oAuthResponse, redirectUri);
      accessToken = oAuthResponse.getAccessToken();
    } catch (OAuthSystemException | OAuthProblemException e) {
      e.printStackTrace();
    }

	  return accessToken;
	}
	
  
  /**
   * Set a Timeline event in HubSpot.
   */
	public static void setTimelineEvent(String accessToken, Long timestamp,
	    String sessionId, String customerEmail, String documentName,
	    JSONObject extraData) {
	  
	  HttpClient httpClient = HttpClientBuilder.create().build();
	  HttpPut putRequest = new HttpPut("https://api.hubapi.com/integrations/v1/" + APP_ID + "/timeline/event");
	  putRequest.addHeader("Authorization", "Bearer " + accessToken);
	  putRequest.addHeader("Content-Type", "application/json");
	  
    JSONObject data = new JSONObject();
    data.put("documentName", documentName);
    data.put("email", customerEmail);
    data.put("eventTypeId", EVENT_TYPE_ID);
    data.put("id", sessionId);
    data.put("extraData", extraData);
    data.put("timestamp", timestamp);
    
    StringEntity se = null;
    try {
      se = new StringEntity(data.toString());
    } catch (UnsupportedEncodingException e) {
      e.printStackTrace();
    }
    putRequest.setEntity(se);
    
    try {
      HttpResponse response = httpClient.execute(putRequest);
      
      int responseCode = response.getStatusLine().getStatusCode();
      String responseMessage = response.getStatusLine().getReasonPhrase();
      System.out.println("SP HubSpot: " + responseCode + ", " + responseMessage);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
