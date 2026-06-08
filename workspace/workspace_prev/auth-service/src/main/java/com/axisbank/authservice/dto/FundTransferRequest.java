package com.axisbank.authservice.dto;

public class FundTransferRequest {

    private String fromAccount;

    private String toAccount;

    private Double amount;

    private String remarks;

    public String getFromAccount() {
        return fromAccount;
    }

    public void setFromAccount(
            String fromAccount) {
        this.fromAccount = fromAccount;
    }

    public String getToAccount() {
        return toAccount;
    }

    public void setToAccount(
            String toAccount) {
        this.toAccount = toAccount;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(
            Double amount) {
        this.amount = amount;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(
            String remarks) {
        this.remarks = remarks;
    }
}