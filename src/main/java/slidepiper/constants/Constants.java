package slidepiper.constants;

import slidepiper.config.ConfigProperties;

public class Constants {	
		  public static Boolean constantsSet = false;
		  public static String MYSQL_USERNAME = System.getProperty("OPENSHIFT_MYSQL_DB_USERNAME");
		  public static String MYSQL_PASSWORD = System.getProperty("OPENSHIFT_MYSQL_DB_PASSWORD");
		  public static String MYSQL_DATABASE_HOST = System.getProperty("OPENSHIFT_MYSQL_DB_HOST");
		  public static String MYSQL_DATABASE_PORT = System.getProperty("OPENSHIFT_MYSQL_DB_PORT");
		  public static final String MYSQL_DATABASE_NAME = "picascrafxzhbcmd";
		  
		  public static String dbUser = MYSQL_USERNAME; //"adminS16x82l";
		  public static String dbPass = MYSQL_PASSWORD; //"CdikJ1eZlpDy";
		  //public static final String dbURL = "jdbc:mysql://127.0.0.1:3307/picascrafxzhbcmd";		  
		  public static String dbURL = 
				  "jdbc:mysql://" + MYSQL_DATABASE_HOST + ":" + 
		  MYSQL_DATABASE_PORT + "/" + 
						  MYSQL_DATABASE_NAME
						  + "?user= " + MYSQL_USERNAME + "&password" + MYSQL_PASSWORD + "&useUnicode=true&characterEncoding=UTF-8&useSSL=false";
		  
		  public static void updateConstants()
		  {	
			  // set only at first time.
			  if (constantsSet == false)
			  {
				   constantsSet = true;
					 if (MYSQL_DATABASE_PORT==null) // no openshift				  
					  {				  
						  // for local work - with slidepipertest in openshift
						  //dbUser = "adminS16x82l";
						  //dbPass = "CdikJ1eZlpDy";
						  
						  // for sp in openshift
						  //dbUser = "adminzQQA9hc";
						  //dbPass = "P6Qmj1B_lkRi";
						  
						  
						  String dbHost = ConfigProperties.getProperty("mysql_host").replaceAll("/$", "");
						  String dbPort = ConfigProperties.getProperty("mysql_port").replaceAll("/$", "");
						  dbUser = ConfigProperties.getProperty("mysql_user");
     					  dbPass = ConfigProperties.getProperty("mysql_password");
     					  String dbDatabase = ConfigProperties.getProperty("mysql_database");
						 
     					  dbURL = "jdbc:mysql://" + dbHost + ":" + dbPort + "/" + dbDatabase + "?useSSL=false";
					  }
					 else // using openshift:
					 {
						 	System.out.println("Initializing constants on OpenShift");
						  System.out.println("Constants: mysql user " + dbUser + " pw " + dbPass + " url " + dbURL);
						  System.out.println("Env variable: OPENSHIFT_APP_NAME" + System.getProperty("OPENSHIFT_APP_NAME"));
						  System.out.println("Env variable: OPENSHIFT_APP_DNS" + System.getProperty("OPENSHIFT_APP_DNS"));
						  System.out.println("Env variable: OPENSHIFT_SECRET_TOKEN" + System.getProperty("OPENSHIFT_SECRET_TOKEN"));
						  System.out.println("Env variable: OPENSHIFT_MYSQL_PORT" + System.getProperty("OPENSHIFT_MYSQL_PORT"));
						  System.out.println("Env variable: OPENSHIFT_MYSQL_IP" + System.getProperty("OPENSHIFT_MYSQL_IP"));
						  System.out.println("Env variable: OPENSHIFT_JBOSSEWS_PORT" + System.getProperty("OPENSHIFT_JBOSSEWS_PORT"));
						  System.out.println("Env variable: OPENSHIFT_JBOSSEWS_IP" + System.getProperty("OPENSHIFT_JBOSSEWS_IP"));
						  
						  System.out.println("Env variable: OPENSHIFT_HOMEDIR" + System.getProperty("OPENSHIFT_HOMEDIR"));
						  System.out.println("Env variable: OPENSHIFT_DATA_DIR" + System.getProperty("OPENSHIFT_DATA_DIR"));
						  System.out.println("Env variable: OPENSHIFT_MAX_SESSIONS_PER_GEAR" + System.getProperty("OPENSHIFT_MAX_SESSIONS_PER_GEAR"));
						  System.out.println("Env variable: OPENSHIFT_GEAR_NAME" + System.getProperty("OPENSHIFT_GEAR_NAME"));
						  System.out.println("Env variable: OPENSHIFT_GEAR_DNS" + System.getProperty("OPENSHIFT_GEAR_DNS"));						  						 						  
					 }
			  }
			  //System.out.println("Some constants:\n mysql user " + dbUser + " pw " + dbPass + " url " + dbURL);
		  }		
}
