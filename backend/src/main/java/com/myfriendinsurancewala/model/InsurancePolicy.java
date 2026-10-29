package com.myfriendinsurancewala.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_policies")
public class InsurancePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String policyNumber;

    @Column(nullable = false)
    private String policyholderName;

    @Column(length = 1000)
    private String insuredMembersSummary;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    private BigDecimal sumInsured;

    private String roomRentLimit;

    private String tpaName;

    private String cashlessPortalUrl;

    private String customerCareNumber;

    private String policyDocumentFileName;

    private Integer renewalReminderDays = 30;

    private boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public InsurancePolicy() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }

    public String getPolicyholderName() { return policyholderName; }
    public void setPolicyholderName(String policyholderName) { this.policyholderName = policyholderName; }

    public String getInsuredMembersSummary() { return insuredMembersSummary; }
    public void setInsuredMembersSummary(String insuredMembersSummary) { this.insuredMembersSummary = insuredMembersSummary; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public BigDecimal getSumInsured() { return sumInsured; }
    public void setSumInsured(BigDecimal sumInsured) { this.sumInsured = sumInsured; }

    public String getRoomRentLimit() { return roomRentLimit; }
    public void setRoomRentLimit(String roomRentLimit) { this.roomRentLimit = roomRentLimit; }

    public String getTpaName() { return tpaName; }
    public void setTpaName(String tpaName) { this.tpaName = tpaName; }

    public String getCashlessPortalUrl() { return cashlessPortalUrl; }
    public void setCashlessPortalUrl(String cashlessPortalUrl) { this.cashlessPortalUrl = cashlessPortalUrl; }

    public String getCustomerCareNumber() { return customerCareNumber; }
    public void setCustomerCareNumber(String customerCareNumber) { this.customerCareNumber = customerCareNumber; }

    public String getPolicyDocumentFileName() { return policyDocumentFileName; }
    public void setPolicyDocumentFileName(String policyDocumentFileName) { this.policyDocumentFileName = policyDocumentFileName; }

    public Integer getRenewalReminderDays() { return renewalReminderDays; }
    public void setRenewalReminderDays(Integer renewalReminderDays) { this.renewalReminderDays = renewalReminderDays; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
