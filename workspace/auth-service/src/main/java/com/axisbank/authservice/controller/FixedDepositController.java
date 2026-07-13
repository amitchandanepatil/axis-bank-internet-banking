package com.axisbank.authservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.axisbank.authservice.dto.FixedDepositRequest;
import com.axisbank.authservice.entity.FixedDeposit;
import com.axisbank.authservice.service.FixedDepositService;
import com.axisbank.authservice.service.PdfService;

@RestController
@RequestMapping("/fd")
@CrossOrigin(origins = "http://localhost:3000")
public class FixedDepositController {

    @Autowired
    private FixedDepositService fixedDepositService;

    @Autowired
    private PdfService pdfService;

    @PostMapping("/open")
    public FixedDeposit openFixedDeposit(
            @RequestBody FixedDepositRequest request) {

        return fixedDepositService
                .openFixedDeposit(request);
    }

    @GetMapping("/customer/{customerId}")
    public List<FixedDeposit> getFixedDepositsByCustomer(
            @PathVariable String customerId) {

        return fixedDepositService
                .getFixedDepositsByCustomer(customerId);
    }

    @GetMapping("/{fdAccountNumber}")
    public FixedDeposit getFixedDepositByFdAccountNumber(
            @PathVariable String fdAccountNumber) {

        return fixedDepositService
                .getFixedDepositByFdAccountNumber(
                        fdAccountNumber);
    }

    @PutMapping("/close/{fdAccountNumber}")
    public FixedDeposit closeFixedDeposit(
            @PathVariable String fdAccountNumber) {

        return fixedDepositService
                .closeFixedDeposit(
                        fdAccountNumber);
    }

    @GetMapping("/receipt/{fdAccountNumber}")
    public ResponseEntity<byte[]> downloadFdReceipt(
            @PathVariable String fdAccountNumber) {

        FixedDeposit fd =
                fixedDepositService
                        .getFixedDepositByFdAccountNumber(
                                fdAccountNumber);

        byte[] pdf =
                pdfService.generateFdReceipt(fd);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=FD_Receipt_"
                                + fdAccountNumber
                                + ".pdf")
                .contentType(
                        MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}