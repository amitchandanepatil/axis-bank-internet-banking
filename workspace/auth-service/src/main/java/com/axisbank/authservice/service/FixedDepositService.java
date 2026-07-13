package com.axisbank.authservice.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.axisbank.authservice.dto.FixedDepositRequest;
import com.axisbank.authservice.entity.Account;
import com.axisbank.authservice.entity.FixedDeposit;
import com.axisbank.authservice.entity.Transaction;
import com.axisbank.authservice.repository.AccountRepository;
import com.axisbank.authservice.repository.FixedDepositRepository;
import com.axisbank.authservice.repository.TransactionRepository;
import com.axisbank.authservice.util.AccountNumberGenerator;

@Service
public class FixedDepositService {

    @Autowired
    private FixedDepositRepository fixedDepositRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountNumberGenerator accountNumberGenerator;

    public FixedDeposit openFixedDeposit(FixedDepositRequest request) {

        Account account =
                accountRepository.findByAccountNumber(
                        request.getAccountNumber());

        if (account == null) {
            throw new RuntimeException("Account not found");
        }

        if (request.getPrincipalAmount() == null ||
                request.getPrincipalAmount() < 5000) {
            throw new RuntimeException("Minimum FD amount is ₹5000");
        }

        if (request.getTenureDays() == null ||
                request.getTenureDays() < 7 ||
                request.getTenureDays() > 3650) {
            throw new RuntimeException(
                    "FD tenure must be between 7 days and 10 years");
        }

        if (account.getBalance() < request.getPrincipalAmount()) {
            throw new RuntimeException("Insufficient account balance");
        }

        double interestRate =
                getAxisFdInterestRate(request.getTenureDays());

        if (Boolean.TRUE.equals(request.getSeniorCitizen())) {
            interestRate = interestRate + 0.50;
        }

        double maturityAmount =
                calculateMaturityAmount(
                        request.getPrincipalAmount(),
                        interestRate,
                        request.getTenureDays());

        account.setBalance(
                account.getBalance()
                        - request.getPrincipalAmount());

        accountRepository.save(account);

        FixedDeposit fixedDeposit = new FixedDeposit();

        fixedDeposit.setFdAccountNumber(
                accountNumberGenerator
                        .generateFixedDepositAccountNumber());

        fixedDeposit.setCustomerId(request.getCustomerId());
        fixedDeposit.setLinkedSavingsAccount(request.getAccountNumber());
        fixedDeposit.setPrincipalAmount(request.getPrincipalAmount());
        fixedDeposit.setTenureDays(request.getTenureDays());
        fixedDeposit.setInterestRate(interestRate);
        fixedDeposit.setMaturityAmount(maturityAmount);
        fixedDeposit.setOpeningDate(LocalDate.now());
        fixedDeposit.setMaturityDate(
                LocalDate.now().plusDays(request.getTenureDays()));
        fixedDeposit.setStatus("ACTIVE");

        fixedDeposit.setClosureDate(null);
        fixedDeposit.setClosureAmount(null);
        fixedDeposit.setPenaltyRate(null);
        fixedDeposit.setClosureType(null);

        FixedDeposit savedFd =
                fixedDepositRepository.save(fixedDeposit);

        Transaction transaction = new Transaction();

        transaction.setTransactionId(
                "TXNFD" + System.currentTimeMillis());

        transaction.setAccountNumber(
                account.getAccountNumber());

        transaction.setTransactionType("DEBIT");

        transaction.setAmount(
                savedFd.getPrincipalAmount());

        transaction.setDescription(
                "FD Booking - "
                        + savedFd.getFdAccountNumber());

        transaction.setTransactionDate(
                new Timestamp(System.currentTimeMillis()));

        transactionRepository.save(transaction);

        return savedFd;
    }

    public List<FixedDeposit> getFixedDepositsByCustomer(
            String customerId) {

        return fixedDepositRepository
                .findByCustomerIdOrderByOpeningDateDesc(
                        customerId);
    }

