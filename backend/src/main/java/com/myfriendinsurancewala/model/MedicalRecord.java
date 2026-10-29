package com.myfriendinsurancewala.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "family_member_id", nullable = false)
    private FamilyMember familyMember;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecordCategory category;

    @Column(nullable = false)
    private String title;

    private String doctorOrHospitalName;

    @Column(nullable = false)
    private LocalDate recordDate;

    private String originalFileName;
    private String storedFileName;
    private String fileContentType;
    private Long fileSize;

    private BigDecimal billAmount;

    @Column(length = 2000)
    private String notes;

    private String tags;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public MedicalRecord() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public FamilyMember getFamilyMember() { return familyMember; }
    public void setFamilyMember(FamilyMember familyMember) { this.familyMember = familyMember; }

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

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
