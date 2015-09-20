package slidepiper.keepalive;

import slidepiper.dataobjects.*;

import java.util.Iterator;
import java.util.concurrent.ConcurrentHashMap;
import java.util.TimerTask;

import slidepiper.db.DbLayer;
import slidepiper.email.EmailSender;
import slidepiper.logging.CustomerLogger;
import slidepiper.ui_rendering.HtmlRenderer;


// -- this is the class for the keepalive thread
// this thread runs every 3(?) seconds and advances
// the time of each keeplive message by 3 
// when the time gets to 10 the keepalive is considered dead, and we need
// to write the time of the slide viewed to DB.
// -- How to calculate the time?
// We have the time from the server, we add 1.5 and that's roughly the
// time until user closed the presentation. 
// It's between 0-3 sec, so we put 1.5.
// (If it was >3 sec then we'd have another servlet event)
public class KeepAliveTask extends TimerTask {

	@Override
	public void run() {
		// TODO Auto-generated method stub
		ConcurrentHashMap<String, KeepAlivePacket> keepAliveMap = 
				KeepAliveServlet.getKeepAliveMap();
		
		
		
		// loop on all packets and propagate time
		for(KeepAlivePacket p : keepAliveMap.values())
		{
				// pass 3 seconds for each packet.
				p.passSeconds(3);
		}
		
		
				
		// iterator on map, it allows removing.
		Iterator<KeepAlivePacket> iter = keepAliveMap.values().iterator();
		// check for dead packets
		while(iter.hasNext())
		{
				KeepAlivePacket p = iter.next();
				
				String keepalivemsg = "KEEPALIVE PACKET: ";		
				keepalivemsg += ("msgid: " + p.msgId + " sess: " + p.getSessionId() + " esttime: " + p.getEstimatedTimeViewed() + " isdead: " + p.isPacketDead() + " nokeepalivesec: " + p.getNoKeepAliveSeconds());
				System.out.println(keepalivemsg);

				if (p.isPacketDead())
				{
					System.out.println("dead packet " + p.toString() + " LOGGING AND EMAILING ");					
														
					// log last slide event.
					// it's a regular slide view event, only detected in a different way.
					CustomerLogger.LogEvent(p.getMsgId(), "VIEW_SLIDE", 
							Integer.toString(p.getSlideNumber()), 
							Double.toString(p.getEstimatedTimeViewed()+1.5), "LAST_SLIDE", 
							p.getSessionId(), p.getTimezoneOffsetMin());
					
					EmailSender.sendReportEmail(p);
															
					// remove current element in 
					// thread-safe, collection-safe, hash-safe, iterator-safe way.
					iter.remove(); 					
				}			
		}

	}
	
	

}
