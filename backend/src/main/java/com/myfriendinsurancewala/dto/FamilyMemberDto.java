package com.myfriendinsurancewala.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class FamilyMemberDto {
    private Long id;

    @NotBlank(message = "Family member name is required")
    private String fullName;

    private LocalDate dateOfBirth;
    private String gender;

    @NotBlank(message = "Relationship is required")
    private String relationship;

    private String bloodGroup;
    private String allergies;
    private String chronicConditions;
    private String abhaAddress;

    public FamilyMemberDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public String getChronicConditions() { return chronicConditions; }
    public void setChronicConditions(String chronicConditions) { this.chronicConditions = chronicConditions; }

    public String getAbhaAddress() { return abhaAddress; }
    public void setAbhaAddress(String abhaAddress) { this.abhaAddress = abhaAddress; }
}
