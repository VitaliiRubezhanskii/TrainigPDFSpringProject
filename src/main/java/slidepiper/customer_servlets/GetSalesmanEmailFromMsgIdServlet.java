package slidepiper.customer_servlets;

import java.io.BufferedReader;

import java.io.IOException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import slidepiper.*;
import slidepiper.constants.Constants;
import slidepiper.dataobjects.AlertData;
import slidepiper.dataobjects.SlideView;
import slidepiper.db.DbLayer;

/**
 * Servlet implementation class ReportsServlet
 */
@WebServlet("/GetSalesmanEmailFromMsgIdServlet")
public class GetSalesmanEmailFromMsgIdServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetSalesmanEmailFromMsgIdServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

    public void init(ServletConfig config) throws ServletException {
		
			Constants.updateConstants();
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
		StringBuffer jb = new StringBuffer();
		Constants.updateConstants();
		System.out.println("get sm email from msgid servlet");
	    String line = null;
	    try {
	    	BufferedReader reader = request.getReader();
	        while ((line = reader.readLine()) != null)
	        	jb.append(line);
	    } catch (Exception e) {
	    	System.out.println("problem here! get sm email from docid svlet");
	       }
		  try{			
					JSONObject input = new JSONObject(jb.toString());
					String action = input.getString("action");
					JSONObject output = new JSONObject();
				
					switch (action) 
					{
							case "getSalesmanEmail":					
									//System.out.println("calling getAlerts with email " + input.getString("email"));
									String smemail = DbLayer.getSalesmanEmailFromMsgId(input.getString("msgid"));					
									output.put("salesman_email", smemail);
									System.out.println("found salesman email " + smemail + " for msgid " + input.getString("msgid"));
									break;
							default: System.out.println("ERROR. unknown action " + action);
					}
					
					String res = output.toString();
					response.setCharacterEncoding("utf-8");
			    response.setContentType("application/json");
			    response.getWriter().write(res);
			    response.getWriter().flush();
		  } catch(Exception e){
		    	System.out.println("problem dopost in getsalesmanemailfromdocid");
		    	e.printStackTrace();
		    }
	}

}
