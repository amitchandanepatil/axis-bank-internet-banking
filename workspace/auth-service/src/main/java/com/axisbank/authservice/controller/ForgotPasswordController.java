package com.axisbank.authservice.controller;

import com.axisbank.authservice.dto.ForgotPasswordRequest;
import com.axisbank.authservice.dto.ResetPasswordRequest;
import com.axisbank.authservice.dto.VerifyOtpRequest;
import com.axisbank.authservice.service.ForgotPasswordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/forgot-password")
@CrossOrigin(origins = "http://localhost:3000")
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    public ForgotPasswordController(
            ForgotPasswordService forgotPasswordService
    ) {
        this.forgotPasswordService = forgotPasswordService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(
            @RequestBody ForgotPasswordRequest request
    ) {
        return ResponseEntity.ok(
                forgotPasswordService.sendOtp(request)
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @RequestBody VerifyOtpRequest request
    ) {
        return ResponseEntity.ok(
                forgotPasswordService.verifyOtp(request)
        );
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordRequest request
    ) {
        return ResponseEntity.ok(
                forgotPasswordService.resetPassword(request)
        );
    }
}