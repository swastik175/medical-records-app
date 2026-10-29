package com.myfriendinsurancewala.dto;

import com.myfriendinsurancewala.model.ReminderType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ReminderDto {
    private Long id;
    private Long familyMemberId;
    private String familyMemberName;

    @NotNull(message = "Reminder type is required")
    private ReminderType reminderType;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Reminder date is required")
    private LocalDate reminderDate;

    private String reminderTime;
    private String dosageOrFrequency;
    private boolean active = true;

    public ReminderDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFamilyMemberId() { return familyMemberId; }
    public void setFamilyMemberId(Long familyMemberId) { this.familyMemberId = familyMemberId; }

    public String getFamilyMemberName() { return familyMemberName; }
    public void setFamilyMemberName(String familyMemberName) { this.familyMemberName = familyMemberName; }

    public ReminderType getReminderType() { return reminderType; }
    public void setReminderType(ReminderType reminderType) { this.reminderType = reminderType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getReminderDate() { return reminderDate; }
    public void setReminderDate(LocalDate reminderDate) { this.reminderDate = reminderDate; }

    public String getReminderTime() { return reminderTime; }
    public void setReminderTime(String reminderTime) { this.reminderTime = reminderTime; }

    public String getDosageOrFrequency() { return dosageOrFrequency; }
    public void setDosageOrFrequency(String dosageOrFrequency) { this.dosageOrFrequency = dosageOrFrequency; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
