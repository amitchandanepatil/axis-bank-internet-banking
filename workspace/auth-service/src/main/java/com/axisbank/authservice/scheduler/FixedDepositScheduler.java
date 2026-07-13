package com.axisbank.authservice.scheduler;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.axisbank.authservice.entity.Account;
import com.axisbank.authservice.entity.FixedDeposit;
import com.axisbank.authservice.entity.Transaction;
import com.axisbank.authservice.repository.AccountRepository;
import com.axisbank.authservice.repository.FixedDepositRepository;
import com.axisbank.authservice.repository.TransactionRepository;

@Component
public class FixedDepositScheduler {

    @Autowired
    private FixedDepositRepository fixedDepositRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Scheduled(cron = "0 0 1 * * ?")
    public void processMaturedFixedDeposits() {

        List<FixedDeposit> fixedDeposits =
                fixedDepositRepository.findAll();

        for (FixedDeposit fd : fixedDeposits) {

            if (!"ACTIVE".equals(fd.getStatus())) {
                continue;
            }

            if (fd.getMaturityDate()
                    .isAfter(LocalDate.now())) {
                continue;
            }

            Account account =
                    accountRepository
                            .findByAccountNumber(
                                    fd.getLinkedSavingsAccount());

            if (account == null) {
                continue;
            }

            account.setBalance(
                    account.getBalance()
                            + fd.getMaturityAmount());

            accountRepository.save(account);

            Transaction transaction =
                    new Transaction();

            transaction.setTransactionId(
                    "TXN"
                            + UUID.randomUUID()
                                    .toString()
                                    .substring(0, 10)
                                    .toUpperCase());

            transaction.setAccountNumber(
                    account.getAccountNumber());

            transaction.setTransactionType(
                    "CREDIT");

            transaction.setAmount(
                    fd.getMaturityAmount());

            transaction.setDescription(
                    "FD Maturity Credit - "
                            + fd.getFdAccountNumber());

            transaction.setTransactionDate(
                    new Timestamp(
                            System.currentTimeMillis()));

            transactionRepository
                    .save(transaction);

            fd.setStatus("MATURED");

            fixedDepositRepository.save(fd);

            System.out.println(
                    "FD Matured : "
                            + fd.getFdAccountNumber());
        }
    }
}