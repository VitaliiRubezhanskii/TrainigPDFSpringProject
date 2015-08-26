package slidepiper.dataobjects;

public class CustomerSession {
			String msgid, ipaddr, session_id, browser, operating_system, all_browser_data;
			int done;
			String timestamp;
			public String getMsgid() {
				return msgid;
			}
			public void setMsgid(String msgid) {
				this.msgid = msgid;
			}
			public String getIpaddr() {
				return ipaddr;
			}
			public void setIpaddr(String ipaddr) {
				this.ipaddr = ipaddr;
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
			public String getOperating_system() {
				return operating_system;
			}
			public void setOperating_system(String operating_system) {
				this.operating_system = operating_system;
			}
			public String getAll_browser_data() {
				return all_browser_data;
			}
			public void setAll_browser_data(String all_browser_data) {
				this.all_browser_data = all_browser_data;
			}
			public int getDone() {
				return done;
			}
			public void setDone(int done) {
				this.done = done;
			}
			public String getTimestamp() {
				return timestamp;
			}
			public void setTimestamp(String timestamp) {
				this.timestamp = timestamp;
			}
			@Override
			public String toString() {
				return "CustomerSession [msgid=" + msgid + ", ipaddr=" + ipaddr
						+ ", session_id=" + session_id + ", browser=" + browser
						+ ", operating_system=" + operating_system
						+ ", all_browser_data=" + all_browser_data + ", done="
						+ done + ", timestamp=" + timestamp + "]";
			}
			public CustomerSession(String msgid, String ipaddr,
					String session_id, String browser, String operating_system,
					String all_browser_data, int done, String timestamp) {
				super();
				this.msgid = msgid;
				this.ipaddr = ipaddr;
				this.session_id = session_id;
				this.browser = browser;
				this.operating_system = operating_system;
				this.all_browser_data = all_browser_data;
				this.done = done;
				this.timestamp = timestamp;
			}
			
			
}
