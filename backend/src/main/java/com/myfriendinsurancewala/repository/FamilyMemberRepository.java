package com.myfriendinsurancewala.repository;

import com.myfriendinsurancewala.model.FamilyMember;
import com.myfriendinsurancewala.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    List<FamilyMember> findByUserOrderByRelationshipAscFullNameAsc(User user);
    Optional<FamilyMember> findByIdAndUser(Long id, User user);
    List<FamilyMember> findByUserId(Long userId);
}
