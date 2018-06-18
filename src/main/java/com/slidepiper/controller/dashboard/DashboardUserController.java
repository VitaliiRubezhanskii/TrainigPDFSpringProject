package com.slidepiper.controller.dashboard;

import com.slidepiper.model.entity.User;
import com.slidepiper.model.entity.Viewer;
import com.slidepiper.model.input.user.UserChangePasswordInput;
import com.slidepiper.model.input.user.UserEmailConfigurationInput;
import com.slidepiper.repository.UserRepository;
import com.slidepiper.repository.ViewerRepository;
import com.slidepiper.service.user.UserService;
import com.slidepiper.validator.UserChangePasswordValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardUserController {
    private final UserChangePasswordValidator userChangePasswordValidator;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ViewerRepository viewerRepository;

    @Autowired
    public DashboardUserController(UserChangePasswordValidator userChangePasswordValidator,
                                   UserRepository userRepository,
                                   UserService userService,
                                   ViewerRepository viewerRepository) {
        this.userChangePasswordValidator = userChangePasswordValidator;
        this.userRepository = userRepository;
        this.userService = userService;
        this.viewerRepository = viewerRepository;
    }

    @PostMapping("/api/v1/user/change-password")
    public ResponseEntity<String> changePassword(Principal principal,
                                                 UserChangePasswordInput userChangePasswordInput,
                                                 BindingResult bindingResult) {
        userChangePasswordValidator.validate(userChangePasswordInput, bindingResult);
        if (bindingResult.hasErrors()) {
            return new ResponseEntity<>(bindingResult.getFieldErrors().get(0).getDefaultMessage(), HttpStatus.BAD_REQUEST);
        } else {
            try {
                User user = userRepository.findByUsername(principal.getName());
                userService.changePassword(user, userChangePasswordInput.getPassword(), userChangePasswordInput.getNewPassword());
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } catch (BadCredentialsException e) {
                return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
            }
        }
    }

    /** @deprecated */
    @PostMapping("/api/v1/user/email-configuration")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void saveEmailConfiguration(Principal principal,
                                   @RequestBody UserEmailConfigurationInput userEmailConfigurationInput) {
        Viewer viewer = viewerRepository.findByEmail(principal.getName());

        if (Objects.isNull(viewer.getData())) {
            viewer.setData(new Viewer.UserData(userEmailConfigurationInput.getNotificationEmail()));
        } else {
            viewer.getData().setNotificationEmail(userEmailConfigurationInput.getNotificationEmail());
        }
        // TODO: Remove dependency on the above code.
        viewer.getData().setReceiveCustomerEmailEnabled(userEmailConfigurationInput.isReceiveCustomerEmailEnabled());

        viewer.setViewerOpenDocumentEmailEnabled(userEmailConfigurationInput.isViewerOpenDocumentEmailEnabled());
        viewer.setViewerEventEmailEnabled(userEmailConfigurationInput.isViewerEventEmailEnabled());
        viewer.setEnabledSupportEmail(userEmailConfigurationInput.isSupportEmailEnabled());
        viewerRepository.save(viewer);
    }

    /** @deprecated */
    @GetMapping("/api/v1/user")
    public Map<String, Object> userConfiguration(Principal principal) {
        Map<String, Object> userConfiguration = new HashMap<>();
        Viewer viewer = viewerRepository.findByEmail(principal.getName());

        userConfiguration.put("name", viewer.getName());
        userConfiguration.put("email", viewer.getEmail());
        userConfiguration.put("notificationEmail", Optional.ofNullable(viewer.getData()).map(data -> data.getNotificationEmail()).orElse(null));
        userConfiguration.put("email_alert_enabled", viewer.isViewerOpenDocumentEmailEnabled());
        userConfiguration.put("email_notifications_enabled", viewer.isViewerEventEmailEnabled());
        userConfiguration.put("receiveCustomerEmailEnabled", Optional.ofNullable(viewer.getData()).map(data -> data.isReceiveCustomerEmailEnabled()).orElse(null));
        userConfiguration.put("email_support_show_alert_enabled",viewer.isEnabledSupportEmail());
        return userConfiguration;
    }
}