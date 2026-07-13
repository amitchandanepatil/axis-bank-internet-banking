package com.axisbank.authservice.util;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Component;

@Component
public class AccountNumberGenerator {

    private static final String PROJECT_PREFIX = "99";

    private final AtomicLong sequence =
            new AtomicLong(System.currentTimeMillis() % 10000000);

    public String generateAccountNumber(String productCode) {

        String year =
                String.valueOf(LocalDate.now().getYear())
                        .substring(2);

        long nextSequence =
                sequence.incrementAndGet();

        String runningNumber =
                String.format("%07d", nextSequence);

        return PROJECT_PREFIX
                + year
                + productCode
                + runningNumber;
    }

    public String generateSavingsAccountNumber() {
        return generateAccountNumber("01");
    }

    public String generateCurrentAccountNumber() {
        return generateAccountNumber("02");
    }

    public String generateFixedDepositAccountNumber() {
        return generateAccountNumber("04");
    }

    public String generateRecurringDepositAccountNumber() {
        return generateAccountNumber("05");
    }

    public String generateLoanAccountNumber() {
        return generateAccountNumber("06");
    }

    public String generateCreditCardAccountNumber() {
        return generateAccountNumber("07");
    }
}