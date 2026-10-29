package com.myfriendinsurancewala.repository;

import com.myfriendinsurancewala.model.FamilyMember;
import com.myfriendinsurancewala.model.InsuranceClaim;
import com.myfriendinsurancewala.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {
    List<InsuranceClaim> findByUserOrderByCreatedAtDesc(User user);
    Optional<InsuranceClaim> findByIdAndUser(Long id, User user);
    List<InsuranceClaim> findByUserAndPatient(User user, FamilyMember patient);
    List<InsuranceClaim> findByUserId(Long userId);
}
