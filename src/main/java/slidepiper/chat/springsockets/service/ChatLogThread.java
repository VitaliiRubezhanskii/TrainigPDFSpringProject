package slidepiper.chat.springsockets.service;

import slidepiper.logging.CustomerLogger;

// writing to log takes some time, and causes the socket
// to close. so I write in a separate thread.

public class ChatLogThread implements Runnable {

	String chatline;
	String session_id;
	
	   public ChatLogThread(String chatlinenew, String sessidnew) {
	       // store parameter for later user
		   chatline = chatlinenew;
		   session_id = sessidnew;
	   }

	   public void run() {
		   System.out.println("CHATLOGTHREAD: Writing to log in thread. sessid " + session_id + " chatline: " + chatline);
		   CustomerLogger.LogEvent("chatmsgid", "CHAT_MESSAGE", "0", "0",chatline, session_id, 0);
		   System.out.println("CHATLOGTHREAD: Finished writing to log in thread");
	   }
	}

