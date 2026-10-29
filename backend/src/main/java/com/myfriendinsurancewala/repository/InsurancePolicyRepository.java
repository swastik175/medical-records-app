package com.myfriendinsurancewala.repository;

import com.myfriendinsurancewala.model.InsurancePolicy;
import com.myfriendinsurancewala.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy, Long> {
    List<InsurancePolicy> findByUserOrderByExpiryDateAsc(User user);
    Optional<InsurancePolicy> findByIdAndUser(Long id, User user);
    List<InsurancePolicy> findByUserAndActiveTrueOrderByExpiryDateAsc(User user);
    List<InsurancePolicy> findByUserAndExpiryDateBetween(User user, LocalDate from, LocalDate to);
    List<InsurancePolicy> findByUserId(Long userId);
}
