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

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {
    private final AuthenticationManager authenticationManager;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final EventRepository eventRepository;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ViewerRepository viewerRepository;

    @Autowired
    public UserService(AuthenticationManager authenticationManager,
                       BCryptPasswordEncoder bCryptPasswordEncoder,
                       EventRepository eventRepository,
                       UserDetailsService userDetailsService,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       ViewerRepository viewerRepository) {
        this.authenticationManager = authenticationManager;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
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
        viewerRepository.save(viewer);

        // Save event.
        eventRepository.save(new Event(user.getUsername(), EventType.SIGNUP_USER));
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
            userRepository.save(user);
        } else {
            throw new BadCredentialsException("Incorrect current password");
        }
    }

    /** @deprecated */
    public void migrate(Viewer viewer) {
        User user  = new User();
        user.setUsername(viewer.getEmail());
        user.setPassword(bCryptPasswordEncoder.encode(viewer.getPassword()));

        Set<Role> roles = new HashSet<>();
        roles.add(roleRepository.findByName("ROLE_USER"));
        user.setRoles(roles);
        userRepository.save(user);

        viewer.setUserId(user.getId());
        viewer.setFriendlyId(UUID.randomUUID().toString());
        viewerRepository.save(viewer);
    }
}