package slidepiper.chat;

import java.io.BufferedReader;

import org.json.JSONObject;

import slidepiper.db.DbLayer;


public class ChatUser {
	
	String username;
	String sessionid;
	int role; // 0 - customer, 1 - salesman.
	
	// role constants
	public static final int CUSTOMER_ROLE = 0;
	public static final int SALESMAN_RULE_ROLE = 0;
	
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getSessionid() {
		return sessionid;
	}
	public void setSessionid(String sessionid) {
		this.sessionid = sessionid;
	}
	public int getRole() {
		return role;
	}
	public void setRole(int role) {
		this.role = role;
	}

	public ChatUser(String sessionid, int role, String username) {
		super();
		this.sessionid = sessionid;
		this.role = role;
		this.username = username;
	}
	
	public String toJSON()
	{					
			JSONObject output = new JSONObject();
			output.put("username", username);
			output.put("sessionid", sessionid);
			output.put("role", role);
			
			return output.toString(); // return JSON string
	}
	
	// init from JSON
	public ChatUser(String JSON)
	{			
			JSONObject json = new JSONObject(JSON);
			username = json.getString("username");					  
			sessionid = json.getString("sessionid");
			role = json.getInt("role");
			//System.out.println("CHATUSER: New Chat User: " + this.toJSON());
	}
}
