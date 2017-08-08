package com.slidepiper.controller;

import com.slidepiper.model.entity.Viewer;
import com.slidepiper.model.input.user.UserSignupInput;
import com.slidepiper.repository.ViewerRepository;
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
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Calendar;
import java.util.List;
import java.util.Objects;

@Controller
public class UserController {
    private final String templatesPrefix;
    private final UserService userService;
    private final UserSignupValidator userSignupValidator;

    // TODO: Delete migration.
    private final ViewerRepository viewerRepository;

    @Autowired
    public UserController(@Value("${slidepiper.templates.prefix}") String templatesPrefix,
                          UserService userService,
                          UserSignupValidator userSignupValidator,
                          ViewerRepository viewerRepository) {
        this.templatesPrefix = templatesPrefix;
        this.userService = userService;
        this.userSignupValidator = userSignupValidator;
        this.viewerRepository = viewerRepository;
    }

    @GetMapping("/signup")
    public String signup(Model model) {
        model.addAttribute("error", false);
        model.addAttribute("currentYear", Calendar.getInstance().get(Calendar.YEAR));
        return UriComponentsBuilder.fromPath(templatesPrefix).pathSegment("signup").build().toUriString();
    }

    @PostMapping("/signup")
    public String signup(UserSignupInput userSignupInput, BindingResult bindingResult, Model model) {
        userSignupValidator.validate(userSignupInput, bindingResult);
        if (bindingResult.hasErrors()) {
            String defaultMessage = bindingResult.getFieldErrors().get(0).getDefaultMessage();
            model.addAttribute("error", new Object() {String errorMessage = defaultMessage;});
            model.addAttribute("currentYear", Calendar.getInstance().get(Calendar.YEAR));
            return UriComponentsBuilder.fromPath(templatesPrefix).pathSegment("signup").build().toUriString();
        } else {
            userService.save(userSignupInput);
            userService.authenticate(userSignupInput.getUsername(), userSignupInput.getPassword());
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

    // TODO: Delete migration.
    @GetMapping("/user/migrate-cefe2f2b-2916-11e7-83d5-54ee756204da")
    @ResponseBody
    public String migrate() {
        List<Viewer> viewers = viewerRepository.findAll();

        for (Viewer viewer : viewers) {
            try {
                userService.migrate(viewer);
            } catch (NullPointerException e) {
                System.out.println("Migration NullPointerException viewer id: " + viewer.getId());
            }
        }

        return "Done";
    }
}