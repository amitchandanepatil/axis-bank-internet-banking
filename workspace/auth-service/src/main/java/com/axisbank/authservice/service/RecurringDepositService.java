package com.axisbank.authservice.service;

import java.io.ByteArrayOutputStream;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.axisbank.authservice.dto.RecurringDepositRequest;
import com.axisbank.authservice.entity.Account;
import com.axisbank.authservice.entity.RecurringDeposit;
import com.axisbank.authservice.entity.Transaction;
import com.axisbank.authservice.repository.AccountRepository;
import com.axisbank.authservice.repository.RecurringDepositRepository;
import com.axisbank.authservice.repository.TransactionRepository;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;

@Service
public class RecurringDepositService {

    @Autowired
    private RecurringDepositRepository recurringDepositRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public RecurringDeposit openRecurringDeposit(RecurringDepositRequest request) {

        Account account = accountRepository.findByAccountNumber(request.getAccountNumber());

        if (account == null) {
            throw new RuntimeException("Savings account not found");
        }

        if (request.getMonthlyInstallment() == null || request.getMonthlyInstallment() < 500) {
            throw new RuntimeException("Minimum monthly installment is Rs. 500");
        }

        if (request.getTenureMonths() == null || request.getTenureMonths() < 12) {
            throw new RuntimeException("Minimum RD tenure is 12 months");
        }

        if (account.getBalance() < request.getMonthlyInstallment()) {
            throw new RuntimeException("Insufficient account balance");
        }

        double interestRate = getInterestRate(
                request.getTenureMonths(),
                request.getSeniorCitizen());

        double maturityAmount = calculateMaturityAmount(
                request.getMonthlyInstallment(),
                request.getTenureMonths(),
                interestRate);

        account.setBalance(account.getBalance() - request.getMonthlyInstallment());
        accountRepository.save(account);

        RecurringDeposit rd = new RecurringDeposit();

        rd.setRdAccountNumber(generateRdAccountNumber());
        rd.setCustomerId(request.getCustomerId());
        rd.setLinkedSavingsAccount(request.getAccountNumber());
        rd.setMonthlyInstallment(request.getMonthlyInstallment());
        rd.setTenureMonths(request.getTenureMonths());
        rd.setInterestRate(interestRate);
        rd.setMaturityAmount(maturityAmount);
        rd.setOpeningDate(LocalDate.now());
        rd.setMaturityDate(LocalDate.now().plusMonths(request.getTenureMonths()));
        rd.setNextInstallmentDate(LocalDate.now().plusMonths(1));
        rd.setPaidInstallments(1);
        rd.setStatus("ACTIVE");

        RecurringDeposit savedRd = recurringDepositRepository.save(rd);

        Transaction transaction = new Transaction();
        transaction.setTransactionId("TXNRD" + System.currentTimeMillis());
        transaction.setAccountNumber(account.getAccountNumber());
        transaction.setTransactionType("DEBIT");
        transaction.setAmount(savedRd.getMonthlyInstallment());
        transaction.setDescription("RD Opening Installment Debit - " + savedRd.getRdAccountNumber());
        transaction.setTransactionDate(new Timestamp(System.currentTimeMillis()));

        transactionRepository.save(transaction);

        return savedRd;
    }

    public List<RecurringDeposit> getRecurringDepositsByCustomer(String customerId) {
        return recurringDepositRepository
                .findByCustomerIdOrderByOpeningDateDesc(customerId);
    }

    public RecurringDeposit getRecurringDepositByRdAccountNumber(String rdAccountNumber) {
        return recurringDepositRepository.findByRdAccountNumber(rdAccountNumber);
    }

    public RecurringDeposit closeRecurringDeposit(String rdAccountNumber) {

        RecurringDeposit rd = recurringDepositRepository.findByRdAccountNumber(rdAccountNumber);

        if (rd == null) {
            throw new RuntimeException("Recurring Deposit not found");
        }

        if (!"ACTIVE".equals(rd.getStatus())) {
            throw new RuntimeException("RD is already closed or matured");
        }

        Account account = accountRepository.findByAccountNumber(rd.getLinkedSavingsAccount());

        if (account == null) {
            throw new RuntimeException("Linked savings account not found");
        }

        double totalPaid = rd.getMonthlyInstallment() * rd.getPaidInstallments();

        double interest = (totalPaid * rd.getInterestRate() * rd.getPaidInstallments()) / (12 * 100);

        double penalty = totalPaid * 0.01;

        double closureAmount = Math.round((totalPaid + interest - penalty) * 100.0) / 100.0;

        account.setBalance(account.getBalance() + closureAmount);
        accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setTransactionId("TXNRDCLOSE" + System.currentTimeMillis());
        transaction.setAccountNumber(account.getAccountNumber());
        transaction.setTransactionType("CREDIT");
        transaction.setAmount(closureAmount);
        transaction.setDescription("RD Premature Closure Credit - " + rd.getRdAccountNumber());
        transaction.setTransactionDate(new Timestamp(System.currentTimeMillis()));

        transactionRepository.save(transaction);

        rd.setStatus("PREMATURE_CLOSED");
        rd.setClosureDate(LocalDate.now());
        rd.setClosureAmount(closureAmount);
        rd.setClosureType("PREMATURE_CLOSED");

        return recurringDepositRepository.save(rd);
    }

