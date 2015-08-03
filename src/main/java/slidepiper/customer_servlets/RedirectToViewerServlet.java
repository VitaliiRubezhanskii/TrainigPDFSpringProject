package slidepiper.customer_servlets;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class RedirectToViewerServlet
 * 
 * This servlet redirects to the more complicated url 
 * of the pdf viewer and hides it inside, so the end user does not
 * see it.
 */
@WebServlet("/view/*")
public class RedirectToViewerServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public RedirectToViewerServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 * 
	 * Url should be:
	 * slidepiper.com/view/code
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		/*
		from stackoverflow:
		http://stackoverflow.com/questions/11942341/redirecting-from-a-servlet-without-changing-url

		A solution for redirecting from Java/servlet:
		If it's in the same machine you can use forward:
		request.getRequestDispatcher("pathToNewServletOrJsp").forward(request, response);
		(with the relative path) and the URL will not change, otherwise you have to use sendRedirect:
		response.sendRedirect("pathToNewServletOrJsp");
		and in this case - the URL will change.
		*/
		String docid;
		
		// get the code
		docid = request.getPathInfo().substring(1);
		
		String newurl = "/pdfjs/viewer.html?file=/file/" + docid + "#zoom=page-fit";
		System.out.println("new url to redirect: " + newurl);
		
		// I want the url to remain as-as, so:
		
		request.getRequestDispatcher(newurl).forward(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}
