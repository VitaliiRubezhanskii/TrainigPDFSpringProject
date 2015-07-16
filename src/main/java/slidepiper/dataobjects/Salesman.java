package slidepiper.dataobjects;

public class Salesman {
	
	private String email;
	private String password;// password for system
	private String name;
	private String emailpassword; // password for email, for sending msgs
	
	public Salesman(String email, String password, String name, String emailpassword){
		setEmail(email);
		setPassword(password);
		setName(name);
		setEmailpassword(emailpassword);
		//System.out.println("Created in salesman: " + email + " pw " + password + " name " + name + " emailp" + emailpassword);
	}
	
	@Override
	public String toString() {
		return "email: " + getEmail() + ", password: " + getPassword();
	}
	
	@Override
    public boolean equals(Object obj) {
       Salesman salesman = (Salesman)obj;
       return this.email.equals(salesman.getEmail()) && this.password.equals(salesman.getPassword());
    }
	
	public String getEmail() {
		return email;
	}
	
	public String getEmailpassword() {
		return emailpassword;
	}

	public void setEmail(String email) {
		this.email = email;
	}
	
	public void setEmailpassword(String emailpassword) {
		this.emailpassword = emailpassword;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
}
