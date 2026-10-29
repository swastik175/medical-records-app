package com.myfriendinsurancewala.service;

import com.myfriendinsurancewala.dto.FamilyMemberDto;
import com.myfriendinsurancewala.exception.ResourceNotFoundException;
import com.myfriendinsurancewala.model.FamilyMember;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.repository.FamilyMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FamilyMemberService {

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private AuditService auditService;

    public List<FamilyMemberDto> getFamilyMembers(User user) {
        return familyMemberRepository.findByUserOrderByRelationshipAscFullNameAsc(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public FamilyMemberDto getFamilyMemberById(Long id, User user) {
        FamilyMember member = familyMemberRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Family member not found with id: " + id));
        return mapToDto(member);
    }

    @Transactional
    public FamilyMemberDto createFamilyMember(FamilyMemberDto dto, User user, String ipAddress) {
        FamilyMember member = new FamilyMember();
        member.setUser(user);
        copyDtoToEntity(dto, member);

        FamilyMember saved = familyMemberRepository.save(member);
        auditService.log(user.getId(), user.getRole(), "CREATE_FAMILY_MEMBER", "FamilyMember #" + saved.getId(), ipAddress, "SUCCESS", "Added " + saved.getFullName());

        return mapToDto(saved);
    }

    @Transactional
    public FamilyMemberDto updateFamilyMember(Long id, FamilyMemberDto dto, User user, String ipAddress) {
        FamilyMember member = familyMemberRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Family member not found with id: " + id));

        copyDtoToEntity(dto, member);
        FamilyMember updated = familyMemberRepository.save(member);
        auditService.log(user.getId(), user.getRole(), "UPDATE_FAMILY_MEMBER", "FamilyMember #" + id, ipAddress, "SUCCESS", "Updated " + updated.getFullName());

        return mapToDto(updated);
    }

    @Transactional
    public void deleteFamilyMember(Long id, User user, String ipAddress) {
        FamilyMember member = familyMemberRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Family member not found with id: " + id));

        familyMemberRepository.delete(member);
        auditService.log(user.getId(), user.getRole(), "DELETE_FAMILY_MEMBER", "FamilyMember #" + id, ipAddress, "SUCCESS", "Deleted family member");
    }

    private void copyDtoToEntity(FamilyMemberDto dto, FamilyMember member) {
        member.setFullName(dto.getFullName());
        member.setDateOfBirth(dto.getDateOfBirth());
        member.setGender(dto.getGender());
        member.setRelationship(dto.getRelationship());
        member.setBloodGroup(dto.getBloodGroup());
        member.setAllergies(dto.getAllergies());
        member.setChronicConditions(dto.getChronicConditions());
        member.setAbhaAddress(dto.getAbhaAddress());
    }

    public FamilyMemberDto mapToDto(FamilyMember member) {
        FamilyMemberDto dto = new FamilyMemberDto();
        dto.setId(member.getId());
        dto.setFullName(member.getFullName());
        dto.setDateOfBirth(member.getDateOfBirth());
        dto.setGender(member.getGender());
        dto.setRelationship(member.getRelationship());
        dto.setBloodGroup(member.getBloodGroup());
        dto.setAllergies(member.getAllergies());
        dto.setChronicConditions(member.getChronicConditions());
        dto.setAbhaAddress(member.getAbhaAddress());
        return dto;
    }
}
