package com.slidepiper.model.component;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.slidepiper.model.entity.User;
import com.slidepiper.repository.UserRepository;

@Component
public class UserUtils {
  
  private static UserRepository userRepository;
  
  @Autowired
  public UserUtils(UserRepository userRepository) {
    UserUtils.userRepository = userRepository;
  }
  
  public static User findUser(String email) {
    return userRepository.findByEmail(email);
  }
  
  public static void updateUser(User user) {
    userRepository.save(user);
  }
}
