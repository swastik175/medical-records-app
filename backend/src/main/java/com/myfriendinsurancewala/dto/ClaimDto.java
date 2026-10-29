package com.myfriendinsurancewala.dto;

import com.myfriendinsurancewala.model.ClaimStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ClaimDto {
    private Long id;
    private Long policyId;
    private String policyNumber;
    private String companyName;

    @NotNull(message = "Patient family member ID is required")
    private Long familyMemberId;
    private String patientName;
    private String patientRelationship;

    private String claimReferenceNumber;

    @NotBlank(message = "Hospital name is required")
    private String hospitalName;

    private LocalDate admissionDate;
    private LocalDate dischargeDate;

    private BigDecimal estimatedAmount;
    private BigDecimal settledAmount;

    private ClaimStatus claimStatus = ClaimStatus.DRAFT;

    private boolean hasDischargeSummary;
    private boolean hasHospitalBills;
    private boolean hasInvestigationReports;
    private boolean hasDoctorPrescriptions;
    private boolean hasPaymentReceipts;
    private boolean hasKycAndCancelledCheque;

    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ClaimDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPolicyId() { return policyId; }
    public void setPolicyId(Long policyId) { this.policyId = policyId; }

    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Long getFamilyMemberId() { return familyMemberId; }
    public void setFamilyMemberId(Long familyMemberId) { this.familyMemberId = familyMemberId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientRelationship() { return patientRelationship; }
    public void setPatientRelationship(String patientRelationship) { this.patientRelationship = patientRelationship; }

    public String getClaimReferenceNumber() { return claimReferenceNumber; }
    public void setClaimReferenceNumber(String claimReferenceNumber) { this.claimReferenceNumber = claimReferenceNumber; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public LocalDate getAdmissionDate() { return admissionDate; }
    public void setAdmissionDate(LocalDate admissionDate) { this.admissionDate = admissionDate; }

    public LocalDate getDischargeDate() { return dischargeDate; }
    public void setDischargeDate(LocalDate dischargeDate) { this.dischargeDate = dischargeDate; }

    public BigDecimal getEstimatedAmount() { return estimatedAmount; }
    public void setEstimatedAmount(BigDecimal estimatedAmount) { this.estimatedAmount = estimatedAmount; }

    public BigDecimal getSettledAmount() { return settledAmount; }
    public void setSettledAmount(BigDecimal settledAmount) { this.settledAmount = settledAmount; }

    public ClaimStatus getClaimStatus() { return claimStatus; }
    public void setClaimStatus(ClaimStatus claimStatus) { this.claimStatus = claimStatus; }

    public boolean isHasDischargeSummary() { return hasDischargeSummary; }
    public void setHasDischargeSummary(boolean hasDischargeSummary) { this.hasDischargeSummary = hasDischargeSummary; }

    public boolean isHasHospitalBills() { return hasHospitalBills; }
    public void setHasHospitalBills(boolean hasHospitalBills) { this.hasHospitalBills = hasHospitalBills; }

    public boolean isHasInvestigationReports() { return hasInvestigationReports; }
    public void setHasInvestigationReports(boolean hasInvestigationReports) { this.hasInvestigationReports = hasInvestigationReports; }

    public boolean isHasDoctorPrescriptions() { return hasDoctorPrescriptions; }
    public void setHasDoctorPrescriptions(boolean hasDoctorPrescriptions) { this.hasDoctorPrescriptions = hasDoctorPrescriptions; }

    public boolean isHasPaymentReceipts() { return hasPaymentReceipts; }
    public void setHasPaymentReceipts(boolean hasPaymentReceipts) { this.hasPaymentReceipts = hasPaymentReceipts; }

    public boolean isHasKycAndCancelledCheque() { return hasKycAndCancelledCheque; }
    public void setHasKycAndCancelledCheque(boolean hasKycAndCancelledCheque) { this.hasKycAndCancelledCheque = hasKycAndCancelledCheque; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
