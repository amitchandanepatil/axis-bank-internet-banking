package com.axisbank.authservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.axisbank.authservice.dto.RecurringDepositRequest;
import com.axisbank.authservice.entity.RecurringDeposit;
import com.axisbank.authservice.service.RecurringDepositService;

@RestController
@RequestMapping("/rd")
@CrossOrigin(origins = "http://localhost:3000")
public class RecurringDepositController {

    @Autowired
    private RecurringDepositService recurringDepositService;

    @PostMapping("/open")
    public RecurringDeposit openRecurringDeposit(
            @RequestBody RecurringDepositRequest request) {

        return recurringDepositService.openRecurringDeposit(request);
    }

    @GetMapping("/customer/{customerId}")
    public List<RecurringDeposit> getRecurringDepositsByCustomer(
            @PathVariable String customerId) {

        return recurringDepositService.getRecurringDepositsByCustomer(customerId);
    }

    @GetMapping("/{rdAccountNumber}")
    public RecurringDeposit getRecurringDepositByRdAccountNumber(
            @PathVariable String rdAccountNumber) {

        return recurringDepositService.getRecurringDepositByRdAccountNumber(rdAccountNumber);
    }

    @GetMapping("/receipt/{rdAccountNumber}")
    public ResponseEntity<byte[]> downloadReceipt(
            @PathVariable String rdAccountNumber) throws Exception {

        byte[] pdf = recurringDepositService.generateReceipt(rdAccountNumber);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=RD_Receipt_" + rdAccountNumber + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PutMapping("/close/{rdAccountNumber}")
    public RecurringDeposit closeRecurringDeposit(
            @PathVariable String rdAccountNumber) {

        return recurringDepositService.closeRecurringDeposit(rdAccountNumber);
    }
}