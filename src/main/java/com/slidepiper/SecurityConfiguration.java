package com.slidepiper;

import com.slidepiper.service.user.AuthenticationSuccessHandlerImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {
    @Configuration
    @Order(1)
    public static class ViewerConfigurationAdapter extends WebSecurityConfigurerAdapter {
        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http
                .requestMatchers()
                    .antMatchers("/view", "/viewer/**", "/utils/**")
                    .and()
                .headers()
                    .frameOptions()
                    .disable()
                    .and()
                .authorizeRequests()
                    .anyRequest()
                    .permitAll()
                    .and()
                .csrf()
                    .disable();
        }
    }

    @Configuration
    public static class ApplicationConfigurationAdapter extends WebSecurityConfigurerAdapter {
        private final AuthenticationSuccessHandlerImpl authenticationSuccessHandlerImpl;
        private final UserDetailsService userDetailsService;

        @Autowired
        public ApplicationConfigurationAdapter(AuthenticationSuccessHandlerImpl authenticationSuccessHandlerImpl,
                                               UserDetailsService userDetailsService) {
            this.userDetailsService = userDetailsService;
            this.authenticationSuccessHandlerImpl = authenticationSuccessHandlerImpl;
        }

        @Bean
        public BCryptPasswordEncoder bCryptPasswordEncoder() {
            return new BCryptPasswordEncoder();
        }

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http
                .authorizeRequests()
                    .antMatchers("/favicon.ico", "/health", "/signup", "/", "/tou.html", "/privacy.html", "/robots.txt", "/static/**", "/assets/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated()
                    .and()
                .formLogin()
                    .loginPage("/login")
                    .successHandler(authenticationSuccessHandlerImpl)
                    .permitAll()
                    .and()
                .logout()
                    .permitAll()
                    .and()
                .exceptionHandling()
                    .accessDeniedPage("/login");
        }

        @Override
        protected void configure(AuthenticationManagerBuilder auth) throws Exception {
            auth.userDetailsService(userDetailsService).passwordEncoder(bCryptPasswordEncoder());
        }
    }
}