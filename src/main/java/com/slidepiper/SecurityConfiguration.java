package com.slidepiper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  @Value("${spring.data.rest.basePath}")
  private String basePath;
  
  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
      .headers()
        .frameOptions().disable().and()
      .authorizeRequests()
        .antMatchers(HttpMethod.POST, basePath + Routes.EVENTS).permitAll()
        .antMatchers(basePath + Routes.EVENTS + "/**").denyAll().and()
      .csrf().disable();
  }
}
