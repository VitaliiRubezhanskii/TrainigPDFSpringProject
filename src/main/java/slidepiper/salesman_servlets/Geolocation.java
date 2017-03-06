package slidepiper.salesman_servlets;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import com.maxmind.geoip2.model.CityResponse;
import com.maxmind.geoip2.record.City;
import com.maxmind.geoip2.record.Country;
import com.maxmind.geoip2.record.Location;
import com.maxmind.geoip2.record.Postal;
import com.maxmind.geoip2.record.Subdivision;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class Geolocation {

  /**
   * Return the client IP from an HTTP request.
   * 
   * @param request An HttpServletRequest object.
   * @return An IP address.
   */
  public static String getIpFromRequest(HttpServletRequest request) {
    return request.getRemoteAddr();
  }
  
  
  /**
   * Get data about an IP address.
   * 
   * @param ip The IP address address.
   * @return Various data points regarding an IP address physical location.
   * @throws IOException
   */
  public static List<String> ipData(String ip) throws IOException {
    URL fileUrl = Geolocation.class.getClassLoader().getResource("GeoLite2-City.mmdb");
    File database = null;
    try {
      database = new File(fileUrl.toURI());
    } catch (URISyntaxException e) {
      e.printStackTrace();
    }

    DatabaseReader reader = new DatabaseReader.Builder(database).build();

    InetAddress ipAddress = InetAddress.getByName(ip);
    List<String> data = new ArrayList<String>();
    
    try {
      CityResponse response = reader.city(ipAddress);
      
      Country country = response.getCountry();
      City city = response.getCity();
      Location location = response.getLocation();
      Subdivision subdivision = response.getMostSpecificSubdivision();
      Postal postal = response.getPostal();
      
      if (null != country.getIsoCode()) {
        data.add(country.getIsoCode());
      } else {
        data.add(null);
      }
      
      if (null != country.getName()) {
        data.add(country.getName());
      } else {
        data.add(null);
      }
      
      if (null != city.getGeoNameId()) {
        data.add(city.getGeoNameId().toString());
      } else {
        data.add(null);
      }
      
      if (null != city.getName()) {
        data.add(city.getName());
      } else {
        data.add(null);
      }
      
      if (null != subdivision.getIsoCode()) {
        data.add(subdivision.getIsoCode());
      } else {
        data.add(null);
      }
      
      if (null != subdivision.getName()) {
        data.add(subdivision.getName());
      } else {
        data.add(null);
      }
      
      if (null != postal.getCode()) {
        data.add(postal.getCode());
      } else {
        data.add(null);
      }      
      
      if (null != location.getLatitude()) {
        data.add(location.getLatitude().toString());
      } else {
        data.add(null);
      }
      
      if (null != location.getLongitude()) {
        data.add(location.getLongitude().toString());
      } else {
        data.add(null);
      }
      
    } catch (GeoIp2Exception e) {
      System.out.println(e.getMessage());
      for (int i = data.size(); i <= 9; i++) {
        data.add(null);
      }
    }
    
    return data;
  }
}
