package slidepiper.salesman_servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;

import slidepiper.config.ConfigProperties;
import slidepiper.db.DbLayer;

@SuppressWarnings("serial")
@WebServlet("/download-file-links")
public class DownloadFileLinksServlt extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException {
    
    List<String[]> fileLinkList = DbLayer.getFileLinks(
        ConfigProperties.getProperty("default_customer_email"),
        request.getParameter("salesman-email"));
    String[] titleArray = {"File Link", "File Name"};
    fileLinkList.add(0, titleArray);
    
    response.setContentType("text/csv");
    response.setHeader("Content-Disposition", "attachment; filename=\"file-links.csv\"");
    PrintWriter pw = response.getWriter();
    CSVPrinter printer = new CSVPrinter(pw, CSVFormat.DEFAULT);
    for (String[] row: fileLinkList) {     
      printer.printRecord((Object[]) row);
    }
    
    printer.flush(); 
    printer.close();
  }
}
