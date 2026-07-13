package com.axisbank.authservice.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class FixedDeposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FD Account Number (Separate account like real banking)
    private String fdAccountNumber;

    // Customer CIF
    private String customerId;

    // Savings account from which money is debited
    private String linkedSavingsAccount;

    private double principalAmount;
    private int tenureDays;
    private double interestRate;
    private double maturityAmount;

    private LocalDate openingDate;
    private LocalDate maturityDate;

    // ACTIVE, CLOSED, PREMATURE_CLOSED
    private String status;

    // Closure details
    private LocalDate closureDate;
    private Double closureAmount;
    private Double penaltyRate;
    private String closureType;

    public FixedDeposit() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFdAccountNumber() {
        return fdAccountNumber;
    }

    public void setFdAccountNumber(String fdAccountNumber) {
        this.fdAccountNumber = fdAccountNumber;
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

    public double getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(double principalAmount) {
        this.principalAmount = principalAmount;
    }

    public int getTenureDays() {
        return tenureDays;
    }

    public void setTenureDays(int tenureDays) {
        this.tenureDays = tenureDays;
    }

    public double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(double interestRate) {
        this.interestRate = interestRate;
    }

    public double getMaturityAmount() {
        return maturityAmount;
    }

    public void setMaturityAmount(double maturityAmount) {
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

    public Double getPenaltyRate() {
        return penaltyRate;
    }

    public void setPenaltyRate(Double penaltyRate) {
        this.penaltyRate = penaltyRate;
    }

    public String getClosureType() {
        return closureType;
    }

    public void setClosureType(String closureType) {
        this.closureType = closureType;
    }
}