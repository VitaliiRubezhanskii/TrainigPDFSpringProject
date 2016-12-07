package slidepiper.customer_servlets;
 
import java.io.IOException;

import slidepiper.*;
import slidepiper.config.ConfigProperties;
import slidepiper.constants.Constants;
import slidepiper.db.DbLayer;

import java.io.InputStream;
import java.io.OutputStream;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
 
//// can get parameter with this:
// from here: http://stackoverflow.com/questions/16680433/pdf-js-pdf-file-from-servlet-which-requires-a-variable
@WebServlet("/file/*") //simple name for harmless link
public class DownloadSlidesServlet extends HttpServlet {
 
    // size of byte buffer to send file
    private static final int BUFFER_SIZE = 4096;   
    
    protected void doGet(HttpServletRequest request,
            HttpServletResponse response) throws ServletException, IOException {
        // get upload id from URL's parameters
        //int uploadId = Integer.parseInt(request.getParameter("id"));
    	
//  	  System.out.println("DownloadSlidesServlet doGet");
    	
    	// new way to get parameter, not with get
    	String msgid = request.getPathInfo().substring(1);
    	// now I can access servlet as name/5  where 5 is the parameter!
    	// no ? for get request! this allows to use this with pdfjs.
    	  //System.out.println("parameter to Slides servlet: " + msgid);
    	
    	switch(DbLayer.getFileWhiteListFlag(msgid)) {
    	
			// File does not exist.
			case 1:
				
				// Redirect to SP broken link page.
				response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
				response.setHeader("Location", ConfigProperties.getProperty("file_viewer_broken_link"));
				break;
			
			// File is whitelisted.
			case 3:
				
				// Check if request IP matches IP in ip_whitelist table.
				if (! DbLayer.isIPMatchClientIP(msgid, request.getRemoteAddr())) {
					
					// Redirect to SP ip restricted page. 
					response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
					response.setHeader("Location", ConfigProperties.getProperty("file_viewer_ip_restricted"));
				}
				break;
    	}
    	
        Connection conn = null; // connection to the database
        String slides_id;
        String fileName;
        fileName = "pres.pdf";
        try {
        		Constants.updateConstants();
            // connects to the database
            DriverManager.registerDriver(new com.mysql.jdbc.Driver());
            conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
 
            // queries the database
            //String sql = "SELECT * FROM files_upload WHERE upload_id = ?";
            String sql = "SELECT slides_id FROM msg_info WHERE id = ?";
            PreparedStatement statement = conn.prepareStatement(sql);
            //statement.setInt(1, uploadId);
            statement.setString(1, msgid);
            
            ResultSet result = statement.executeQuery();
            slides_id="UNKNOWN";
            if (result.next()) {
                // gets file name and file blob data
                slides_id = result.getString("slides_id");
                System.out.println("slides id: " + slides_id + " msgid: " + msgid);
            			}

            // make another query for the slides blob
            sql = "SELECT file FROM slides WHERE id = ? AND slides.fk__document_status__status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')";
            statement = conn.prepareStatement(sql);
            //statement.setInt(1, uploadId);
            statement.setString(1, slides_id);
                                 
            result = statement.executeQuery();            
            if (result.next()) {
                // gets file name and file blob data                
//                System.out.println("downloading blob");                                                
                Blob blob = result.getBlob("file");
                InputStream inputStream = blob.getBinaryStream();
                int fileLength = inputStream.available();                 
                System.out.println("fileLength = " + fileLength); 
                ServletContext context = getServletContext(); 
                // sets MIME type for the file download
                String mimeType = context.getMimeType(fileName);
                if (mimeType == null) {        
                    mimeType = "application/octet-stream";
                }              
                 
                // set content properties and header attributes for the response
                response.setHeader("Access-Control-Allow-Origin", "*");
                response.setHeader("Access-Control-Expose-Headers", "Accept-Ranges");
                response.setContentType(mimeType);
                response.setContentLength(fileLength);
                String headerKey = "Content-Disposition";
                String headerValue = String.format("attachment; filename=\"%s\"", fileName);
                response.setHeader(headerKey, headerValue);
 
                // writes the file to the client
                OutputStream outStream = response.getOutputStream();
                 
                byte[] buffer = new byte[BUFFER_SIZE];
                int bytesRead = -1;
                 
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outStream.write(buffer, 0, bytesRead);
                }
                 
                inputStream.close();
                outStream.close();             
            } else {
                // no file found
                response.getWriter().print("File not found for the name: " + slides_id);  
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
            response.getWriter().print("SQL Error: " + ex.getMessage());
        } catch (IOException ex) {
            ex.printStackTrace();
            response.getWriter().print("IO Error: " + ex.getMessage());
        } finally {
            if (conn != null) {
                // closes the database connection
                try {
                    conn.close();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }          
        }
    }
}