package slidepiper.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ConfigProperties {
	
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
		if (null == System.getenv("OPENSHIFT_APP_NAME")
				|| props.getProperty("override_openshift_ev").equals("true")) {
			
			overrideOpenshiftEv = true;
		}
		
		// Create application and web sockets URLs.
		if (key.equals("app_url") || key.equals("websockets_url")) {
			if (overrideOpenshiftEv) {
			
				String appScheme = props.getProperty("app_scheme");
				String appServer = props.getProperty("app_server").replaceAll("/$", "");
				String appPort = props.getProperty("app_port", "80");
				String appContextPath = ("/" + props.getProperty("app_contextpath", ""))
						.replaceAll("/$", "");
				String webSocketsPort = props.getProperty("websockets_port", "80");
				
				props.setProperty("app_url", appScheme + "://" + appServer + ":" + appPort
						+ appContextPath);
				
				props.setProperty("websockets_url", appScheme + "://" + appServer + ":"
						+ webSocketsPort + appContextPath);
			} else {
				
				// OPENSHIFT_APP_SCHEME is a custom Openshift environment variable.
				props.setProperty("app_url", System.getenv("OPENSHIFT_APP_SCHEME") + "://"
						+ System.getenv("OPENSHIFT_APP_DNS").replaceAll("/$", ""));
				
				// OPENSHIFT_WEBSOCKETS_PORT is a custom Openshift environment variable.
				props.setProperty("websockets_url", System.getenv("OPENSHIFT_APP_SCHEME") + "://"
						+ System.getenv("OPENSHIFT_APP_DNS").replaceAll("/$", "") + ":"
						+ System.getenv("OPENSHIFT_WEBSOCKETS_PORT"));
			}
		}
		
		// Create scraper URL.
		if (key.equals("scraper_url")) {
			if (overrideOpenshiftEv) {
				props.setProperty(key, props.getProperty(key).replaceAll("/$", ""));
			} else {
				
				// OPENSHIFT_SCRAPER_URL is a custom Openshift environment variable.
				props.setProperty(key, System.getenv("OPENSHIFT_SCRAPER_URL")
						.replaceAll("/$", ""));
			}
		}
		
		return props.getProperty(key);
	}
}
