package com.slidepiper.repository;

import com.slidepiper.model.customer.Customer;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerRepository extends Repository<Customer, Long> {
    Customer findById(long id);

    Customer findCustomerByEmail(String email);

    Customer findCustomerByCustomerId(String customerId);

    Customer findCustomerByCustomerIdAndPhoneNumber(long customerId, String phone);

    @Query("select customer from Customer customer" +
            " where customer.username like CONCAT('%',:salesMan,'%')" +
            "and customer.email not in ('default@example.com','test@example.com')")
    List<Customer> findCustomerBySalesMan(@Param("salesMan") String salesMan);
}