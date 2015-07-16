package slidepiper.dataobjects;

public class MessageInfo {
		String id,salesManEmail, customerEmail, slidesId, msgText, timestamp;

		public String getId() {
			return id;
		}

		public void setId(String id) {
			this.id = id;
		}

		public String getSalesManEmail() {
			return salesManEmail;
		}

		public void setSalesManEmail(String salesManEmail) {
			this.salesManEmail = salesManEmail;
		}

		public String getCustomerEmail() {
			return customerEmail;
		}

		public void setCustomerEmail(String customerEmail) {
			this.customerEmail = customerEmail;
		}

		public String getSlidesId() {
			return slidesId;
		}

		public void setSlidesId(String slidesId) {
			this.slidesId = slidesId;
		}

		public String getMsgText() {
			return msgText;
		}

		public void setMsgText(String msgText) {
			this.msgText = msgText;
		}

		public String getTimestamp() {
			return timestamp;
		}

		public void setTimestamp(String timestamp) {
			this.timestamp = timestamp;
		}

		public MessageInfo(String id, String salesManEmail,
				String customerEmail, String slidesId, String msgText,
				String timestamp) {
			super();
			this.id = id;
			this.salesManEmail = salesManEmail;
			this.customerEmail = customerEmail;
			this.slidesId = slidesId;
			this.msgText = msgText;
			this.timestamp = timestamp;
		}

		@Override
		public String toString() {
			return "MessageInfo [id=" + id + ", salesManEmail=" + salesManEmail
					+ ", customerEmail=" + customerEmail + ", slidesId="
					+ slidesId + ", msgText=" + msgText + ", timestamp="
					+ timestamp + "]";
		}
		
		
}
