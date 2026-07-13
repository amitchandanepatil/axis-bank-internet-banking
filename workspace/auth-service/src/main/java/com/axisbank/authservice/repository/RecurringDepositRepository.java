package com.axisbank.authservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.axisbank.authservice.entity.RecurringDeposit;

@Repository
public interface RecurringDepositRepository
        extends JpaRepository<RecurringDeposit, Long> {

    List<RecurringDeposit> findByCustomerIdOrderByOpeningDateDesc(
            String customerId);

    RecurringDeposit findByRdAccountNumber(
            String rdAccountNumber);
}