package slidepiper.constants;

public class Constants {
    public static String dbUser = System.getProperty("spring.datasource.username");
    public static String dbPass = System.getProperty("spring.datasource.password");
    public static String dbURL = System.getProperty("spring.datasource.url");

    public static void updateConstants() {
//        System.err.println("Constants.updateConstants is deprecated");
    }
}