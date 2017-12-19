package com.slidepiper.validator;

import com.slidepiper.model.input.user.UserChangePasswordInput;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

@Component
public class UserChangePasswordValidator implements Validator {
    @Override
    public boolean supports(Class<?> clazz) {
        return UserChangePasswordInput.class.equals(clazz);
    }

    @Override
    public void validate(Object o, Errors errors) {
        UserChangePasswordInput userChangePasswordInput = (UserChangePasswordInput) o;

        // New Password.
        if (userChangePasswordInput.getNewPassword().length() < 10 || userChangePasswordInput.getNewPassword().length() > 32) {
            errors.rejectValue("newPassword", null, "Password should be between 10 to 32 characters");
        }
        if (!userChangePasswordInput.getNewPassword().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*_=+?]).+$")) {
            errors.rejectValue("newPassword", null, "Password should contain at least one lowercase letter, one uppercase letter, one digit, and one symbol");
        }
        if (!userChangePasswordInput.getNewPassword().equals(userChangePasswordInput.getNewPasswordConfirm())) {
            errors.rejectValue("newPasswordConfirm", null, "Passwords don't match");
        }
        if (userChangePasswordInput.getNewPassword().equals(userChangePasswordInput.getPassword())) {
            errors.rejectValue("newPassword", null, "New password must be different than current password");
        }
    }
}