package com.axisbank.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.axisbank.authservice.entity.Account;

public interface AccountRepository
        extends JpaRepository<Account, Long> {

    Account findByCustomerId(
            String customerId);

    Account findByAccountNumber(
            String accountNumber);
}