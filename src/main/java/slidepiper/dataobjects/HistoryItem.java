package slidepiper.dataobjects;

public class HistoryItem {
		String customerName, 
			customerEmail,
			messageText, 
			msgId,
			slidesName, 
			timestamp;

		public HistoryItem(String customerName, String customerEmail,
				String messageText, String msgId, String slidesName,
				String timestamp) {
			super();
			this.customerName = customerName;
			this.customerEmail = customerEmail;
			this.messageText = messageText;
			this.msgId = msgId;
			this.slidesName = slidesName;
			this.timestamp = timestamp;
		}

		public String getCustomerName() {
			return customerName;
		}

		public void setCustomerName(String customerName) {
			this.customerName = customerName;
		}

		public String getCustomerEmail() {
			return customerEmail;
		}

		public void setCustomerEmail(String customerEmail) {
			this.customerEmail = customerEmail;
		}

		public String getMessageText() {
			return messageText;
		}

		public void setMessageText(String messageText) {
			this.messageText = messageText;
		}

		public String getMsgId() {
			return msgId;
		}

		public void setMsgId(String msgId) {
			this.msgId = msgId;
		}

		public String getSlidesName() {
			return slidesName;
		}

		public void setSlidesName(String slidesName) {
			this.slidesName = slidesName;
		}

		public String getTimestamp() {
			return timestamp;
		}

		public void setTimestamp(String timestamp) {
			this.timestamp = timestamp;
		}

		@Override
		public String toString() {
			return "HistoryItem [customerName=" + customerName
					+ ", customerEmail=" + customerEmail + ", messageText="
					+ messageText + ", msgId=" + msgId + ", slidesName="
					+ slidesName + ", timestamp=" + timestamp + "]";
		}
		
}
