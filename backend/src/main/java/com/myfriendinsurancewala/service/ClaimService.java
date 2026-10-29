package com.myfriendinsurancewala.service;

import com.myfriendinsurancewala.dto.ClaimDto;
import com.myfriendinsurancewala.exception.ResourceNotFoundException;
import com.myfriendinsurancewala.model.FamilyMember;
import com.myfriendinsurancewala.model.InsuranceClaim;
import com.myfriendinsurancewala.model.InsurancePolicy;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.repository.FamilyMemberRepository;
import com.myfriendinsurancewala.repository.InsuranceClaimRepository;
import com.myfriendinsurancewala.repository.InsurancePolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    @Autowired
    private InsuranceClaimRepository claimRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private InsurancePolicyRepository policyRepository;

    @Autowired
    private AuditService auditService;

    public List<ClaimDto> getClaims(User user) {
        return claimRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ClaimDto getClaimById(Long id, User user) {
        InsuranceClaim claim = claimRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));
        return mapToDto(claim);
    }

    @Transactional
    public ClaimDto createClaim(ClaimDto dto, User user, String ipAddress) {
        FamilyMember patient = familyMemberRepository.findByIdAndUser(dto.getFamilyMemberId(), user)
                .orElseThrow(() -> new ResourceNotFoundException("Family member not found"));

        InsuranceClaim claim = new InsuranceClaim();
        claim.setUser(user);
        claim.setPatient(patient);
        copyDtoToEntity(dto, claim, user);

        InsuranceClaim saved = claimRepository.save(claim);
        auditService.log(user.getId(), user.getRole(), "CREATE_CLAIM", "Claim #" + saved.getId(), ipAddress, "SUCCESS",
                "Created claim dossier for hospital: " + saved.getHospitalName());

        return mapToDto(saved);
    }

    @Transactional
    public ClaimDto updateClaim(Long id, ClaimDto dto, User user, String ipAddress) {
        InsuranceClaim claim = claimRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        if (dto.getFamilyMemberId() != null && !dto.getFamilyMemberId().equals(claim.getPatient().getId())) {
            FamilyMember patient = familyMemberRepository.findByIdAndUser(dto.getFamilyMemberId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Family member not found"));
            claim.setPatient(patient);
        }

        copyDtoToEntity(dto, claim, user);
        InsuranceClaim updated = claimRepository.save(claim);
        auditService.log(user.getId(), user.getRole(), "UPDATE_CLAIM", "Claim #" + id, ipAddress, "SUCCESS",
                "Updated claim: Status=" + updated.getClaimStatus());

        return mapToDto(updated);
    }

    @Transactional
    public void deleteClaim(Long id, User user, String ipAddress) {
        InsuranceClaim claim = claimRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        claimRepository.delete(claim);
        auditService.log(user.getId(), user.getRole(), "DELETE_CLAIM", "Claim #" + id, ipAddress, "SUCCESS", "Deleted claim");
    }

    private void copyDtoToEntity(ClaimDto dto, InsuranceClaim claim, User user) {
        if (dto.getPolicyId() != null) {
            InsurancePolicy policy = policyRepository.findByIdAndUser(dto.getPolicyId(), user).orElse(null);
            claim.setPolicy(policy);
        }

        claim.setClaimReferenceNumber(dto.getClaimReferenceNumber());
        claim.setHospitalName(dto.getHospitalName());
        claim.setAdmissionDate(dto.getAdmissionDate());
        claim.setDischargeDate(dto.getDischargeDate());
        claim.setEstimatedAmount(dto.getEstimatedAmount());
        claim.setSettledAmount(dto.getSettledAmount());
        if (dto.getClaimStatus() != null) {
            claim.setClaimStatus(dto.getClaimStatus());
        }

        claim.setHasDischargeSummary(dto.isHasDischargeSummary());
        claim.setHasHospitalBills(dto.isHasHospitalBills());
        claim.setHasInvestigationReports(dto.isHasInvestigationReports());
        claim.setHasDoctorPrescriptions(dto.isHasDoctorPrescriptions());
        claim.setHasPaymentReceipts(dto.isHasPaymentReceipts());
        claim.setHasKycAndCancelledCheque(dto.isHasKycAndCancelledCheque());
        claim.setRemarks(dto.getRemarks());
    }

    public ClaimDto mapToDto(InsuranceClaim claim) {
        ClaimDto dto = new ClaimDto();
        dto.setId(claim.getId());
        if (claim.getPolicy() != null) {
            dto.setPolicyId(claim.getPolicy().getId());
            dto.setPolicyNumber(claim.getPolicy().getPolicyNumber());
            dto.setCompanyName(claim.getPolicy().getCompanyName());
        }

        dto.setFamilyMemberId(claim.getPatient().getId());
        dto.setPatientName(claim.getPatient().getFullName());
        dto.setPatientRelationship(claim.getPatient().getRelationship());

        dto.setClaimReferenceNumber(claim.getClaimReferenceNumber());
        dto.setHospitalName(claim.getHospitalName());
        dto.setAdmissionDate(claim.getAdmissionDate());
        dto.setDischargeDate(claim.getDischargeDate());
        dto.setEstimatedAmount(claim.getEstimatedAmount());
        dto.setSettledAmount(claim.getSettledAmount());
        dto.setClaimStatus(claim.getClaimStatus());

        dto.setHasDischargeSummary(claim.isHasDischargeSummary());
        dto.setHasHospitalBills(claim.isHasHospitalBills());
        dto.setHasInvestigationReports(claim.isHasInvestigationReports());
        dto.setHasDoctorPrescriptions(claim.isHasDoctorPrescriptions());
        dto.setHasPaymentReceipts(claim.isHasPaymentReceipts());
        dto.setHasKycAndCancelledCheque(claim.isHasKycAndCancelledCheque());

        dto.setRemarks(claim.getRemarks());
        dto.setCreatedAt(claim.getCreatedAt());
        dto.setUpdatedAt(claim.getUpdatedAt());
        return dto;
    }
}
