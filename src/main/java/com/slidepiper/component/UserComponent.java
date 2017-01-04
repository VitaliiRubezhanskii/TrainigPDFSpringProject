package com.slidepiper.component;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.slidepiper.model.entity.User;
import com.slidepiper.model.repository.UserRepository;

@Component
public class UserComponent {
  
  private static UserRepository userRepository;
  
  @Autowired
  public UserComponent(UserRepository userRepository) {
    UserComponent.userRepository = userRepository;
  }
  
  public static User findUser(String email) {
    return userRepository.findByEmail(email);
  }
  
  public static void updateUser(User user) {
    userRepository.save(user);
  }
}
