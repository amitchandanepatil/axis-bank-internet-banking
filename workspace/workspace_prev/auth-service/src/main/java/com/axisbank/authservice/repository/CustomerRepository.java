package com.axisbank.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.axisbank.authservice.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Customer findByCustomerId(String customerId);

    Customer findByAccountNumber(String accountNumber);

    Customer findByMobileNumber(String mobileNumber);

    Customer findByPanNumber(String panNumber);

}