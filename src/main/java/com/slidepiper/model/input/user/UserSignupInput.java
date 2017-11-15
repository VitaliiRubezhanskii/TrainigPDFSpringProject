package com.slidepiper.model.input.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties({"password", "signupCode"})
public class UserSignupInput {
    private String name;
    private String company;
    private String username;
    private String password;
    private String signupCode;
}