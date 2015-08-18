package slidepiper.ui_rendering;

import static com.ui4j.api.browser.BrowserFactory.getWebKit;
import com.ui4j.api.browser.Page;
import com.ui4j.api.browser.*;
import com.ui4j.api.dom.*;

public class WebpageToImage {
	    public static void RenderWebpage () {

	    	System.out.println("rendering webpage ");
	        try (Page page = getWebKit().navigate("https://news.ycombinator.com")) {
	        	Document  d =  page.getDocument();

	        	System.out.println("DOCUMENT TOSTRING: ");
	        	System.out.println(d.toString());
	        
	        	System.out.println(d.getBody().toString());
	        		
	                //.queryAll(".title a")
	                //.forEach(e -> {
	                //    System.out.println(e.getText().get());
	                				//});
	        }
	    }
}
