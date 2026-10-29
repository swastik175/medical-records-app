package com.myfriendinsurancewala.service;

import com.myfriendinsurancewala.dto.InsurancePolicyDto;
import com.myfriendinsurancewala.exception.ResourceNotFoundException;
import com.myfriendinsurancewala.model.InsurancePolicy;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.repository.InsurancePolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InsurancePolicyService {

    @Autowired
    private InsurancePolicyRepository policyRepository;

    @Autowired
    private AuditService auditService;

    public List<InsurancePolicyDto> getPolicies(User user) {
        return policyRepository.findByUserOrderByExpiryDateAsc(user)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public InsurancePolicyDto getPolicyById(Long id, User user) {
        InsurancePolicy policy = policyRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance policy not found with id: " + id));
        return mapToDto(policy);
    }

    @Transactional
    public InsurancePolicyDto createPolicy(InsurancePolicyDto dto, User user, String ipAddress) {
        InsurancePolicy policy = new InsurancePolicy();
        policy.setUser(user);
        copyDtoToEntity(dto, policy);

        InsurancePolicy saved = policyRepository.save(policy);
        auditService.log(user.getId(), user.getRole(), "CREATE_POLICY", "Policy #" + saved.getId(), ipAddress, "SUCCESS",
                "Created policy " + saved.getPolicyNumber() + " (" + saved.getCompanyName() + ")");

        return mapToDto(saved);
    }

    @Transactional
    public InsurancePolicyDto updatePolicy(Long id, InsurancePolicyDto dto, User user, String ipAddress) {
        InsurancePolicy policy = policyRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance policy not found with id: " + id));

        copyDtoToEntity(dto, policy);
        InsurancePolicy updated = policyRepository.save(policy);
        auditService.log(user.getId(), user.getRole(), "UPDATE_POLICY", "Policy #" + id, ipAddress, "SUCCESS",
                "Updated policy " + updated.getPolicyNumber());

        return mapToDto(updated);
    }

    @Transactional
    public void deletePolicy(Long id, User user, String ipAddress) {
        InsurancePolicy policy = policyRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance policy not found with id: " + id));

        policyRepository.delete(policy);
        auditService.log(user.getId(), user.getRole(), "DELETE_POLICY", "Policy #" + id, ipAddress, "SUCCESS", "Deleted policy");
    }

    private void copyDtoToEntity(InsurancePolicyDto dto, InsurancePolicy policy) {
        policy.setCompanyName(dto.getCompanyName());
        policy.setPolicyNumber(dto.getPolicyNumber());
        policy.setPolicyholderName(dto.getPolicyholderName());
        policy.setInsuredMembersSummary(dto.getInsuredMembersSummary());
        policy.setStartDate(dto.getStartDate());
        policy.setExpiryDate(dto.getExpiryDate());
        policy.setSumInsured(dto.getSumInsured());
        policy.setRoomRentLimit(dto.getRoomRentLimit());
        policy.setTpaName(dto.getTpaName());
        policy.setCashlessPortalUrl(dto.getCashlessPortalUrl());
        policy.setCustomerCareNumber(dto.getCustomerCareNumber());
        policy.setRenewalReminderDays(dto.getRenewalReminderDays() != null ? dto.getRenewalReminderDays() : 30);
        policy.setActive(dto.isActive());
    }

    public InsurancePolicyDto mapToDto(InsurancePolicy policy) {
        InsurancePolicyDto dto = new InsurancePolicyDto();
        dto.setId(policy.getId());
        dto.setCompanyName(policy.getCompanyName());
        dto.setPolicyNumber(policy.getPolicyNumber());
        dto.setPolicyholderName(policy.getPolicyholderName());
        dto.setInsuredMembersSummary(policy.getInsuredMembersSummary());
        dto.setStartDate(policy.getStartDate());
        dto.setExpiryDate(policy.getExpiryDate());
        dto.setSumInsured(policy.getSumInsured());
        dto.setRoomRentLimit(policy.getRoomRentLimit());
        dto.setTpaName(policy.getTpaName());
        dto.setCashlessPortalUrl(policy.getCashlessPortalUrl());
        dto.setCustomerCareNumber(policy.getCustomerCareNumber());
        dto.setPolicyDocumentFileName(policy.getPolicyDocumentFileName());
        dto.setRenewalReminderDays(policy.getRenewalReminderDays());
        dto.setActive(policy.isActive());

        long daysUntilExpiry = ChronoUnit.DAYS.between(LocalDate.now(), policy.getExpiryDate());
        dto.setDaysUntilExpiry(daysUntilExpiry);
        dto.setExpiringSoon(daysUntilExpiry <= policy.getRenewalReminderDays() && daysUntilExpiry >= 0);

        return dto;
    }
}
