package com.slidepiper.model.input.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties({"password", "newPassword", "newPasswordConfirm"})
public class UserChangePasswordInput {
    private String password;
    private String newPassword;
    private String newPasswordConfirm;
}