package slidepiper.chat;


import java.io.*;
import java.util.ArrayList;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;
import org.springframework.web.socket.TextMessage;

import slidepiper.constants.Constants;
import slidepiper.dataobjects.Customer;
import slidepiper.dataobjects.HistoryItem;
import slidepiper.dataobjects.Presentation;
import slidepiper.db.DbLayer;
import slidepiper.logging.CustomerLogger;

// mostly for chat history.
@WebServlet("/ChatServlet")
public class ChatServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ChatServlet() {
        super();
        // TODO Auto-generated constructor stub
    }
    

	public void init(ServletConfig config) throws ServletException {
			System.out.println("Init ChatServlet");
			DbLayer.init();				
	}
		


	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
			}
	
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub

		//System.out.println("DOPOST CHATSERVLET");

		StringBuffer jb = new StringBuffer();
		DbLayer.init();
		//System.out.println("post req");
	    String line = null;
	    try {
	    	BufferedReader reader = request.getReader();
	        while ((line = reader.readLine()) != null)
	        	jb.append(line);
	    } catch (Exception e) {
	    	System.out.println("problem here! doGet chatservlet");
	    }
	    
	    //System.out.println("chatservlet parameters received: " +jb.toString());
	    
	    try{			
			JSONObject input = new JSONObject(jb.toString());
			String action = input.getString("action");
			JSONObject output = new JSONObject();
			
			String historyHtml = "";
						
			String sessid;
			
			switch(action) {
				//-------------------------------------------
					case "getChatMessages":
						System.out.println("getchat msgs (history)");																					
						sessid = input.getString("session_id");				
						
						// now we need to broadcast all the previous messages			 					
			      for (String msg : DbLayer.getChatMessages(sessid))
			      		{
			    	    //System.out.println("Analyzing old message: " + msg);
			    	  	//String oldmsg = (msg.substring(msg.lastIndexOf(":") + 1));
			    	    String oldmsg = msg;
			    	  	//System.out.println("1");
			    	  	// Remove stuff from string
			    	  	oldmsg = oldmsg.replace("</i>", "");
			    	  	oldmsg = oldmsg.replace("<i>", "");
			    	  	System.out.println("2");
			    	  	for(int i=1; i<40; i++)
			    	  			{ //remove all slide
			    	  			oldmsg = oldmsg.replace("[slide #"+i+"]", "");
			    	  			}    	  	
			    	  	//System.out.println("3");
			    	  	
								String[] parts = oldmsg.split(":");
								String part1 = parts[0]; // username 
								String part2 = parts[1]; // msg
								//System.out.println("4");
								
								//System.out.println("Showing old message: " + part1 + " : " + part2);
								
								historyHtml += (part1 + ": " + part2 + "<BR>");
			      		}

						break;
						//-------------------------------
					case "addChatMessage":
																											
						sessid = input.getString("session_id");				
						String msgtext = input.getString("msgtext");						
						CustomerLogger.LogEvent("chatmsgid", "CHAT_MESSAGE", "1", "1",msgtext, sessid, 0);
						System.out.println("addchat message using ajax (no socket): msg " + msgtext + " sess id " + sessid );
						
						break;

						default: System.out.println("unknown param to ChatServlet: " + action );
				}
			
				output.put("historyHtml", historyHtml);
				String res = output.toString();
				response.setCharacterEncoding("utf-8");
		    response.setContentType("application/json");
		    response.getWriter().write(res);
		    response.getWriter().flush();
	    } catch(Exception e){
	    	System.out.println("problem form doPost method ChatServlet: ");
	    	e.printStackTrace();
	    	}

	}

}
