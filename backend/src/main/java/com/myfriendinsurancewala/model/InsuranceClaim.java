package com.myfriendinsurancewala.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_claims")
public class InsuranceClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "policy_id")
    private InsurancePolicy policy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "family_member_id", nullable = false)
    private FamilyMember patient;

    private String claimReferenceNumber;

    @Column(nullable = false)
    private String hospitalName;

    private LocalDate admissionDate;
    private LocalDate dischargeDate;

    private BigDecimal estimatedAmount;
    private BigDecimal settledAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus claimStatus = ClaimStatus.DRAFT;

    // Document checklist JSON / structured fields
    private boolean hasDischargeSummary = false;
    private boolean hasHospitalBills = false;
    private boolean hasInvestigationReports = false;
    private boolean hasDoctorPrescriptions = false;
    private boolean hasPaymentReceipts = false;
    private boolean hasKycAndCancelledCheque = false;

    @Column(length = 2000)
    private String remarks;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public InsuranceClaim() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public InsurancePolicy getPolicy() { return policy; }
    public void setPolicy(InsurancePolicy policy) { this.policy = policy; }

    public FamilyMember getPatient() { return patient; }
    public void setPatient(FamilyMember patient) { this.patient = patient; }

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
