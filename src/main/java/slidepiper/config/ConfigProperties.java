package slidepiper.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import slidepiper.db.DbLayer;

public class ConfigProperties {
  
  // This constant is declared because the value of the URL pattern
  // attribute of the WebServlet annotation must be a constant expression.
  public static final String FILE_VIEWER_PATH = "/view";

  /*
   *  Get the config.properties file properties.
   *  
   *  @return config.properties file in a key/value (Properties type) form.
   */
  private Properties getProperties() {
    InputStream input = null;
    Properties configProperties = new Properties();

    try {
      input = getClass().getClassLoader().getResourceAsStream("config.properties");
      configProperties.load(input);

    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      if (null != input) {
        try {
          input.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }

    return configProperties;
  }

  /*
   *  Get a sanitized value of a property (from config.properties) given a property key.
   *  
   *  Since getClass() cannot be invoked within a static method, I created the following function.
   * 
   *  @param key A config.properties file property key.
   *  @return config.properties file in a key/value (Properties type) form.
   */
  public static String getProperty(String key) {
    ConfigProperties configProps = new ConfigProperties();
    Properties props = configProps.getProperties();

    boolean overrideOpenshiftEv = false;
    if (null == System.getProperty("OPENSHIFT_CUSTOM_APP_SUBDOMAIN")
        || props.getProperty("override_openshift_ev").equals("true")) {

      overrideOpenshiftEv = true;  
    }

    // Create application and web sockets URLs.
    if (key.equals("app_url") || key.equals("websockets_url")) {
      if (overrideOpenshiftEv) {
        String appScheme = props.getProperty("app_scheme");
        String appHost = (null != props.getProperty("app_alias")) 
            ? props.getProperty("app_alias").replaceAll("/$", "")
            : props.getProperty("app_server").replaceAll("/$", "");
        String appPort = props.getProperty("app_port", "80");
        String appContextPath = ("/" + props.getProperty("app_contextpath", ""))
            .replaceAll("/$", "");
        String webSocketsPort = props.getProperty("websockets_port", "80");

        props.setProperty("app_url", appScheme + "://" + appHost + ":" + appPort
            + appContextPath);

        props.setProperty("websockets_url", appScheme + "://" + appHost + ":"
            + webSocketsPort + appContextPath);
      } else {
        
        // OPENSHIFT_CUSTOM_<> are custom Openshift environment variables.
        String openshiftHost = null;
        if (null != System.getProperty("OPENSHIFT_CUSTOM_APP_DOMAIN")) {
          openshiftHost = System.getProperty("OPENSHIFT_CUSTOM_APP_DOMAIN");
          
          if (null != System.getProperty("OPENSHIFT_CUSTOM_APP_SUBDOMAIN")) {
            openshiftHost = System.getProperty("OPENSHIFT_CUSTOM_APP_SUBDOMAIN") + "." + openshiftHost;
          }
        } else {
          openshiftHost = System.getProperty("OPENSHIFT_APP_DNS").replaceAll("/$", "");
        }
        
        // OPENSHIFT_APP_SCHEME is a custom Openshift environment variable.
        props.setProperty("app_url", System.getProperty("OPENSHIFT_APP_SCHEME") + "://" + openshiftHost);

        // OPENSHIFT_WEBSOCKETS_PORT is a custom Openshift environment variable.
        props.setProperty("websockets_url", System.getProperty("OPENSHIFT_APP_SCHEME") + "://"
            + openshiftHost + ":" + System.getProperty("OPENSHIFT_WEBSOCKETS_PORT"));
      }
    }
    
    // Create context path.
    if (key.equals("app_contextpath")) {
      if (overrideOpenshiftEv) {
         
        // Since app_contextpath is an optional property, we need to check if it exists.
        if (null != props.getProperty(key)) {
           props.setProperty(key, props.getProperty(key).replaceAll("/$", "") + "/");
        } else {
          props.setProperty(key, "");
        }
      } else {
        
        // OPENSHIFT_APP_CONTEXTPATH is a custom Openshift environment variable.
        // Since OPENSHIFT_APP_CONTEXTPATH is an optional variable, we need to check if it exists.
        if (null != System.getProperty("OPENSHIFT_APP_CONTEXTPATH")) {
          props.setProperty(key, System.getProperty("OPENSHIFT_APP_CONTEXTPATH")
              .replaceAll("/$", "") + "/");
        } else {
          props.setProperty(key, "");
        }
      }
    }
    
    // Create scraper URL.
    if (key.equals("scraper_url")) {
      if (overrideOpenshiftEv) {
        props.setProperty(key, props.getProperty(key).replaceAll("/$", ""));
      } else {

        // OPENSHIFT_SCRAPER_URL is a custom Openshift environment variable.
        props.setProperty(key, System.getProperty("OPENSHIFT_SCRAPER_URL").replaceAll("/$", ""));
      }
    }

    return props.getProperty(key);
  }
  
  
  /**
   * Get a property value based upon the config.properties file and the salesman email.
   * The property key may not be predefined in the config.properties file.
   * 
   * @param key A property key.
   * @param salesmanEmail The salesman email address.
   * 
   * @return THe property value.
   */
  public static String getProperty(String key, String salesmanEmail) {
    ConfigProperties configProps = new ConfigProperties();
    Properties props = configProps.getProperties();

    boolean overrideOpenshiftEv = false;
    if (null == System.getProperty("OPENSHIFT_CUSTOM_APP_SUBDOMAIN")
        || props.getProperty("override_openshift_ev").equals("true")) {

      overrideOpenshiftEv = true;  
    }
    
    if (key.equals("viewer_url")) {
      if (overrideOpenshiftEv) {
        String appScheme = props.getProperty("app_scheme");
        String appHost = (null != props.getProperty("app_alias")) 
            ? props.getProperty("app_alias").replaceAll("/$", "")
            : props.getProperty("app_server").replaceAll("/$", "");
        String appPort = props.getProperty("app_port", "80");
        String appContextPath = ("/" + props.getProperty("app_contextpath", ""))
            .replaceAll("/$", "");

        props.setProperty("app_url", appScheme + "://" + appHost + ":" + appPort
            + appContextPath);
        
        if (key.equals("viewer_url")) {
          
          if (null != DbLayer.getSalesman(salesmanEmail).get("subdomain")) {
        	String subdomain = DbLayer.getSalesman(salesmanEmail).get("subdomain").toString();
            props.setProperty("viewer_url",
                appScheme + "://" 
                + subdomain.replaceAll("\\.$", "") + "."
                + appHost + ":" + appPort + appContextPath);
          } else {
            props.setProperty("viewer_url", props.getProperty("app_url"));
          }
        }
      } else {
        
        // OPENSHIFT_CUSTOM_<> are custom Openshift environment variables.
        String openshiftHost = null;
        String openshiftDomain = null;
        if (null != System.getProperty("OPENSHIFT_CUSTOM_APP_DOMAIN")) {
          openshiftHost = openshiftDomain = System.getProperty("OPENSHIFT_CUSTOM_APP_DOMAIN");
          
          if (null != System.getProperty("OPENSHIFT_CUSTOM_APP_SUBDOMAIN")) {
            openshiftHost = System.getProperty("OPENSHIFT_CUSTOM_APP_SUBDOMAIN") + "." + openshiftHost;
          }
        } else {
          openshiftHost = openshiftDomain = System.getProperty("OPENSHIFT_APP_DNS").replaceAll("/$", "");
        }
        
        // OPENSHIFT_APP_SCHEME is a custom Openshift environment variable.
        props.setProperty("app_url", System.getProperty("OPENSHIFT_APP_SCHEME") + "://" + openshiftHost);
        
        if (key.equals("viewer_url")) {
          if (null != DbLayer.getSalesman(salesmanEmail).get("subdomain")) {
            String subdomain = DbLayer.getSalesman(salesmanEmail).get("subdomain").toString();
            props.setProperty("viewer_url",
                System.getProperty("OPENSHIFT_APP_SCHEME") + "://" 
                + subdomain.replaceAll("\\.$", "") + "."
                + openshiftDomain);
          } else {
            props.setProperty("viewer_url", props.getProperty("app_url"));
          }
        }
      }
    }
        
    return props.getProperty(key);
  }
}
