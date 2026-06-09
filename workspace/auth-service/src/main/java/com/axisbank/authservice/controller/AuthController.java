package com.axisbank.authservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.axisbank.authservice.dto.LoginRequest;
import com.axisbank.authservice.dto.RegistrationRequest;
import com.axisbank.authservice.entity.Customer;
import com.axisbank.authservice.service.AuthService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Customer> login(
            @RequestBody LoginRequest request) {

        Customer customer =
                authService.login(request);

        if (customer != null) {

            return ResponseEntity.ok(customer);
        }

        return ResponseEntity
                .status(401)
                .build();
    }

    @PostMapping("/register")
    public String register(
            @RequestBody RegistrationRequest request) {

        return authService.register(request);
    }
}