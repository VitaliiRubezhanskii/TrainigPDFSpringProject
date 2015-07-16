package slidepiper.dataobjects;

public class SlideView {
		int slide_num;
		double time_viewed;
		int special_event; // 0 if no event.
		
		public SlideView(int slide_num, double time_viewed, int special_event) {
			super();
			this.slide_num = slide_num;
			this.time_viewed = time_viewed;
			this.special_event = special_event;
		}
		 
		//otherwise can be leaving and returning to window, etc.
		public int getSlideNum() {
			return slide_num;
		}
		public void setSlideNum(int slide_num) {
			this.slide_num = slide_num;
		}
		public double getTimeViewed() {
			return time_viewed;
		}
		public void setTimeViewed(double time_viewed) {
			this.time_viewed = time_viewed;
		}
		public int getSpecialEvent() {
			return special_event;
		}
		public void setSpecialEvent(int special_event) {
			this.special_event = special_event;
		}
}
