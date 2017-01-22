package slidepiper.keepalive;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Arrays;
import java.util.Timer;
// For ConcurrentHashMap
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.slidepiper.model.component.JwtUtils;

import slidepiper.constants.Constants;
import slidepiper.db.DbLayer;

/**
 * Servlet implementation class KeepAliveServlet
 * 
 * gets keepalive calls from the client. every 2-3 seconds I call 
 * this servlet to inform server presentation is still open, and
 * which slide is currently viewed.
 * 
 * This servlet is used to take care of LAST SLIDE VIEWED.
 * For last slide, the only way to write it to DB
 * is by seeing that keepalive calls stopped, and
 * estimating the time it was viewed (not exactly).
 * for other slides, this servlet is NOT needed -
 * the exact time viewed is calculated a sent when customer
 * changes to a new slide.
 * 
 * note: servlet is instantiated as singleton in servlet container.
 * So in principe I have only one of this object.
 * For easier access to the hashmap, I put it as static.
 * Maybe there's a better way to access it.
 
 */
@WebServlet("/KeepAliveServlet")
public class KeepAliveServlet extends HttpServlet {
  private static final Logger log = LoggerFactory.getLogger(KeepAliveServlet.class);
	private static final long serialVersionUID = 1L;
       
	// like hashmap but newer ver. Hashmap is legacy in java.
	// also this should be better synchronized.
	// it has method putIfAbsent - important, as atomic operation.
	static ConcurrentHashMap<String, KeepAlivePacket> keepAliveMap = new ConcurrentHashMap<>();
	
	// get for the map
  public static ConcurrentHashMap<String, KeepAlivePacket> getKeepAliveMap() {
		return keepAliveMap;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	/**
     * @see HttpServlet#HttpServlet()
     */
    public KeepAliveServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

    // this runs the first time the servlet is accessed.
public void init(ServletConfig config) throws ServletException {
		
//	System.out.println("KeepAliveServlet init");
//	System.out.println("KeepAliveServlet init. Starting timertask every X seconds");
		Constants.updateConstants();
		
		KeepAliveTask task = new KeepAliveTask();
		Timer timer = new Timer();
		
		// start in 2 seconds, then every 3sec run the task.
		timer.schedule(task, 2000, 3000);
						
		System.out.println("KeepAliveServlet init done.");
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
		
		//System.out.println("KeepAliveServlet rcvd call.");
		StringBuffer jb = new StringBuffer();
		Constants.updateConstants();
	    String line = null;
	    try {
	    	BufferedReader reader = request.getReader();
	        while ((line = reader.readLine()) != null)
	        	jb.append(line);
	    } catch (Exception e) {
	    	System.out.println("problem in POST req of KeepAliveServlet");
	       }
		  try{			
			  //System.out.println("Keepalive parsing JSON: " + jb.toString());
					JSONObject input = new JSONObject(jb.toString());
					String action = input.getString("action");
					JSONObject output = new JSONObject();
				
					switch (action) 
					{
							case "keepAlive":					
					//				System.out.println("keepalive req sessid" + input.getString("sessionId"));
																
  							  String viewerId = null;
  							  try {
  							    Cookie cookie = Arrays.stream(request.getCookies())
                                        .filter(c -> c.getName().equals("sp.viewer"))
                                        .findFirst()
                                        .orElseThrow(null);
    
                    viewerId = JwtUtils.verify(cookie.getValue())
                                   .getClaim("viewerId").asString();
  							  } catch(NullPointerException e) {
  							    log.error("viewerId is null");
  							  }
                  
									KeepAlivePacket p = new KeepAlivePacket(
											input.getInt("timezone_offset_min"),
											input.getInt("estimatedTimeViewed"), 
											input.getInt("slideNum"),
											input.getString("msgId"),
											input.getString("sessionId"),
											viewerId);										
						//			System.out.println("packet " + p.toString());
									// reset old keepalive packet if any, put the new one.
									
									if (DbLayer.isSessionDead(p.getSessionId()))
									{
												// dead session, do nothing. ignore keepalive
									}
									else
									{
											keepAliveMap.put(p.sessionId,p);
									}
									break;
							default: System.out.println("ERROR. unknown action  in KeepAliveServlet" + action);									

					}

					// send some response (it's not important).
					String res = output.toString();
					response.setCharacterEncoding("utf-8");
			    response.setContentType("application/json");
			    response.setHeader("Access-Control-Allow-Origin", request.getHeader("origin"));
			    response.setHeader("Access-Control-Allow-Credentials", "true");
			    response.getWriter().write(res);
			    response.getWriter().flush();
		  } catch(Exception e){
	    	System.out.println("doPost method error. KeepAliveServlet ");
	    	e.printStackTrace();
		  	}
	}

}
