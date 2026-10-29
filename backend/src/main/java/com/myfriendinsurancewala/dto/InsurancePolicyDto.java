package com.myfriendinsurancewala.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class InsurancePolicyDto {
    private Long id;

    @NotBlank(message = "Insurance company name is required")
    private String companyName;

    @NotBlank(message = "Policy number is required")
    private String policyNumber;

    @NotBlank(message = "Policyholder name is required")
    private String policyholderName;

    private String insuredMembersSummary;

    @NotNull(message = "Policy start date is required")
    private LocalDate startDate;

    @NotNull(message = "Policy expiry date is required")
    private LocalDate expiryDate;

    private BigDecimal sumInsured;
    private String roomRentLimit;
    private String tpaName;
    private String cashlessPortalUrl;
    private String customerCareNumber;
    private String policyDocumentFileName;
    private Integer renewalReminderDays = 30;
    private boolean active = true;

    // Derived properties
    private long daysUntilExpiry;
    private boolean isExpiringSoon;

    public InsurancePolicyDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public long getDaysUntilExpiry() { return daysUntilExpiry; }
    public void setDaysUntilExpiry(long daysUntilExpiry) { this.daysUntilExpiry = daysUntilExpiry; }

    public boolean isExpiringSoon() { return isExpiringSoon; }
    public void setExpiringSoon(boolean expiringSoon) { isExpiringSoon = expiringSoon; }
}
