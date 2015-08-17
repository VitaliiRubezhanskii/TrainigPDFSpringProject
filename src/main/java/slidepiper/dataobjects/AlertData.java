package slidepiper.dataobjects;

import java.util.ArrayList;

public class AlertData {
	String session_id, browser, os, open_time, message_text,  customer_email, customer_name, send_time, slides_id;
	String slides_name;
	public String getSlides_name() {
		return slides_name;
	}

	public AlertData(String session_id, String browser, String os,
			String open_time, String message_text, String customer_email,
			String customer_name, String send_time, String slides_id,
			String slides_name, ArrayList<String> actions,
			ArrayList<String> questions) {
		super();
		this.session_id = session_id;
		this.browser = browser;
		this.os = os;
		this.open_time = open_time;
		this.message_text = message_text;
		this.customer_email = customer_email;
		this.customer_name = customer_name;
		this.send_time = send_time;
		this.slides_id = slides_id;
		this.slides_name = slides_name;
		this.actions = actions;
		this.questions = questions;
	}

	public String getCustomer_name() {
		return customer_name;
	}

	public void setCustomer_name(String customer_name) {
		this.customer_name = customer_name;
	}

	public void setSlides_name(String slides_name) {
		this.slides_name = slides_name;
	}

	ArrayList<String> actions = new ArrayList<String>();
	ArrayList<String> questions = new ArrayList<String>();
	
	public ArrayList<String> getActions() {
		return actions;
	}

	public void setActions(ArrayList<String> actions) {
		this.actions = actions;
	}

	public ArrayList<String> getQuestions() {
		return questions;
	}

	public void setQuestions(ArrayList<String> questions) {
		this.questions = questions;
	}

	public String getSession_id() {
		return session_id;
	}

	public void setSession_id(String session_id) {
		this.session_id = session_id;
	}

	public String getBrowser() {
		return browser;
	}

	public void setBrowser(String browser) {
		this.browser = browser;
	}

	public String getOs() {
		return os;
	}

	public void setOs(String os) {
		this.os = os;
	}

	public String getOpen_time() {
		return open_time;
	}

	public void setOpen_time(String open_time) {
		this.open_time = open_time;
	}

	public String getMessage_text() {
		return message_text;
	}

	public void setMessage_text(String message_text) {
		this.message_text = message_text;
	}

	public String getCustomer_email() {
		return customer_email;
	}

	public void setCustomer_email(String customer_email) {
		this.customer_email = customer_email;
	}

	public String getSend_time() {
		return send_time;
	}

	public void setSend_time(String send_time) {
		this.send_time = send_time;
	}

	public String getSlides_id() {
		return slides_id;
	}

	public void setSlides_id(String slides_id) {
		this.slides_id = slides_id;
	}

	@Override
	public String toString() {
		return "AlertData [session_id=" + session_id + ", browser=" + browser
				+ ", os=" + os + ", open_time=" + open_time + ", message_text="
				+ message_text + ", customer_email=" + customer_email
				+ ", customer_name=" + customer_name + ", send_time="
				+ send_time + ", slides_id=" + slides_id + ", slides_name="
				+ slides_name + ", actions=" + actions + ", questions="
				+ questions + "]";
	}			
}
