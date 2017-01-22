package com.slidepiper.model.component;

import java.io.UnsupportedEncodingException;
import java.util.Iterator;
import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator.Builder;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeType;
import com.slidepiper.model.component.resource.JwtConfiguration;

@Component
public class JwtUtils {
  
  private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);
  private static JwtConfiguration jwtConfiguration;
  
  @Autowired
  public JwtUtils(JwtConfiguration jwtConfiguration) {
    JwtUtils.jwtConfiguration = jwtConfiguration;
  }

  public static String create(JsonNode privateClaims) {
    try {
      Builder jwt = JWT.create().withIssuer(JwtUtils.jwtConfiguration.getIssuer());
      
      Iterator<Entry<String, JsonNode>> claimsIterator = privateClaims.fields();
      while (claimsIterator.hasNext()) {
        Entry<String, JsonNode> claim = claimsIterator.next();
        JsonNodeType jsonNodeType = claim.getValue().getNodeType();
        
        switch (jsonNodeType) {
          case BOOLEAN:
            jwt.withClaim(claim.getKey(), claim.getValue().asBoolean());
            break;
          case NUMBER:
            jwt.withClaim(claim.getKey(), claim.getValue().asInt());
            break;
          case STRING:
            jwt.withClaim(claim.getKey(), claim.getValue().asText());
            break;
          default:
            try {
              throw new Exception("Unhandled node type: " + jsonNodeType.name());
            } catch (Exception e) {
              log.error(e.getMessage());
              e.printStackTrace();
            }
            break;
        }
      }
      
      return jwt.sign(Algorithm.HMAC256(JwtUtils.jwtConfiguration.getSecret()));
    } catch (JWTCreationException e) {
      log.error("Invalid Signing configuration / couldn't convert claims");
      e.printStackTrace();
      return null;
    } catch (IllegalArgumentException | UnsupportedEncodingException e) {
      e.printStackTrace();
      return null;
    }
  }

  public static DecodedJWT verify(String token) {
    try {
      return JwtUtils.jwtConfiguration.getJwtVerifier().verify(token);
    } catch (JWTVerificationException e) {
      log.error("Invalid signature / claims");
      e.getStackTrace();
      return null;
    }
  }
}
