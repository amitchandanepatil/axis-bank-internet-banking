package com.axisbank.authservice.controller;
import com.axisbank.authservice.dto.FundTransferRequest;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.axisbank.authservice.dto.TransactionRequest;
import com.axisbank.authservice.entity.Transaction;
import com.axisbank.authservice.service.TransactionService;

@RestController
@RequestMapping("/transaction")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/{accountNumber}")
    public List<Transaction> getTransactions(
            @PathVariable String accountNumber) {

        return transactionService
                .getTransactions(accountNumber);
    }

    @PostMapping("/credit")
    public String credit(
            @RequestBody TransactionRequest request) {

        return transactionService.credit(
                request);
    }

    @PostMapping("/debit")
    public String debit(
            @RequestBody TransactionRequest request) {

        return transactionService.debit(
                request);
    }
    @PostMapping("/transfer")
    public String transfer(
            @RequestBody
            FundTransferRequest request) {

        return transactionService
                .transfer(request);
    }
}