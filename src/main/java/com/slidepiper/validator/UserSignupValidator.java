package com.slidepiper.validator;

import com.slidepiper.model.input.user.UserSignupInput;
import com.slidepiper.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;

import java.util.Objects;

@Component
public class UserSignupValidator implements Validator {
    private final String signupCode;
    private final UserRepository userRepository;

    @Autowired
    public UserSignupValidator(@Value("${slidepiper.user.signupCode}") String signupCode,
                               UserRepository userRepository) {
        this.signupCode = signupCode;
        this.userRepository = userRepository;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return UserSignupInput.class.equals(clazz);
    }

    @Override
    public void validate(Object o, Errors errors) {
        UserSignupInput userSignupInput = (UserSignupInput) o;

        // Name.
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "name", null, null, "Name cannot be empty");
        if (userSignupInput.getName().length() > 40) {
            errors.rejectValue("name", null, "Name should be up to 40 characters");
        }

        // Company.
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "company", null, null, "Company cannot be empty");
        if (userSignupInput.getCompany().length() > 40) {
            errors.rejectValue("company", null, "Company should be up to 40 characters");
        }

        // Username.
        if (!userSignupInput.getUsername().matches("^[a-zA-Z0-9-_]+(\\.[a-zA-Z0-9-_]+)*@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*(\\.[a-zA-Z]+)$")) {
            errors.rejectValue("username", null, "Username is not a valid email address");
        }
        if (Objects.nonNull(userRepository.findByUsername(userSignupInput.getUsername()))) {
            errors.rejectValue("username", null, "Unexpected failure occurred");
        }

        // Password.
        if (userSignupInput.getPassword().length() < 10 || userSignupInput.getPassword().length() > 32) {
            errors.rejectValue("password", null, "Password should be between 10 to 32 characters");
        }
        if (!userSignupInput.getPassword().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*_=+?]).+$")) {
            errors.rejectValue("password", null, "Password should contain at least one lowercase letter, one uppercase letter, one digit, and one symbol");
        }

        // Sign up code.
        if (!userSignupInput.getSignupCode().equals(signupCode)) {
            errors.rejectValue("signupCode", null, "Incorrect sign up code");
        }
    }
}