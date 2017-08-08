package com.slidepiper.repository;

import com.slidepiper.model.entity.User;
import org.springframework.data.repository.Repository;

public interface UserRepository extends Repository<User, Long> {
    User findByUsername(String username);
    User save(User entity);
}