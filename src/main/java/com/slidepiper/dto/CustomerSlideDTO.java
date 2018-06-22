package com.slidepiper.dto;

import lombok.Data;

@Data
public class CustomerSlideDTO {

    private String customerEmail;
    private String[] documentList;

    public CustomerSlideDTO() {

    }

    public CustomerSlideDTO(String customerEmail, String[] documentList) {
        this.customerEmail = customerEmail;
        this.documentList = documentList;
    }
}
