package slidepiper.keepalive;


public class KeepAlivePacket {

	// it's only an estimation because the keepalive packet
	// comes only every 2-3 seconds, not all the time.
		int estimatedTimeViewed;
		int slideNumber;
		String msgId;
		public String getMsgId() {
			return msgId;
		}
		public void setMsgId(String msgId) {
			this.msgId = msgId;
		}

		String sessionId;
		
		// number of seconds this packet is dead.
		// It should be reset to 0 every 2-3 seconds
		// If it goes up to 10 it means the customer's browser is closed,
		// and we should take care of that.
		// Initiated at zero, so that for every new keepalive
		// msg we have this at zero. 
		int noKeepAliveSeconds = 0;
				
		public int getEstimatedTimeViewed() {
			return estimatedTimeViewed;
		}
		public void setEstimatedTimeViewed(int estimatedTimeViewed) {
			this.estimatedTimeViewed = estimatedTimeViewed;
		}
		public int getSlideNumber() {
			return slideNumber;
		}
		public void setSlideNumber(int slideNumber) {
			this.slideNumber = slideNumber;
		}
		public String getSessionId() {
			return sessionId;
		}
		public void setSessionId(String sessionId) {
			this.sessionId = sessionId;
		}
		@Override
		public String toString() {
			return "KeepAlivePacket [estimatedTimeViewed="
					+ estimatedTimeViewed + ", slideNumber=" + slideNumber
					+ ", sessionId=" + sessionId +  " msgId= " + msgId + "]";
		}
		public KeepAlivePacket(int estimatedTimeViewed, int slideNumber,
				String sessionId, String msgId) {
			super();
			this.estimatedTimeViewed = estimatedTimeViewed;
			this.slideNumber = slideNumber;
			this.sessionId = sessionId;
			this.msgId = msgId;
			this.noKeepAliveSeconds = 0; // init at zero.
		}
		
		// some time passed in the timer, change the
		// number of seconds with no keepalive
		public void passSeconds(int secPassed)
		{
			this.noKeepAliveSeconds += secPassed;
		}
		
		public Boolean isPacketDead()
		{
				if (this.noKeepAliveSeconds >10) // packet is dead - no keepalive for 10 sec.
				{
					return true;
				} 	
				else
				{
					return false;
				}
		}
		
		
}