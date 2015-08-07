package slidepiper.salesman_servlets;

import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import slidepiper.*;
import slidepiper.constants.Constants;
import slidepiper.dataobjects.AlertData;
import slidepiper.dataobjects.HistoryItem;
import slidepiper.dataobjects.SlideView;
import slidepiper.db.DbLayer;

/**
 * Servlet implementation class ReportsServlet
 */
@WebServlet("/ReportsServlet")
public class ReportsServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ReportsServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

    public void init(ServletConfig config) throws ServletException {
		
			Constants.updateConstants();
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
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException 
	{		
		//System.out.println("doPost ReportsServlet");
		StringBuffer jb = new StringBuffer();
		Constants.updateConstants();
		//System.out.println("post req");
	    String line = null;
	    try {
	    	BufferedReader reader = request.getReader();
	        while ((line = reader.readLine()) != null)
	        	jb.append(line);
	    } catch (Exception e) {
	    	System.out.println("problem here!");
	       }
		  try{			
					JSONObject input = new JSONObject(jb.toString());
					String action = input.getString("action");
					JSONObject output = new JSONObject();
				
					switch (action) 
					{
							case "getAlerts":					
									//System.out.println("calling getAlerts with email " + input.getString("email"));
									ArrayList<AlertData> alerts = DbLayer.getAlerts(input.getString("email"));					
									output.put("alerts", alerts);
									break;
							case "getHistory":					
								System.out.println("calling getHistory with email " + input.getString("email"));
								ArrayList<HistoryItem> his = DbLayer.getHistory(input.getString("email"));					
								output.put("history",his);
								break;
							case "getSessionsByMsgId":					
								//System.out.println("calling getSessionsByMsgId with msgid " + input.getString("msgid"));
								ArrayList<String> sessions = DbLayer.getSessionsByMsgId(input.getString("msgid"));					
								output.put("sessions",sessions);
								break;																				
							case "getSlideViews":
									//	System.out.println("calling get slide views");
										ArrayList<SlideView> slideviews = DbLayer.getSlideViews(input.getString("sessionId"));
										//for(SlideView sv : slideviews)
										//{	
												//System.out.println("Slideview: num " + sv.getSlideNum() + " time " + sv.getTimeViewed());
										//}
										output.put("slideviews", slideviews);
									break;
							case "getQuestions":
								//System.out.println("calling getQ");
								ArrayList<String> qs = DbLayer.getQuestions(input.getString("sessionId"));
								output.put("questions", qs);
							break;
							case "setDone":
								System.out.println("calling setDone for sessid " + input.getString("sessionId"));
								// set done for this session id.
								// will disappear from recommendations.
								DbLayer.setDone(input.getString("sessionId"));
							break;
							default: System.out.println("ERROR. unknown action " + action);
					}
					
					String res = output.toString();
					response.setCharacterEncoding("utf-8");
			    response.setContentType("application/json");
			    response.getWriter().write(res);
			    response.getWriter().flush();
		  } catch(Exception e){
		    	System.out.println("problem form doPost method: ");
		    	e.printStackTrace();
		    }
//		  System.out.println("doPost ReportsServlet done.");
	}

}
