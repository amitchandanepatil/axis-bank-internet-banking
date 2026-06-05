package com.axisbank.authservice.service;
import com.axisbank.authservice.dto.FundTransferRequest;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.axisbank.authservice.dto.TransactionRequest;
import com.axisbank.authservice.entity.Account;
import com.axisbank.authservice.entity.Transaction;
import com.axisbank.authservice.repository.AccountRepository;
import com.axisbank.authservice.repository.TransactionRepository;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    public List<Transaction> getTransactions(
            String accountNumber) {

        return transactionRepository
                .findByAccountNumberOrderByTransactionDateDesc(
                        accountNumber);
    }

    public String credit(
            TransactionRequest request) {

        Account account =
                accountRepository.findByAccountNumber(
                        request.getAccountNumber());

        if (account == null) {
            return "Account Not Found";
        }

        account.setBalance(
                account.getBalance()
                        + request.getAmount());

        accountRepository.save(account);

        Transaction txn =
                new Transaction();

        txn.setTransactionId(
                UUID.randomUUID()
                        .toString()
                        .substring(0, 10));

        txn.setAccountNumber(
                request.getAccountNumber());

        txn.setTransactionType(
                "CREDIT");

        txn.setAmount(
                request.getAmount());

        txn.setDescription(
                request.getDescription());

        txn.setTransactionDate(
                new Timestamp(
                        System.currentTimeMillis()));

        transactionRepository.save(txn);

        return "Amount Credited Successfully";
    }

    public String debit(
            TransactionRequest request) {

        Account account =
                accountRepository.findByAccountNumber(
                        request.getAccountNumber());

        if (account == null) {
            return "Account Not Found";
        }

        if (account.getBalance()
                < request.getAmount()) {

            return "Insufficient Balance";
        }

        account.setBalance(
                account.getBalance()
                        - request.getAmount());

        accountRepository.save(account);

        Transaction txn =
                new Transaction();

        txn.setTransactionId(
                UUID.randomUUID()
                        .toString()
                        .substring(0, 10));

        txn.setAccountNumber(
                request.getAccountNumber());

        txn.setTransactionType(
                "DEBIT");

        txn.setAmount(
                request.getAmount());

        txn.setDescription(
                request.getDescription());

        txn.setTransactionDate(
                new Timestamp(
                        System.currentTimeMillis()));

        transactionRepository.save(txn);

        return "Amount Debited Successfully";
    }
    public String transfer(
            FundTransferRequest request) {

        Account fromAccount =
                accountRepository.findByAccountNumber(
                        request.getFromAccount());

        Account toAccount =
                accountRepository.findByAccountNumber(
                        request.getToAccount());

        if (fromAccount == null ||
                toAccount == null) {

            return "Invalid Account";
        }

        if (fromAccount.getBalance()
                < request.getAmount()) {

            return "Insufficient Balance";
        }

        fromAccount.setBalance(
                fromAccount.getBalance()
                        - request.getAmount());

        toAccount.setBalance(
                toAccount.getBalance()
                        + request.getAmount());

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        Transaction debitTxn =
                new Transaction();

        debitTxn.setTransactionId(
                "FTD" +
                        System.currentTimeMillis());

        debitTxn.setAccountNumber(
                fromAccount.getAccountNumber());

        debitTxn.setTransactionType(
                "DEBIT");

        debitTxn.setAmount(
                request.getAmount());

        debitTxn.setDescription(
                "Fund Transfer To "
                        + toAccount.getAccountNumber());

        debitTxn.setTransactionDate(
                new java.sql.Timestamp(
                        System.currentTimeMillis()));

        transactionRepository.save(
                debitTxn);

        Transaction creditTxn =
                new Transaction();

        creditTxn.setTransactionId(
                "FTC" +
                        System.currentTimeMillis());

        creditTxn.setAccountNumber(
                toAccount.getAccountNumber());

        creditTxn.setTransactionType(
                "CREDIT");

        creditTxn.setAmount(
                request.getAmount());

        creditTxn.setDescription(
                "Fund Transfer From "
                        + fromAccount.getAccountNumber());

        creditTxn.setTransactionDate(
                new java.sql.Timestamp(
                        System.currentTimeMillis()));

        transactionRepository.save(
                creditTxn);

        return "Fund Transfer Successful";
    }
}