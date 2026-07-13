package com.axisbank.authservice.service;

import com.axisbank.authservice.dto.ForgotPasswordRequest;
import com.axisbank.authservice.dto.ResetPasswordRequest;
import com.axisbank.authservice.dto.VerifyOtpRequest;
import com.axisbank.authservice.entity.Customer;
import com.axisbank.authservice.entity.PasswordResetOtp;
import com.axisbank.authservice.repository.CustomerRepository;
import com.axisbank.authservice.repository.PasswordResetOtpRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class ForgotPasswordService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_FAILED_ATTEMPTS = 5;

    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile(
                    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"
                            + "(?=.*[!@#$%^&*()_+\\-=\\[\\]{};"
                            + "':\"\\\\|,.<>/?])\\S{8,30}$"
            );

    private final CustomerRepository customerRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom;

    public ForgotPasswordService(
            CustomerRepository customerRepository,
            PasswordResetOtpRepository otpRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.customerRepository = customerRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.secureRandom = new SecureRandom();
    }

    @Transactional
    public String sendOtp(ForgotPasswordRequest request) {

        validateCustomerRequest(
                request.getCustomerId(),
                request.getMobileNumber()
        );

        Customer customer = getRegisteredCustomer(
                request.getCustomerId(),
                request.getMobileNumber()
        );

        otpRepository
                .findTopByCustomerIdAndMobileNumberAndUsedFalseOrderByIdDesc(
                        customer.getCustomerId(),
                        customer.getMobileNumber()
                )
                .ifPresent(existingOtp -> {
                    existingOtp.setUsed(true);
                    otpRepository.save(existingOtp);
                });

        String generatedOtp =
                String.format(
                        "%06d",
                        secureRandom.nextInt(1_000_000)
                );

        PasswordResetOtp passwordResetOtp =
                new PasswordResetOtp();

        passwordResetOtp.setCustomerId(
                customer.getCustomerId()
        );

        passwordResetOtp.setMobileNumber(
                customer.getMobileNumber()
        );

        passwordResetOtp.setOtp(generatedOtp);

        passwordResetOtp.setExpiryTime(
                LocalDateTime.now()
                        .plusMinutes(OTP_EXPIRY_MINUTES)
        );

        passwordResetOtp.setVerified(false);
        passwordResetOtp.setUsed(false);
        passwordResetOtp.setFailedAttempts(0);

        otpRepository.save(passwordResetOtp);

        /*
         * Temporary development implementation.
         * OTP will be printed in the Spring Boot console.
         *
         * Later, we can send it through email or SMS.
         */
        System.out.println(
                "Password reset OTP for customer "
                        + customer.getCustomerId()
                        + " is: "
                        + generatedOtp
        );

        return "OTP generated successfully. Check the backend console.";
    }

    @Transactional
    public String verifyOtp(VerifyOtpRequest request) {

        validateCustomerRequest(
                request.getCustomerId(),
                request.getMobileNumber()
        );

        validateOtpFormat(request.getOtp());

        getRegisteredCustomer(
                request.getCustomerId(),
                request.getMobileNumber()
        );

        PasswordResetOtp passwordResetOtp =
                getLatestActiveOtp(
                        request.getCustomerId(),
                        request.getMobileNumber()
                );

        validateOtpStatus(passwordResetOtp);

        if (!passwordResetOtp
                .getOtp()
                .equals(request.getOtp().trim())) {

            int updatedFailedAttempts =
                    passwordResetOtp.getFailedAttempts() + 1;

            passwordResetOtp.setFailedAttempts(
                    updatedFailedAttempts
            );

            if (updatedFailedAttempts
                    >= MAX_FAILED_ATTEMPTS) {

                passwordResetOtp.setUsed(true);
            }

            otpRepository.save(passwordResetOtp);

            if (updatedFailedAttempts
                    >= MAX_FAILED_ATTEMPTS) {

                throw new IllegalStateException(
                        "Maximum OTP attempts exceeded. "
                                + "Please generate a new OTP."
                );
            }

            throw new IllegalArgumentException(
                    "Invalid OTP. Please enter the correct OTP."
            );
        }

        passwordResetOtp.setVerified(true);

        otpRepository.save(passwordResetOtp);

        return "OTP verified successfully.";
    }

    @Transactional
    public String resetPassword(
            ResetPasswordRequest request
    ) {

        validateCustomerRequest(
                request.getCustomerId(),
                request.getMobileNumber()
        );

        validateOtpFormat(request.getOtp());

        validateNewPassword(
                request.getNewPassword()
        );

        Customer customer = getRegisteredCustomer(
                request.getCustomerId(),
                request.getMobileNumber()
        );

        PasswordResetOtp passwordResetOtp =
                getLatestActiveOtp(
                        request.getCustomerId(),
                        request.getMobileNumber()
                );

        validateOtpStatus(passwordResetOtp);

        if (!passwordResetOtp.isVerified()) {
            throw new IllegalStateException(
                    "Please verify the OTP before resetting "
                            + "the password."
            );
        }

        if (!passwordResetOtp
                .getOtp()
                .equals(request.getOtp().trim())) {

            throw new IllegalArgumentException(
                    "Invalid OTP."
            );
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                customer.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "New password must be different "
                            + "from the old password."
            );
        }

        customer.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        customerRepository.save(customer);

        passwordResetOtp.setUsed(true);

        otpRepository.save(passwordResetOtp);

        return "Password reset successfully.";
    }

    private Customer getRegisteredCustomer(
            String customerId,
            String mobileNumber
    ) {
        return customerRepository
                .findByCustomerIdAndMobileNumber(
                        customerId.trim(),
                        mobileNumber.trim()
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Customer ID and registered "
                                        + "mobile number do not match."
                        )
                );
    }

    private PasswordResetOtp getLatestActiveOtp(
            String customerId,
            String mobileNumber
    ) {
        Optional<PasswordResetOtp> otpOptional =
                otpRepository
                        .findTopByCustomerIdAndMobileNumberAndUsedFalseOrderByIdDesc(
                                customerId.trim(),
                                mobileNumber.trim()
                        );

        return otpOptional.orElseThrow(
                () -> new IllegalArgumentException(
                        "No active OTP found. "
                                + "Please generate a new OTP."
                )
        );
    }

    private void validateOtpStatus(
            PasswordResetOtp passwordResetOtp
    ) {
        if (passwordResetOtp.isUsed()) {
            throw new IllegalStateException(
                    "This OTP has already been used."
            );
        }

        if (passwordResetOtp.getFailedAttempts()
                >= MAX_FAILED_ATTEMPTS) {

            passwordResetOtp.setUsed(true);
            otpRepository.save(passwordResetOtp);

            throw new IllegalStateException(
                    "Maximum OTP attempts exceeded. "
                            + "Please generate a new OTP."
            );
        }

        if (LocalDateTime.now()
                .isAfter(passwordResetOtp.getExpiryTime())) {

            passwordResetOtp.setUsed(true);

            otpRepository.save(passwordResetOtp);

            throw new IllegalStateException(
                    "OTP has expired. "
                            + "Please generate a new OTP."
            );
        }
    }

    private void validateCustomerRequest(
            String customerId,
            String mobileNumber
    ) {
        if (customerId == null
                || customerId.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Customer ID is required."
            );
        }

        if (mobileNumber == null
                || !mobileNumber.trim()
                .matches("^[6-9]\\d{9}$")) {

            throw new IllegalArgumentException(
                    "Enter a valid registered mobile number."
            );
        }
    }

    private void validateOtpFormat(String otp) {
        if (otp == null
                || !otp.trim().matches("\\d{6}")) {

            throw new IllegalArgumentException(
                    "Enter a valid 6-digit OTP."
            );
        }
    }

    private void validateNewPassword(
            String newPassword
    ) {
        if (newPassword == null
                || !PASSWORD_PATTERN
                .matcher(newPassword)
                .matches()) {

            throw new IllegalArgumentException(
                    "Password must contain 8 to 30 characters, "
                            + "including uppercase, lowercase, "
                            + "number and special character, "
                            + "without spaces."
            );
        }
    }
}