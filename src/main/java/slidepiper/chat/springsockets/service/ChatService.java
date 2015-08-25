
package slidepiper.chat.springsockets.service;

import java.io.IOException;

import slidepiper.chat.*;
import slidepiper.logging.CustomerLogger;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Service
public class ChatService {
  
  private Set<WebSocketSession> conns = java.util.Collections.synchronizedSet(new HashSet<WebSocketSession>());
  
  //private Map<WebSocketSession, String> nickNames = new ConcurrentHashMap<WebSocketSession, String>();
  
  private Map<WebSocketSession, ChatUser> users = new ConcurrentHashMap<WebSocketSession, ChatUser>();
  
  public void registerOpenConnection(WebSocketSession session) {
	  System.out.println("WEBSOCKETS: OPENING connection.");
    conns.add(session);
  }
  
  public void registerCloseConnection(WebSocketSession session) {
	  System.out.println("WEBSOCKETS: CLOSING connection.");
    ChatUser user = users.get(session);
    conns.remove(session);
    users.remove(session);
    if (user!= null) {
      String messageToSend = "{\"removeUser\":" + user.toJSON() + "}";
      for (WebSocketSession sock : conns) {
        try {
        	System.out.println("WEBSOCKETS: sending message " + messageToSend);
          sock.sendMessage(new TextMessage(messageToSend));
        } catch (IOException e) {
          System.out.println("IO exception when sending remove user message");
                }
         }
        }    
  }
  
  public void processMessage(WebSocketSession session, String message) {
	  //System.out.println("WEBSOCKETS: process msg ");
    if (!users.containsKey(session)) {    	
    	// init from JSON.
    	ChatUser newUser = new ChatUser(message);
      //No nickname has been assigned by now
      //the first message is the nickname
      //escape the " character first
    	// need to put in first message nickname + session id.
    	// and then when broadcasting do it only to the right session ids.
      //message = message.replace("\"", "\\\"");      

      //broadcast all the nicknames to him
      for (ChatUser user : users.values()) {
    	  
    	  //need to check if current user is in same session
    	  if (user.getSessionid().equalsIgnoreCase(newUser.getSessionid())) 
    	  		{
    		  	  System.out.println("WEBSOCKETS: Found matching sessionid " + user.getSessionid() + " for user " + user.getUsername() + " and user " +newUser.getSessionid() + " broadcasting new user message." );
			        try {        	
			          session.sendMessage(new TextMessage("{\"addUser\":" + user.toJSON() + "}"));
			        } catch (IOException e) {
			          System.out.println("Error when sending addUser message");
			        		}
    	  		}
            }
    
      System.out.println("WEBSOCKETS: New socket user: " + newUser.toJSON());
      users.put(session, newUser);
      //System.out.println("WEBSOCKETS: registered new user. ");

   
      //broadcast him to everyone now
      String messageToSend = "{\"addUser\":" + newUser.toJSON() + "}";
      int broadcastmatches = 0;
      for (WebSocketSession sock : conns) {    	  
    	  // get user for this session.
    	  ChatUser user = users.get(sock);
    	  	// check if this user is in same session.
    	  //need to check if current user is in same session
    	  if (user.getSessionid().equalsIgnoreCase(newUser.getSessionid())) 
    	  		{
    		  	broadcastmatches++;
  	 	  	  //System.out.println("WEBSOCKETS: Found matching sessionid " + user.getSessionid() + " for user " + user.getUsername() + " and user " +newUser.getSessionid() + " broadcasting new user message." );
			        try {        	
			        	//System.out.println("WEBSOCKETS: broadcasting new user to everybody in session: sending adduser msg: " + messageToSend);
			          sock.sendMessage(new TextMessage(messageToSend));
			        } catch (IOException e) {
			          System.out.println("WEBSOCKETS ERROR - Error when sending broadcast addUser message");
			        		}
    	  } //if
     }//for
      		System.out.println("WEBSOCKETS: Broadcasted from "+newUser.getUsername()+  " to " + broadcastmatches + " users.");
   }else           
      // else to if sesssion is not registered.
      // this runs if user is already registered in session.        
    // this is a regular message, send it to session users.
      	{	   
      //Broadcast the message
	   // just send a message string from this user.
      String messageToSend = "{\"message\": {\"user\":" + users.get(session).toJSON()
          + ", \"messagetext\":\"" + message.replace("\"", "\\\"") +"\"} }";
      
     	if (message.contains("Changed to slide #"))
		   	{
     				String[] parts = message.split("#");
     				String part1 = parts[0]; // changed to slide 
     				String part2 = parts[1]; // slide num
     				int slidenum = Integer.parseInt(part2);
     				users.get(session).setCurrentSlide(slidenum);
     				System.out.println("WEBSOCKETS: found slidechange msg for user " + users.get(session).getUsername() +" slidenum " + slidenum);     				
		   	}
      else // it's not slidechange msg - just send it
		    {		      
		      String slideStr = "[slide #" + users.get(session).getCurrentSlide() + "] ";
		      
		      // no slide info for salesman messages.
		      if (users.get(session).getRole() ==ChatUser.SALESMAN_ROLE)
		      			{
		    	  			slideStr = "";
		      			}
		      
		      // NOTICE: msg here is WRONG
		      // timezone offset is WRONG
		      // If I need these in the future, NEED TO FIX.   
		      CustomerLogger.LogEvent("chatmsgid", "CHAT_MESSAGE", "", "","<i>"+ users.get(session).getUsername() + "</i>: " +slideStr + message, users.get(session).getSessionid(), 0);
		   	}
      int broadcastnum=0;
      for (WebSocketSession sock : conns) {
    	  ChatUser user = users.get(sock); // user for this socket.
    	  
    	  if (user.getSessionid().equalsIgnoreCase(users.get(session).getSessionid()))
    	       {
    		  broadcastnum++;
			        try {
			        	//System.out.println("WEBSOCKETS: broadcasting msg " + messageToSend);
			          sock.sendMessage(new TextMessage(messageToSend));
			        } catch (IOException e) {
			          System.out.println("WEBOSCKETS: Error when sending message " + messageToSend);
			        		}
    	       }    	  
      		}
      System.out.println("WEBSOCKETS: Broadcasted msg " + messageToSend + " to " + broadcastnum + " users.");      
    }
  }

}
