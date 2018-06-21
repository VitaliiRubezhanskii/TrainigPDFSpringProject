package com.slidepiper.dto;


import java.io.Serializable;
import java.security.Principal;

public class CustomerDTO implements Serializable {

private String subAction;
private String salesMan;
private String customerFirstName;
private String customerLastName;
private String customerCompany;
private String customerGroup;
private String customerEmail;
private String customerID;
private String customerPhone;




    public CustomerDTO() {
    }

    public CustomerDTO(String subAction, String salesMan, String customerFirstName, String customerLastName,
                       String customerCompany, String customerGroup, String customerEmail, String customerID, String customerPhone) {
        this.subAction = subAction;
        this.salesMan = salesMan;
        this.customerFirstName = customerFirstName;
        this.customerLastName = customerLastName;
        this.customerCompany = customerCompany;
        this.customerGroup = customerGroup;
        this.customerEmail = customerEmail;
        this.customerID = customerID;
        this.customerPhone = customerPhone;

    }

    public String getSubAction() {
        return subAction;
    }

    public void setSubAction(String subAction) {
        this.subAction = subAction;
    }

    public String getSalesMan() {
        return salesMan;
    }

    public void setSalesMan(String salesMan) {
        this.salesMan = salesMan;
    }

    public String getCustomerFirstName() {
        return customerFirstName;
    }

    public void setCustomerFirstName(String customerFirstName) {
        this.customerFirstName = customerFirstName;
    }

    public String getCustomerLastName() {
        return customerLastName;
    }

    public void setCustomerLastName(String customerLastName) {
        this.customerLastName = customerLastName;
    }

    public String getCustomerCompany() {
        return customerCompany;
    }

    public void setCustomerCompany(String customerCompany) {
        this.customerCompany = customerCompany;
    }

    public String getCustomerGroup() {
        return customerGroup;
    }

    public void setCustomerGroup(String customerGroup) {
        this.customerGroup = customerGroup;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerID() {
        return customerID;
    }

    public void setCustomerID(String customerID) {
        this.customerID = customerID;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }
}