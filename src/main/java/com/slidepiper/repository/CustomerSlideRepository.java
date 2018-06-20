package com.slidepiper.repository;


import com.slidepiper.model.customer.CustomerSlide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CustomerSlideRepository extends JpaRepository<CustomerSlide,Integer> {

    @Query("select customerSlide from  CustomerSlide customerSlide where customerSlide.email=:customerMail")
    List<CustomerSlide> getCustomerSlideByCustomerMail(@Param("customerMail") String customerMail);

    @Transactional
    @Modifying
    @Query("delete from CustomerSlide customerSlide where customerSlide.email=:customerMail")
    void deleteByCustomerEmail(@Param("customerMail")String customerMail);






}
