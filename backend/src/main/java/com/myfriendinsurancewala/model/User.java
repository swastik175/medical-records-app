package com.myfriendinsurancewala.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true, length = 15)
    private String mobileNumber;

    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "ROLE_CLIENT";

    @Column(name = "must_change_password", columnDefinition = "boolean default false")
    private boolean mustChangePassword = false;

    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;

    @Column(nullable = false)
    private boolean consentGiven = false;

    private LocalDateTime consentTimestamp;
    private String consentVersion = "1.0";

    // Advisor authorization toggle: Client must explicitly opt in to let My Friend Insurancewala assist with claims
    @Column(nullable = false)
    private boolean allowAdvisorAccess = false;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public User() {}

    public User(String fullName, String mobileNumber, String email, String password, boolean consentGiven) {
        this.fullName = fullName;
        this.mobileNumber = mobileNumber;
        this.email = email;
        this.password = password;
        this.consentGiven = consentGiven;
        if (consentGiven) {
            this.consentTimestamp = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isMustChangePassword() { return mustChangePassword; }
    public void setMustChangePassword(boolean mustChangePassword) { this.mustChangePassword = mustChangePassword; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public String getEmergencyContactRelation() { return emergencyContactRelation; }
    public void setEmergencyContactRelation(String emergencyContactRelation) { this.emergencyContactRelation = emergencyContactRelation; }

    public boolean isConsentGiven() { return consentGiven; }
    public void setConsentGiven(boolean consentGiven) {
        this.consentGiven = consentGiven;
        if (consentGiven && this.consentTimestamp == null) {
            this.consentTimestamp = LocalDateTime.now();
        }
    }

    public LocalDateTime getConsentTimestamp() { return consentTimestamp; }
    public void setConsentTimestamp(LocalDateTime consentTimestamp) { this.consentTimestamp = consentTimestamp; }

    public String getConsentVersion() { return consentVersion; }
    public void setConsentVersion(String consentVersion) { this.consentVersion = consentVersion; }

    public boolean isAllowAdvisorAccess() { return allowAdvisorAccess; }
    public void setAllowAdvisorAccess(boolean allowAdvisorAccess) { this.allowAdvisorAccess = allowAdvisorAccess; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
