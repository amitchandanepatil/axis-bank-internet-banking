package com.axisbank.authservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.axisbank.authservice.entity.Account;
import com.axisbank.authservice.repository.AccountRepository;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    public Account getAccountByCustomerId(
            String customerId) {

        return accountRepository.findByCustomerId(
                customerId);
    }
}