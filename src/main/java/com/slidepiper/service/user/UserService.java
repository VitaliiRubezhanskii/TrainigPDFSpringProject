package com.slidepiper.service.user;

import com.slidepiper.model.entity.Event;
import com.slidepiper.model.entity.Event.EventType;
import com.slidepiper.model.entity.Role;
import com.slidepiper.model.entity.User;
import com.slidepiper.model.entity.Viewer;
import com.slidepiper.model.input.user.UserSignupInput;
import com.slidepiper.repository.EventRepository;
import com.slidepiper.repository.RoleRepository;
import com.slidepiper.repository.UserRepository;
import com.slidepiper.repository.ViewerRepository;
import com.slidepiper.service.email.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class UserService {
    private final AuthenticationManager authenticationManager;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final EmailService emailService;
    private final EventRepository eventRepository;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ViewerRepository viewerRepository;

    @Autowired
    public UserService(AuthenticationManager authenticationManager,
                       BCryptPasswordEncoder bCryptPasswordEncoder,
                       EmailService emailService,
                       EventRepository eventRepository,
                       UserDetailsService userDetailsService,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       ViewerRepository viewerRepository) {
        this.authenticationManager = authenticationManager;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.emailService = emailService;
        this.eventRepository = eventRepository;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.viewerRepository = viewerRepository;
    }

    public void save(UserSignupInput userSignupInput) {
        // Save user.
        User user = new User();
        user.setUsername(userSignupInput.getUsername());
        user.setPassword(bCryptPasswordEncoder.encode(userSignupInput.getPassword()));
        user.setPasswordExpiresAt(new Timestamp(System.currentTimeMillis() + TimeUnit.DAYS.toMillis(365 * 10)));

        Set<Role> roles = new HashSet<>();
        roles.add(roleRepository.findByName("ROLE_USER"));
        user.setRoles(roles);
        userRepository.save(user);

        // Save user configuration.
        Viewer viewer = new Viewer();
        viewer.setUserId(user.getId());
        viewer.setFriendlyId(UUID.randomUUID().toString());
        viewer.setEmail(user.getUsername());
        viewer.setName(userSignupInput.getName());
        viewer.setCompany(userSignupInput.getCompany());
        viewerRepository.save(viewer);

        // Save event.
        eventRepository.save(new Event(user.getUsername(), EventType.SIGNUP_USER));

        // Send admin email.
        String subject = "New User Registration";
        String body = "Name: " + viewer.getName() + ", Company: " + viewer.getCompany() + ", Email: " + viewer.getEmail();
        emailService.sendAdminEmail(subject, body);
    }

    public void authenticate(String username, String password) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userDetails, password, userDetails.getAuthorities());

        Authentication authentication = authenticationManager.authenticate(usernamePasswordAuthenticationToken);

        if (authentication.isAuthenticated()) {
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    public void changePassword(User user, String password, String newPassword) {
        if (bCryptPasswordEncoder.matches(password, user.getPassword())) {
            user.setPassword(bCryptPasswordEncoder.encode(newPassword));
            user.setPasswordChangedAt(new Timestamp(System.currentTimeMillis()));
            user.setPasswordExpiresAt(null);
            userRepository.save(user);

            // Save event.
            eventRepository.save(new Event(user.getUsername(), EventType.USER_CHANGED_PASSWORD));
        } else {
            throw new BadCredentialsException("Incorrect current password");
        }
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    public long getUserId() {
        return userRepository.findByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).getId();
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    public String getPasswordExpiresAtMessage() {
        Timestamp passwordExpiresAt = getPasswordExpiresAt();
        if (Objects.nonNull(passwordExpiresAt)) {
            long days = TimeUnit.MILLISECONDS.toDays(passwordExpiresAt.getTime() - System.currentTimeMillis());
            if (days <= 14) {
                return "Your password will expire in " + days + " days. Please change your password.";
            }
        }

        return null;
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    private Timestamp getPasswordExpiresAt() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).getPasswordExpiresAt();
    }
}