package slidepiper.dataobjects;

public class Presentation {

	private String name;
	private String salesman_email;
	private String id;
	
	public Presentation(String name, String smemail, String id){
		setName(name);
		setSalesmanEmail(smemail);
		setId(id);
	}
	
	public String toString(){
		return "presentation name: " + getName();// + ", link: " + getLink();
	}

	public String getName() {
		return name;
	}

	
	public String getId() {
		return id;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	public String getSalesmanEmail() {
		return salesman_email;
	}

	public void setSalesmanEmail(String em) {
		this.salesman_email = em;
	}
}