package com.slidepiper.repository;

import org.springframework.data.repository.Repository;

import com.slidepiper.model.entity.User;

public interface UserRepository extends Repository<User, Long> {
  User findByEmail(String email);
  User save(User entity);
}
