package com.slidepiper.controller;

import com.slidepiper.model.input.user.UserSignupInput;
import com.slidepiper.service.user.UserService;
import com.slidepiper.validator.UserSignupValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import java.util.Calendar;
import java.util.Objects;

@Controller
public class UserController {
    private final String templatesPrefix;
    private final UserService userService;
    private final UserSignupValidator userSignupValidator;

    @Autowired
    public UserController(@Value("${slidepiper.templates.prefix}") String templatesPrefix,
                          UserService userService,
                          UserSignupValidator userSignupValidator) {
        this.templatesPrefix = templatesPrefix;
        this.userService = userService;
        this.userSignupValidator = userSignupValidator;
    }

    @GetMapping("/signup")
    public String signup(Model model) {
        model.addAttribute("error", false);
        model.addAttribute("currentYear", Calendar.getInstance().get(Calendar.YEAR));
        return UriComponentsBuilder.fromPath(templatesPrefix).pathSegment("signup").build().toUriString();
    }

    @PostMapping("/signup")
    public String signup(HttpServletRequest request, UserSignupInput userSignupInput, BindingResult bindingResult, Model model) throws ServletException {
        userSignupValidator.validate(userSignupInput, bindingResult);
        if (bindingResult.hasErrors()) {
            String defaultMessage = bindingResult.getFieldErrors().get(0).getDefaultMessage();
            model.addAttribute("error", new Object() {String errorMessage = defaultMessage;});
            model.addAttribute("currentYear", Calendar.getInstance().get(Calendar.YEAR));
            return UriComponentsBuilder.fromPath(templatesPrefix).pathSegment("signup").build().toUriString();
        } else {
            userService.save(userSignupInput);
            request.login(userSignupInput.getUsername(), userSignupInput.getPassword());
            return "redirect:/dashboard";
        }
    }

    @GetMapping("/login")
    public String login(Model model,
                        @RequestParam(value = "error", required = false) String error) {
        if (Objects.nonNull(error)) {
            model.addAttribute("error", new Object() {String errorMessage = "Bad username or password";});
        } else {
            model.addAttribute("error", false);
        }
        model.addAttribute("currentYear", Calendar.getInstance().get(Calendar.YEAR));
        return UriComponentsBuilder.fromPath(templatesPrefix).pathSegment("login").build().toUriString();
    }
}