package com.axisbank.authservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.axisbank.authservice.entity.Account;
import com.axisbank.authservice.service.AccountService;

@RestController
@RequestMapping("/account")
@CrossOrigin(origins = "http://localhost:3000")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @GetMapping("/{customerId}")
    public Account getAccount(
            @PathVariable String customerId) {

        return accountService
                .getAccountByCustomerId(
                        customerId);
    }
}