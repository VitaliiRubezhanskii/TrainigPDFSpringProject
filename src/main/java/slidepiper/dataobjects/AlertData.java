package slidepiper.dataobjects;

public class AlertData {
	
	String customer_email, customer_name, slides_name, msg_text, open_time, send_time, msg_id, session_id;
	
	
	public AlertData() {
		super();
	}

			public String getCustomer_email() {
		return customer_email;
	}

	public void setCustomer_email(String customer_email) {
		this.customer_email = customer_email;
	}

	public String getSlides_name() {
		return slides_name;
	}

	public void setSlides_name(String slides_name) {
		this.slides_name = slides_name;
	}

	public String getMsg_text() {
		return msg_text;
	}

	public void setMsg_text(String msg_text) {
		this.msg_text = msg_text;
	}

	public String getOpen_time() {
		return open_time;
	}

	public void setOpen_time(String open_time) {
		this.open_time = open_time;
	}

	public String getSend_time() {
		return send_time;
	}

	public void setSend_time(String send_time) {
		this.send_time = send_time;
	}

	

	public String getCustomer_name() {
		return customer_name;
	}

	public void setCustomer_name(String customer_name) {
		this.customer_name = customer_name;
	}

	public AlertData(String customer_email, String customer_name, String slides_name,
			String msg_text, String open_time, String send_time, String msg_id,
			String session_id) {
		super();
		this.customer_email = customer_email;
		this.customer_name = customer_name;
		this.slides_name = slides_name;
		this.msg_text = msg_text;
		this.open_time = open_time;
		this.send_time = send_time;
		this.msg_id = msg_id;
		this.session_id = session_id;
	}

	public String getMsg_id() {
		return msg_id;
	}

	public void setMsg_id(String msg_id) {
		this.msg_id = msg_id;
	}

	public String getSession_id() {
		return session_id;
	}

	public void setSession_id(String session_id) {
		this.session_id = session_id;
	}			
}
