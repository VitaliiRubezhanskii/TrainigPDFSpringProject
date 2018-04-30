package com.slidepiper.service.viewer;

import com.slidepiper.model.entity.Customer;
import com.slidepiper.model.entity.Role;
import com.slidepiper.model.entity.User;
import com.slidepiper.repository.CustomerRepository;
import com.slidepiper.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Service
public class ViewerDetailsServiceImpl implements UserDetailsService {
    private final CustomerRepository userRepository;

    @Autowired
    public ViewerDetailsServiceImpl(CustomerRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Customer user = userRepository.findCustomerByCustomerId(username);

        if (Objects.isNull(user)) {
            throw new UsernameNotFoundException("customer is null");
        }

        Set<GrantedAuthority> grantedAuthorities = new HashSet<>();
        grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_USER"));

        return new org.springframework.security.core.userdetails.User(user.getCustomerId() + "" , user.getPhoneNumber(), grantedAuthorities);
    }
}