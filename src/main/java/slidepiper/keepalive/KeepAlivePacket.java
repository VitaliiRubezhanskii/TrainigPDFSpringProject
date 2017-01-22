package slidepiper.keepalive;


public class KeepAlivePacket {

	// it's only an estimation because the keepalive packet
	// comes only every 2-3 seconds, not all the time.
		int timezoneOffsetMin;
		private final String viewerId;
		public int getTimezoneOffsetMin() {
			return timezoneOffsetMin;
		}
		public void setTimezoneOffsetMin(int timezoneOffsetMin) {
			this.timezoneOffsetMin = timezoneOffsetMin;
		}

		public KeepAlivePacket(int timezoneOffsetMin, int estimatedTimeViewed,
				int slideNumber, String msgId, String sessionId, String viewerId) {
			super();
			this.timezoneOffsetMin = timezoneOffsetMin;
			this.estimatedTimeViewed = estimatedTimeViewed;
			this.slideNumber = slideNumber;
			this.msgId = msgId;
			this.sessionId = sessionId;
			this.noKeepAliveSeconds = 0;
			this.viewerId = viewerId;
		}

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
		
		// some time passed in the timer, change the
		// number of seconds with no keepalive
		public void passSeconds(int secPassed)
		{
			this.noKeepAliveSeconds += secPassed;
		}
		
		public Boolean isPacketDead()
		{
				if (this.noKeepAliveSeconds >20) // packet is dead - no keepalive for 10 sec.
				{
					return true;
				} 	
				else
				{
					if (this.estimatedTimeViewed > 300)
					{
							return true;
					}
					else
					{
							return false;
					}
				}
		}
		public int getNoKeepAliveSeconds() {
			return noKeepAliveSeconds;
		}
		public void setNoKeepAliveSeconds(int noKeepAliveSeconds) {
			this.noKeepAliveSeconds = noKeepAliveSeconds;
		}
    public String getViewerId() {
      return viewerId;
    }
}
