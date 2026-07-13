package com.axisbank.authservice.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class RecurringDeposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rdAccountNumber;

    private String customerId;

    private String linkedSavingsAccount;

    private Double monthlyInstallment;

    private Integer tenureMonths;

    private Double interestRate;

    private Double maturityAmount;

    private LocalDate openingDate;

    private LocalDate maturityDate;

    private LocalDate nextInstallmentDate;

    private Integer paidInstallments;

    private String status;

    private LocalDate closureDate;

    private Double closureAmount;

    private String closureType;

    public Long getId() {
        return id;
    }

    public String getRdAccountNumber() {
        return rdAccountNumber;
    }

    public void setRdAccountNumber(String rdAccountNumber) {
        this.rdAccountNumber = rdAccountNumber;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getLinkedSavingsAccount() {
        return linkedSavingsAccount;
    }

    public void setLinkedSavingsAccount(String linkedSavingsAccount) {
        this.linkedSavingsAccount = linkedSavingsAccount;
    }

    public Double getMonthlyInstallment() {
        return monthlyInstallment;
    }

    public void setMonthlyInstallment(Double monthlyInstallment) {
        this.monthlyInstallment = monthlyInstallment;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public Double getMaturityAmount() {
        return maturityAmount;
    }

    public void setMaturityAmount(Double maturityAmount) {
        this.maturityAmount = maturityAmount;
    }

    public LocalDate getOpeningDate() {
        return openingDate;
    }

    public void setOpeningDate(LocalDate openingDate) {
        this.openingDate = openingDate;
    }

    public LocalDate getMaturityDate() {
        return maturityDate;
    }

    public void setMaturityDate(LocalDate maturityDate) {
        this.maturityDate = maturityDate;
    }

    public LocalDate getNextInstallmentDate() {
        return nextInstallmentDate;
    }

    public void setNextInstallmentDate(LocalDate nextInstallmentDate) {
        this.nextInstallmentDate = nextInstallmentDate;
    }

    public Integer getPaidInstallments() {
        return paidInstallments;
    }

    public void setPaidInstallments(Integer paidInstallments) {
        this.paidInstallments = paidInstallments;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getClosureDate() {
        return closureDate;
    }

    public void setClosureDate(LocalDate closureDate) {
        this.closureDate = closureDate;
    }

    public Double getClosureAmount() {
        return closureAmount;
    }

    public void setClosureAmount(Double closureAmount) {
        this.closureAmount = closureAmount;
    }

    public String getClosureType() {
        return closureType;
    }

    public void setClosureType(String closureType) {
        this.closureType = closureType;
    }
}