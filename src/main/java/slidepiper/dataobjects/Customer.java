package slidepiper.dataobjects;

public class Customer {
	
	private String name;
	private String email;
	private String salesman;
	
	public Customer(String name, String email, String salesman){
		setName(name);
		setEmail(email);
		setSalesman(salesman);
	}
	
	@Override
	public String toString() {
		return "name: " + getName() + ", email: " + getEmail() + ", sales man: " + getSalesman();
	}
	
	@Override
    public boolean equals(Object obj) {
       Customer customer = (Customer) obj;
       return this.email.equals(customer.getEmail());
    }

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getSalesman() {
		return salesman;
	}

	public void setSalesman(String salesman) {
		this.salesman = salesman;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

}
