package com.slidepiper.repository;

import com.slidepiper.model.customer.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {



    Customer save (Customer customer);

    Customer findById(long id);

    Customer findCustomerByEmail(String email);

    @Query("select customers from Customer customers" +
            " where customers.email=:email" +
            " and customers.username=:salesMan")
    Customer findCustomerByEmailAndSalesMan(@Param("salesMan") String salesMan,
                                            @Param("email") String email);

    Customer findCustomerByCustomerId(String customerId);


    Customer findCustomerByCustomerIdAndPhoneNumber(long customerId, String phone);


    @Query("select customer from Customer customer" +
            " where customer.username like CONCAT('%',:salesMan,'%')" +
            "and customer.email not in ('default@example.com','test@example.com')")
    List<Customer> findCustomerBySalesMan(@Param("salesMan") String salesMan);

    @Transactional
    @Modifying
    @Query("delete from Customer customer" +
            " where customer.email=:email" +
            " and customer.username=:salesMan")
    void deleteCustomerByEmailAndSalesMan(@Param("email") String email,
                                          @Param("salesMan") String salesMan);


    @Query("select customer from Customer  customer" +
            " where customer.customerId=:customerId " +
            "and customer.username=:salesMan")
    Customer findCustomerByCustomerIdAndSalesMan(@Param("customerId") String customerId,
                                                    @Param("salesMan") String salesMan);

    @Query("select customer from Customer  customer" +
            " where customer.customerId=:customerId " +
            "and customer.username=:salesMan" +
            " and  customer.email=:email")
    List<Customer> findCustomerByCustomerIdAndEmailAndSalesMan(@Param("customerId") String customerId,
                                                               @Param("email") String email,
                                                               @Param("salesMan") String salesMan);

    @Transactional
    @Modifying
    @Query("update Customer customer set customer.firstName=:firstName," +
            "customer.lastName=:lastName,customer.name=:name,customer.company=:company," +
            "customer.customerGroup=:customerGroup,customer.customerId=:customerId," +
            "customer.phoneNumber=:phoneNumber where customer.username=:username and customer.email=:email")
    void updateCustomer(@Param("firstName") String firstName,@Param("lastName") String lastName,
                        @Param("name") String name, @Param("company") String company,
                        @Param("customerGroup") String customerGroup,
                        @Param("customerId") String customerId, @Param("phoneNumber") String phoneNumber,
                        @Param("username") String username, @Param("email") String email);








}