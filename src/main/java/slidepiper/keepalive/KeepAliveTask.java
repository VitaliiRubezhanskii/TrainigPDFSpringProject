package slidepiper.keepalive;

import slidepiper.config.ConfigProperties;
import slidepiper.dataobjects.*;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.json.JSONObject;

import java.util.TimerTask;

import slidepiper.db.DbLayer;
import slidepiper.email.EmailSender;
import slidepiper.integration.HubSpot;
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
				//if (p.getEstimatedTimeViewed() < 300) 
				//{
							keepalivemsg += ("msgid: " + p.msgId + " sess: " + p.getSessionId() + " esttime: " + p.getEstimatedTimeViewed() + " isdead: " + p.isPacketDead() + " nokeepalivesec: " + p.getNoKeepAliveSeconds());
				//}
				System.out.println(keepalivemsg);

				if (p.isPacketDead())
				{
					System.out.println("dead packet " + p.toString());					
														
					// log last slide event.
					// it's a regular slide view event, only detected in a different way.
					CustomerLogger.LogEvent(p.getMsgId(), "VIEW_SLIDE", 
							Integer.toString(p.getSlideNumber()), 
							Double.toString(p.getEstimatedTimeViewed()+1.5), "LAST_SLIDE", 
							p.getSessionId(), p.getTimezoneOffsetMin(), null, null, null, null, null, null, null, null, null, null);
					
					String salesmanEmail = DbLayer.getSalesmanEmailFromMsgId(p.msgId);
					String customerEmail = DbLayer.getCustomerEmailFromFileLinkHash(p.msgId);
					
		    		Map<String, Object> docSettings = new HashMap<String, Object>();
		    		docSettings = DbLayer.getSalesman(salesmanEmail);
		    		if ((Boolean)docSettings.get("email_report_enabled")
		    		    && ! customerEmail.equals(ConfigProperties.getProperty("test_customer_email"))){
		    			EmailSender.sendReportEmail(p);
		    		}
		    		else {
		    			System.out.println("SP: Didn't send report email");
		    		}
															
					// remove current element in 
					// thread-safe, collection-safe, hash-safe, iterator-safe way.
					iter.remove(); 				
					System.out.println("dead packet " + p.toString() + " LOGGED AND EMAILED - DELETED!");
					
					// Set Timeline event for HubSpot.
					Map<String, Object> userData = DbLayer.getSalesman(salesmanEmail);
					int userId = (int) userData.get("id");
					
          Map<String, String> documentProperties = DbLayer.getFileMetaData(p.getMsgId());
          String documentName = documentProperties.get("fileName");
          
          Long timestamp = DbLayer.getCustomerEventTimstamp(p.getSessionId(), "OPEN_SLIDES", p.getMsgId()).getTime();
          
          JSONObject extraData = null;
          
          String HubSpotAccessToken = DbLayer.getAccessToken(userId, "hubspot");
          if (HubSpotAccessToken != null) {
            HubSpot.setTimelineEvent(HubSpotAccessToken, timestamp, p.getSessionId(), customerEmail, documentName, extraData);
          }
				}			
		}

	}
	
	

}
