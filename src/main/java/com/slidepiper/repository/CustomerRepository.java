package com.slidepiper.repository;

import com.slidepiper.model.entity.Customer;
import org.springframework.data.repository.Repository;

public interface CustomerRepository extends Repository<Customer, Long> {
    Customer findById(long id);
}