package com.slidepiper.enums;

public enum DocumentStatus {

	Required("Required"),
	UploadedByCustomer("Uploaded by customer"),
	UploadedByBuilder("Uploaded by user (builder / manager)");

	private String descr;

	private DocumentStatus(String descr) {
		this.descr = descr;
	}
	
	public static DocumentStatus findStatus(int ordinal) {
		for (DocumentStatus s : values()) {
			if (s.ordinal() == ordinal) {
				return s;
			}
		}
		
		return null;
	}
	
	public String getDescr() {
		return descr;
	}
}
