package com.axisbank.authservice.dto;

public class ForgotPasswordRequest {

    private String customerId;
    private String mobileNumber;

    public ForgotPasswordRequest() {
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
}