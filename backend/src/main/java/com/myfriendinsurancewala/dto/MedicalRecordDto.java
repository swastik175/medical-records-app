package com.myfriendinsurancewala.dto;

import com.myfriendinsurancewala.model.RecordCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MedicalRecordDto {
    private Long id;

    @NotNull(message = "Family member ID is required")
    private Long familyMemberId;
    private String familyMemberName;
    private String relationship;

    @NotNull(message = "Document category is required")
    private RecordCategory category;

    @NotBlank(message = "Document title is required")
    private String title;

    private String doctorOrHospitalName;

    @NotNull(message = "Record date is required")
    private LocalDate recordDate;

    private String originalFileName;
    private String storedFileName;
    private String fileContentType;
    private Long fileSize;

    private BigDecimal billAmount;
    private String notes;
    private String tags;

    private LocalDateTime createdAt;

    public MedicalRecordDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFamilyMemberId() { return familyMemberId; }
    public void setFamilyMemberId(Long familyMemberId) { this.familyMemberId = familyMemberId; }

    public String getFamilyMemberName() { return familyMemberName; }
    public void setFamilyMemberName(String familyMemberName) { this.familyMemberName = familyMemberName; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public RecordCategory getCategory() { return category; }
    public void setCategory(RecordCategory category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDoctorOrHospitalName() { return doctorOrHospitalName; }
    public void setDoctorOrHospitalName(String doctorOrHospitalName) { this.doctorOrHospitalName = doctorOrHospitalName; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getStoredFileName() { return storedFileName; }
    public void setStoredFileName(String storedFileName) { this.storedFileName = storedFileName; }

    public String getFileContentType() { return fileContentType; }
    public void setFileContentType(String fileContentType) { this.fileContentType = fileContentType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public BigDecimal getBillAmount() { return billAmount; }
    public void setBillAmount(BigDecimal billAmount) { this.billAmount = billAmount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
