package com.slidepiper.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

import com.slidepiper.Routes;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  @Value("${spring.data.rest.basePath}")
  private String basePath;
  
  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
      .authorizeRequests()
        .antMatchers(HttpMethod.POST, basePath + Routes.USER_EVENTS).permitAll()
        .antMatchers(basePath + Routes.USER_EVENTS + "/**").denyAll()
      .and()
        .csrf().disable();
  }
}
