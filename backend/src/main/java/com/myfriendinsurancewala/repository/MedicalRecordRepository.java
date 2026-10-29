package com.myfriendinsurancewala.repository;

import com.myfriendinsurancewala.model.FamilyMember;
import com.myfriendinsurancewala.model.MedicalRecord;
import com.myfriendinsurancewala.model.RecordCategory;
import com.myfriendinsurancewala.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByUserOrderByRecordDateDesc(User user);
    List<MedicalRecord> findByUserAndFamilyMemberOrderByRecordDateDesc(User user, FamilyMember familyMember);
    List<MedicalRecord> findByUserAndCategoryOrderByRecordDateDesc(User user, RecordCategory category);
    List<MedicalRecord> findByUserAndFamilyMemberAndCategoryOrderByRecordDateDesc(User user, FamilyMember familyMember, RecordCategory category);
    Optional<MedicalRecord> findByIdAndUser(Long id, User user);
    List<MedicalRecord> findByUserId(Long userId);
}
