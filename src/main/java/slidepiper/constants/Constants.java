package slidepiper.constants;

public class Constants {		  		 		  
		  public static String MYSQL_USERNAME = System.getenv("OPENSHIFT_MYSQL_DB_USERNAME");
		  public static String MYSQL_PASSWORD = System.getenv("OPENSHIFT_MYSQL_DB_PASSWORD");
		  public static String MYSQL_DATABASE_HOST = System.getenv("OPENSHIFT_MYSQL_DB_HOST");
		  public static String MYSQL_DATABASE_PORT = System.getenv("OPENSHIFT_MYSQL_DB_PORT");
		  public static final String MYSQL_DATABASE_NAME = "picascrafxzhbcmd";
		  
		  public static String dbUser = MYSQL_USERNAME; //"adminS16x82l";
		  public static String dbPass = MYSQL_PASSWORD; //"CdikJ1eZlpDy";
		  //public static final String dbURL = "jdbc:mysql://127.0.0.1:3307/picascrafxzhbcmd";		  
		  public static String dbURL = "jdbc:mysql://" + MYSQL_DATABASE_HOST + ":" + MYSQL_DATABASE_PORT + "/" + MYSQL_DATABASE_NAME;
		  
		  public static void updateConstants()
		  {	
			  if (MYSQL_DATABASE_PORT==null) // no openshift				  
			  {				  
				  // for local work
				  dbUser = "adminS16x82l";
				  dbPass = "CdikJ1eZlpDy";
				  dbURL = "jdbc:mysql://127.0.0.1:3307/picascrafxzhbcmd";
			  }  
			  //System.out.println("Some constants:\n mysql user " + dbUser + " pw " + dbPass + " url " + dbURL);
		  }		
}
