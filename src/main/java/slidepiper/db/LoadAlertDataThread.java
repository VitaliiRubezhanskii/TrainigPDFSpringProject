package slidepiper.db;

import slidepiper.dataobjects.*;

import java.util.ArrayList;


// thread for loading extra stuff for the alert 
// questions, actions, cust name.
/// must do it concurrently for all alerts, because
// it takes too much time - the roundtrip to the SQL db and back.
public class LoadAlertDataThread extends Thread {	
		private AlertData alertData;
		private String salesman_email;
	// loads extra stuff needed for thread
	   public LoadAlertDataThread(AlertData ad, String smemail) {
	       // store parameter for later user
		   	alertData = ad;
		   	salesman_email = smemail;
	   }

	   public void run() {
		   	String sessid = alertData.getSession_id();
				String customer_name = DbLayer.getCustomerName(alertData.getCustomer_email(), salesman_email);
				ArrayList<String> actions = DbLayer.getActions(sessid);
				ArrayList<String> questions = DbLayer.getQuestions(sessid);
				
				alertData.setCustomer_name(customer_name);
				alertData.setActions(actions);
				alertData.setQuestions(questions);
	   }
	}
