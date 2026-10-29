package com.myfriendinsurancewala.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class EmergencySummaryDto {
    private Long familyMemberId;
    private String fullName;
    private String relationship;
    private LocalDate dateOfBirth;
    private Integer age;
    private String gender;
    private String bloodGroup;
    private String abhaAddress;

    private String clientName;
    private String clientMobile;

    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;

    private String allergies;
    private String chronicConditions;

    private List<String> ongoingMedications;
    private List<String> recentPrescriptions;
    private List<InsurancePolicyDto> activePolicies;

    private LocalDateTime generatedAt = LocalDateTime.now();
    private String disclaimer = "This Emergency Health Summary is generated via My Family Medical Records by My Friend Insurancewala for hospital visits and doctor reference. It does not replace medical advice.";

    public EmergencySummaryDto() {}

    public Long getFamilyMemberId() { return familyMemberId; }
    public void setFamilyMemberId(Long familyMemberId) { this.familyMemberId = familyMemberId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getAbhaAddress() { return abhaAddress; }
    public void setAbhaAddress(String abhaAddress) { this.abhaAddress = abhaAddress; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getClientMobile() { return clientMobile; }
    public void setClientMobile(String clientMobile) { this.clientMobile = clientMobile; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public String getEmergencyContactRelation() { return emergencyContactRelation; }
    public void setEmergencyContactRelation(String emergencyContactRelation) { this.emergencyContactRelation = emergencyContactRelation; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public String getChronicConditions() { return chronicConditions; }
    public void setChronicConditions(String chronicConditions) { this.chronicConditions = chronicConditions; }

    public List<String> getOngoingMedications() { return ongoingMedications; }
    public void setOngoingMedications(List<String> ongoingMedications) { this.ongoingMedications = ongoingMedications; }

    public List<String> getRecentPrescriptions() { return recentPrescriptions; }
    public void setRecentPrescriptions(List<String> recentPrescriptions) { this.recentPrescriptions = recentPrescriptions; }

    public List<InsurancePolicyDto> getActivePolicies() { return activePolicies; }
    public void setActivePolicies(List<InsurancePolicyDto> activePolicies) { this.activePolicies = activePolicies; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
