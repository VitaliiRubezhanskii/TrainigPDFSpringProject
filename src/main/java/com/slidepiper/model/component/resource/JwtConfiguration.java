package com.slidepiper.model.component.resource;
 
import java.io.UnsupportedEncodingException;

import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;

import lombok.Getter;
 
@Component
@Getter 
public class JwtConfiguration {
  private final String issuer = "${jwt.issuer}";
  private final String secret = "${jwt.secret}";
  private final JWTVerifier jwtVerifier =
      JWT.require(Algorithm.HMAC256(secret))
          .withIssuer(issuer)
          .build();
  
  public JwtConfiguration() throws UnsupportedEncodingException {}
}
