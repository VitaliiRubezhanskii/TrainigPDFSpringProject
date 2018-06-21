package com.slidepiper.dto;

import com.slidepiper.model.customer.Customer;
import com.slidepiper.model.entity.Document;

import java.util.List;

public class CustomerSlideDTO {


    private Customer customer;

    private List<Document> documentList;

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public List<Document> getDocumentList() {
        return documentList;
    }

    public void setDocumentList(List<Document> documentList) {
        this.documentList = documentList;
    }

    public CustomerSlideDTO() {

    }

    public CustomerSlideDTO(Customer customer, List<Document> documentList) {
        this.customer = customer;
        this.documentList = documentList;
    }
}
