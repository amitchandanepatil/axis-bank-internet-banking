package com.axisbank.authservice.scheduler;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.axisbank.authservice.entity.Account;
import com.axisbank.authservice.entity.RecurringDeposit;
import com.axisbank.authservice.entity.Transaction;
import com.axisbank.authservice.repository.AccountRepository;
import com.axisbank.authservice.repository.RecurringDepositRepository;
import com.axisbank.authservice.repository.TransactionRepository;

@Component
public class RecurringDepositScheduler {

    @Autowired
    private RecurringDepositRepository recurringDepositRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Scheduled(cron = "0 0 1 * * ?")
    public void processRecurringDeposits() {

        List<RecurringDeposit> recurringDeposits =
                recurringDepositRepository.findAll();

        for (RecurringDeposit rd : recurringDeposits) {

            if (!"ACTIVE".equals(rd.getStatus())) {
                continue;
            }

            if (rd.getNextInstallmentDate()
                    .isAfter(LocalDate.now())) {
                continue;
            }

            Account account =
                    accountRepository.findByAccountNumber(
                            rd.getLinkedSavingsAccount());

            if (account == null) {
                continue;
            }

            if (account.getBalance()
                    < rd.getMonthlyInstallment()) {

                System.out.println(
                        "Insufficient balance for RD : "
                                + rd.getRdAccountNumber());

                continue;
            }

            account.setBalance(
                    account.getBalance()
                            - rd.getMonthlyInstallment());

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
                    "DEBIT");

            transaction.setAmount(
                    rd.getMonthlyInstallment());

            transaction.setDescription(
                    "RD Installment Debit - "
                            + rd.getRdAccountNumber());

            transaction.setTransactionDate(
                    new Timestamp(
                            System.currentTimeMillis()));

            transactionRepository.save(
                    transaction);

            rd.setPaidInstallments(
                    rd.getPaidInstallments() + 1);

            rd.setNextInstallmentDate(
                    rd.getNextInstallmentDate()
                            .plusMonths(1));

            if (rd.getPaidInstallments()
                    >= rd.getTenureMonths()) {

                account.setBalance(
                        account.getBalance()
                                + rd.getMaturityAmount());

                accountRepository.save(account);

                Transaction maturityTxn =
                        new Transaction();

                maturityTxn.setTransactionId(
                        "TXN"
                                + UUID.randomUUID()
                                        .toString()
                                        .substring(0, 10)
                                        .toUpperCase());

                maturityTxn.setAccountNumber(
                        account.getAccountNumber());

                maturityTxn.setTransactionType(
                        "CREDIT");

                maturityTxn.setAmount(
                        rd.getMaturityAmount());

                maturityTxn.setDescription(
                        "RD Maturity Credit - "
                                + rd.getRdAccountNumber());

                maturityTxn.setTransactionDate(
                        new Timestamp(
                                System.currentTimeMillis()));

                transactionRepository.save(
                        maturityTxn);

                rd.setStatus("MATURED");
            }

            recurringDepositRepository.save(rd);

            System.out.println(
                    "RD Installment Processed : "
                            + rd.getRdAccountNumber());
        }
    }
}