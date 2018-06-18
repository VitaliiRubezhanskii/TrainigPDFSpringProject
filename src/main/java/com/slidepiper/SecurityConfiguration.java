package com.slidepiper;

import com.slidepiper.repository.CustomerRepository;
import com.slidepiper.repository.UserRepository;
import com.slidepiper.service.user.AuthenticationSuccessHandlerImpl;
import com.slidepiper.service.user.UserDetailsServiceImpl;
import com.slidepiper.service.viewer.ViewerAuthenticationSuccessHandlerImpl;
import com.slidepiper.service.viewer.ViewerDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

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
                    .antMatchers("/viewer/**", "/utils/**", "/assets/**", "/dist/**")
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
    @Order(2)
    public static class ViewerSecuredConfigurationAdapter extends WebSecurityConfigurerAdapter {
        private final ViewerAuthenticationSuccessHandlerImpl authenticationSuccessHandlerImpl;
        private final CustomerRepository customerRepository;

        @Autowired
        public ViewerSecuredConfigurationAdapter(ViewerAuthenticationSuccessHandlerImpl authenticationSuccessHandlerImpl,
                                                 CustomerRepository customerRepository){
            this.authenticationSuccessHandlerImpl = authenticationSuccessHandlerImpl;
            this.customerRepository = customerRepository;
        }

        @Bean
        public UserDetailsService viewerDetailsService() {
            return new ViewerDetailsServiceImpl();
        }

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http
                    .regexMatcher("/view(/|\\?f=).*?")
                    .authorizeRequests()
                    // Chesk if this portal requires auth
                    .regexMatchers("\\A/view\\?f.*\\Z").access("@permissionEvaluatorForViewer.checkIfAuthRequired(authentication, request)")
                    .antMatchers("/view/verifycode")
                    .authenticated()
                    .and()
                    .formLogin()
                    .loginPage("/view/login")
                    .successHandler(authenticationSuccessHandlerImpl)
                    .permitAll()
                    .and()
                    .logout()
                    .permitAll()
                    .and()
                    .exceptionHandling()
                    .accessDeniedPage("/view/login");
            http.sessionManagement().maximumSessions(1);
        }

        @Override
        protected void configure(AuthenticationManagerBuilder auth) throws Exception {
            auth.userDetailsService(viewerDetailsService()) ;
        }

        @Override
        public void configure(WebSecurity web) throws Exception {
            web.ignoring()
                    .antMatchers("/assets/**");
        }
    }

    @Configuration
    @Order(3)
    public static class ApplicationConfigurationAdapter extends WebSecurityConfigurerAdapter {
        private final AuthenticationSuccessHandlerImpl authenticationSuccessHandlerImpl;
        private final UserRepository userRepository;

        @Autowired
        public ApplicationConfigurationAdapter(AuthenticationSuccessHandlerImpl authenticationSuccessHandlerImpl,
                                               UserRepository userRepository) {
            this.userRepository = userRepository;
            this.authenticationSuccessHandlerImpl = authenticationSuccessHandlerImpl;
        }

        @Bean
        public BCryptPasswordEncoder bCryptPasswordEncoder() {
            return new BCryptPasswordEncoder();
        }

        @Bean
        public UserDetailsService userDetailsService() {
            return new UserDetailsServiceImpl();
        }

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http
                .authorizeRequests()
                    .antMatchers("/favicon.ico", "/health", "/signup", "/", "/index.html", "/tou.html", "/privacy.html", "/robots.txt", "/static/**")
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
            auth.userDetailsService(userDetailsService()).passwordEncoder(bCryptPasswordEncoder());
        }
    }
}