package com.axisbank.authservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.axisbank.authservice.entity.FixedDeposit;

@Repository
public interface FixedDepositRepository
        extends JpaRepository<FixedDeposit, Long> {

    List<FixedDeposit> findByCustomerIdOrderByOpeningDateDesc(
            String customerId);

    FixedDeposit findByFdAccountNumber(
            String fdAccountNumber);
}