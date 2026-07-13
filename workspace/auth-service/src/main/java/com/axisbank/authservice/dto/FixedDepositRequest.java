package com.axisbank.authservice.dto;

public class FixedDepositRequest {

    private String customerId;

    private String accountNumber;

    private Double principalAmount;

    private Integer tenureDays;

    private Boolean seniorCitizen;

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(
            String customerId) {
        this.customerId = customerId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(
            String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public Double getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(
            Double principalAmount) {
        this.principalAmount = principalAmount;
    }

    public Integer getTenureDays() {
        return tenureDays;
    }

    public void setTenureDays(
            Integer tenureDays) {
        this.tenureDays = tenureDays;
    }

    public Boolean getSeniorCitizen() {
        return seniorCitizen;
    }

    public void setSeniorCitizen(
            Boolean seniorCitizen) {
        this.seniorCitizen = seniorCitizen;
    }
}