    public byte[] generateReceipt(String rdAccountNumber) throws Exception {

        RecurringDeposit rd = recurringDepositRepository.findByRdAccountNumber(rdAccountNumber);

        if (rd == null) {
            throw new RuntimeException("Recurring Deposit not found");
        }

        Document document = new Document();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        PdfWriter.getInstance(document, outputStream);
        document.open();

        Font titleFont = new Font(
                Font.FontFamily.HELVETICA,
                20,
                Font.BOLD,
                new BaseColor(151, 20, 77));

        Font headingFont = new Font(
                Font.FontFamily.HELVETICA,
                14,
                Font.BOLD,
                new BaseColor(151, 20, 77));

        Font normalFont = new Font(
                Font.FontFamily.HELVETICA,
                12,
                Font.NORMAL);

        Paragraph bankName = new Paragraph("AXIS BANK LIMITED", titleFont);
        bankName.setAlignment(Element.ALIGN_CENTER);
        document.add(bankName);

        Paragraph title = new Paragraph("Recurring Deposit Receipt", headingFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        document.add(new Paragraph(" "));
        document.add(new Paragraph("This receipt confirms successful creation of Recurring Deposit.", normalFont));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("RD Account Number : " + rd.getRdAccountNumber(), normalFont));
        document.add(new Paragraph("Customer ID : " + rd.getCustomerId(), normalFont));
        document.add(new Paragraph("Linked Savings Account : " + rd.getLinkedSavingsAccount(), normalFont));
        document.add(new Paragraph("Monthly Installment : Rs. " + rd.getMonthlyInstallment(), normalFont));
        document.add(new Paragraph("Interest Rate : " + rd.getInterestRate() + "%", normalFont));
        document.add(new Paragraph("Tenure : " + rd.getTenureMonths() + " Months", normalFont));
        document.add(new Paragraph("Paid Installments : " + rd.getPaidInstallments(), normalFont));
        document.add(new Paragraph("Opening Date : " + rd.getOpeningDate(), normalFont));
        document.add(new Paragraph("Next Installment Date : " + rd.getNextInstallmentDate(), normalFont));
        document.add(new Paragraph("Maturity Date : " + rd.getMaturityDate(), normalFont));
        document.add(new Paragraph("Maturity Amount : Rs. " + rd.getMaturityAmount(), normalFont));
        document.add(new Paragraph("Status : " + rd.getStatus(), normalFont));

        if (rd.getClosureDate() != null) {
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Closure Details", headingFont));
            document.add(new Paragraph("Closure Date : " + rd.getClosureDate(), normalFont));
            document.add(new Paragraph("Closure Amount : Rs. " + rd.getClosureAmount(), normalFont));
            document.add(new Paragraph("Closure Type : " + rd.getClosureType(), normalFont));
        }

        document.add(new Paragraph(" "));
        document.add(new Paragraph("------------------------------------------------------------"));
        document.add(new Paragraph("This is a system generated receipt.", normalFont));

        Paragraph footer = new Paragraph("AXIS BANK LIMITED", headingFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();

        return outputStream.toByteArray();
    }

    private String generateRdAccountNumber() {

        Random random = new Random();
        StringBuilder rdNumber = new StringBuilder("99");

        rdNumber.append("26");
        rdNumber.append("05");

        while (rdNumber.length() < 13) {
            rdNumber.append(random.nextInt(10));
        }

        return rdNumber.toString();
    }

    private double getInterestRate(Integer tenureMonths, Boolean seniorCitizen) {

        double rate;

        if (tenureMonths <= 12) {
            rate = 6.25;
        } else if (tenureMonths <= 24) {
            rate = 6.75;
        } else if (tenureMonths <= 60) {
            rate = 7.00;
        } else {
            rate = 6.75;
        }

        if (Boolean.TRUE.equals(seniorCitizen)) {
            rate = rate + 0.50;
        }

        return rate;
    }

    private double calculateMaturityAmount(
            Double monthlyInstallment,
            Integer tenureMonths,
            Double interestRate) {

        double monthlyRate =
                interestRate / 12 / 100;

        double maturityAmount = 0;

        for (int month = 1; month <= tenureMonths; month++) {

            int remainingMonths =
                    tenureMonths - month + 1;

            maturityAmount =
                    maturityAmount
                            + monthlyInstallment
                            * Math.pow(
                                    1 + monthlyRate,
                                    remainingMonths);
        }

        return Math.round(maturityAmount * 100.0) / 100.0;
    }
}