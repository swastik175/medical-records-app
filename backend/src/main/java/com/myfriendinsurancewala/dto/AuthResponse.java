package com.myfriendinsurancewala.dto;

public class AuthResponse {
    private String token;
    private Long id;
    private String fullName;
    private String mobileNumber;
    private String email;
    private String role;
    private boolean consentGiven;
    private boolean allowAdvisorAccess;
    private boolean mustChangePassword;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String fullName, String mobileNumber, String email, String role,
                        boolean consentGiven, boolean allowAdvisorAccess,
                        String emergencyContactName, String emergencyContactPhone, String emergencyContactRelation) {
        this(token, id, fullName, mobileNumber, email, role, consentGiven, allowAdvisorAccess, false, emergencyContactName, emergencyContactPhone, emergencyContactRelation);
    }

    public AuthResponse(String token, Long id, String fullName, String mobileNumber, String email, String role,
                        boolean consentGiven, boolean allowAdvisorAccess, boolean mustChangePassword,
                        String emergencyContactName, String emergencyContactPhone, String emergencyContactRelation) {
        this.token = token;
        this.id = id;
        this.fullName = fullName;
        this.mobileNumber = mobileNumber;
        this.email = email;
        this.role = role;
        this.consentGiven = consentGiven;
        this.allowAdvisorAccess = allowAdvisorAccess;
        this.mustChangePassword = mustChangePassword;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
        this.emergencyContactRelation = emergencyContactRelation;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isConsentGiven() { return consentGiven; }
    public void setConsentGiven(boolean consentGiven) { this.consentGiven = consentGiven; }

    public boolean isAllowAdvisorAccess() { return allowAdvisorAccess; }
    public void setAllowAdvisorAccess(boolean allowAdvisorAccess) { this.allowAdvisorAccess = allowAdvisorAccess; }

    public boolean isMustChangePassword() { return mustChangePassword; }
    public void setMustChangePassword(boolean mustChangePassword) { this.mustChangePassword = mustChangePassword; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public String getEmergencyContactRelation() { return emergencyContactRelation; }
    public void setEmergencyContactRelation(String emergencyContactRelation) { this.emergencyContactRelation = emergencyContactRelation; }
}
