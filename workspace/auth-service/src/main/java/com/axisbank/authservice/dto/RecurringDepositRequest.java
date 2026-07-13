package com.axisbank.authservice.dto;

public class RecurringDepositRequest {

    private String customerId;
    private String accountNumber;
    private Double monthlyInstallment;
    private Integer tenureMonths;
    private Boolean seniorCitizen;

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public Double getMonthlyInstallment() {
        return monthlyInstallment;
    }

    public void setMonthlyInstallment(
            Double monthlyInstallment) {
        this.monthlyInstallment =
                monthlyInstallment;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(
            Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public Boolean getSeniorCitizen() {
        return seniorCitizen;
    }

    public void setSeniorCitizen(
            Boolean seniorCitizen) {
        this.seniorCitizen =
                seniorCitizen;
    }
}