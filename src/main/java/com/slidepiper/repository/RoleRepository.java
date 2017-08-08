package com.slidepiper.repository;

import com.slidepiper.model.entity.Role;
import org.springframework.data.repository.Repository;

public interface RoleRepository extends Repository<Role, Long> {
    Role findByName(String name);
}