    public FixedDeposit getFixedDepositByFdAccountNumber(
            String fdAccountNumber) {

        return fixedDepositRepository
                .findByFdAccountNumber(fdAccountNumber);
    }

    public FixedDeposit closeFixedDeposit(
            String fdAccountNumber) {

        FixedDeposit fixedDeposit =
                fixedDepositRepository
                        .findByFdAccountNumber(fdAccountNumber);

        if (fixedDeposit == null) {
            throw new RuntimeException("Fixed Deposit not found");
        }

        if (!"ACTIVE".equalsIgnoreCase(
                fixedDeposit.getStatus())) {
            throw new RuntimeException(
                    "Fixed Deposit is already closed");
        }

        Account account =
                accountRepository.findByAccountNumber(
                        fixedDeposit.getLinkedSavingsAccount());

        if (account == null) {
            throw new RuntimeException(
                    "Linked savings account not found");
        }

        LocalDate today = LocalDate.now();

        double closureAmount;
        double penaltyRate = 0.0;
        String closureType;

        if (today.isBefore(fixedDeposit.getMaturityDate())) {

            long completedDays =
                    ChronoUnit.DAYS.between(
                            fixedDeposit.getOpeningDate(),
                            today);

            if (completedDays < 1) {
                completedDays = 1;
            }

            penaltyRate = 1.00;

            double applicableRate =
                    fixedDeposit.getInterestRate()
                            - penaltyRate;

            if (applicableRate < 0) {
                applicableRate = 0;
            }

            closureAmount =
                    calculateMaturityAmount(
                            fixedDeposit.getPrincipalAmount(),
                            applicableRate,
                            (int) completedDays);

            closureType = "PREMATURE";
            fixedDeposit.setStatus("PREMATURE_CLOSED");

        } else {

            closureAmount =
                    fixedDeposit.getMaturityAmount();

            closureType = "MATURITY";
            fixedDeposit.setStatus("CLOSED");
        }

        account.setBalance(
                account.getBalance() + closureAmount);

        accountRepository.save(account);

        fixedDeposit.setClosureDate(today);
        fixedDeposit.setClosureAmount(closureAmount);
        fixedDeposit.setPenaltyRate(penaltyRate);
        fixedDeposit.setClosureType(closureType);

        FixedDeposit savedFd =
                fixedDepositRepository.save(fixedDeposit);

        Transaction transaction = new Transaction();

        transaction.setTransactionId(
                "TXNFD" + System.currentTimeMillis());

        transaction.setAccountNumber(
                account.getAccountNumber());

        transaction.setTransactionType("CREDIT");

        transaction.setAmount(
                savedFd.getClosureAmount());

        transaction.setDescription(
                "FD Closure - "
                        + savedFd.getFdAccountNumber()
                        + " - "
                        + savedFd.getClosureType());

        transaction.setTransactionDate(
                new Timestamp(System.currentTimeMillis()));

        transactionRepository.save(transaction);

        return savedFd;
    }

    private double getAxisFdInterestRate(
            Integer tenureDays) {

        if (tenureDays >= 7 && tenureDays <= 45) {
            return 3.00;
        }

        if (tenureDays >= 46 && tenureDays <= 60) {
            return 4.25;
        }

        if (tenureDays >= 61 && tenureDays <= 90) {
            return 4.50;
        }

        if (tenureDays >= 91 && tenureDays <= 180) {
            return 4.75;
        }

        if (tenureDays >= 181 && tenureDays <= 270) {
            return 5.50;
        }

        if (tenureDays >= 271 && tenureDays <= 364) {
            return 5.75;
        }

        if (tenureDays >= 365 && tenureDays <= 455) {
            return 6.25;
        }

        if (tenureDays >= 456 && tenureDays <= 3650) {
            return 6.45;
        }

        return 3.00;
    }

    private double calculateMaturityAmount(
            Double principalAmount,
            Double interestRate,
            Integer tenureDays) {

        double years = tenureDays / 365.0;

        double maturityAmount =
                principalAmount
                        + (principalAmount
                        * interestRate
                        * years / 100);

        return Math.round(maturityAmount * 100.0) / 100.0;
    }
}