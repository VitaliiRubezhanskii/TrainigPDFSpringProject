
package springsockets.service;

import java.io.IOException;
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
  private Map<WebSocketSession, String> nickNames = new ConcurrentHashMap<WebSocketSession, String>();
  
  public void registerOpenConnection(WebSocketSession session) {
	  System.out.println("WEBSOCKETS: register open connection");
    conns.add(session);
  }
  
  public void registerCloseConnection(WebSocketSession session) {
	  System.out.println("WEBSOCKETS: register close connection");
    String nick = nickNames.get(session);
    conns.remove(session);
    nickNames.remove(session);
    if (nick!= null) {
      String messageToSend = "{\"removeUser\":\"" + nick + "\"}";
      for (WebSocketSession sock : conns) {
        try {
        	System.out.println("WEBSOCKETS: sending message ");
          sock.sendMessage(new TextMessage(messageToSend));
        } catch (IOException e) {
          System.out.println("IO exception when sending remove user message");
        }
      }
    }    
  }
  
  public void processMessage(WebSocketSession session, String message) {
	  System.out.println("WEBSOCKETS: process msg ");
    if (!nickNames.containsKey(session)) {
      //No nickname has been assigned by now
      //the first message is the nickname
      //escape the " character first
      message = message.replace("\"", "\\\"");
      
      //broadcast all the nicknames to him
      for (String nick : nickNames.values()) {
        try {
          session.sendMessage(new TextMessage("{\"addUser\":\"" + nick + "\"}"));
        } catch (IOException e) {
          System.out.println("Error when sending addUser message");          
        }
      }
      
      //Register the nickname with the 
      nickNames.put(session, message);
      System.out.println("WEBSOCKETS: registered nickname ");
      
      //broadcast him to everyone now
      String messageToSend = "{\"addUser\":\"" + message + "\"}";
      for (WebSocketSession sock : conns) {
        try {
        	System.out.println("WEBSOCKETS: sending message after reg nickname. msg: " + messageToSend);
          sock.sendMessage(new TextMessage(messageToSend));
        } catch (IOException e) {
          System.out.println("WEBSOCKETS ERROR - Error when sending broadcast addUser message");
        }
      }
    } else {
      //Broadcast the message
      String messageToSend = "{\"nickname\":\"" + nickNames.get(session)
          + "\", \"message\":\"" + message.replace("\"", "\\\"") +"\"}";
      for (WebSocketSession sock : conns) {
        try {
        	System.out.println("WEBSOCKETS: broadcasting msg " + messageToSend);
          sock.sendMessage(new TextMessage(messageToSend));
        } catch (IOException e) {
          System.out.println("Error when sending message message");
        }
      }
    }
  }

}
