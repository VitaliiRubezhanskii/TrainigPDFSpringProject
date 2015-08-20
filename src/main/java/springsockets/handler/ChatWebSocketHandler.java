
package springsockets.handler;

import springsockets.service.ChatService;






import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;


public class ChatWebSocketHandler extends TextWebSocketHandler {
  
  @Autowired
  private ChatService chatService;
  
  @Override
  public void afterConnectionEstablished(WebSocketSession session) throws Exception {
	  System.out.println("WEBSOCKETS: new connection established");    
    chatService.registerOpenConnection(session);
  }
  
  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
	  System.out.println("WEBSOCKETS: afterconnectionclosed");
    chatService.registerCloseConnection(session);
    
  }
  
  @Override
  public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
	  System.out.println("WEBSOCKETS: handle transport error ");
    chatService.registerCloseConnection(session);
    
  }
  
  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {	  
    System.out.println("WEBSOCKETS: New message: " + message.getPayload());
    chatService.processMessage(session, message.getPayload());
  }

}
