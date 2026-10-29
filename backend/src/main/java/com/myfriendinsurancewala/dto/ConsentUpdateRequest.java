package com.myfriendinsurancewala.dto;

public class ConsentUpdateRequest {
    private Boolean consentGiven;
    private Boolean allowAdvisorAccess;

    public ConsentUpdateRequest() {}

    public Boolean getConsentGiven() { return consentGiven; }
    public void setConsentGiven(Boolean consentGiven) { this.consentGiven = consentGiven; }

    public Boolean getAllowAdvisorAccess() { return allowAdvisorAccess; }
    public void setAllowAdvisorAccess(Boolean allowAdvisorAccess) { this.allowAdvisorAccess = allowAdvisorAccess; }
}
