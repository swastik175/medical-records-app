package com.myfriendinsurancewala.service;

import com.myfriendinsurancewala.dto.MedicalRecordDto;
import com.myfriendinsurancewala.exception.ResourceNotFoundException;
import com.myfriendinsurancewala.exception.UnauthorizedAccessException;
import com.myfriendinsurancewala.model.FamilyMember;
import com.myfriendinsurancewala.model.MedicalRecord;
import com.myfriendinsurancewala.model.RecordCategory;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.repository.FamilyMemberRepository;
import com.myfriendinsurancewala.repository.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AuditService auditService;

    public List<MedicalRecordDto> getMedicalRecords(User user, Long familyMemberId, RecordCategory category) {
        List<MedicalRecord> records;

        if (familyMemberId != null && category != null) {
            FamilyMember member = familyMemberRepository.findByIdAndUser(familyMemberId, user)
                    .orElseThrow(() -> new ResourceNotFoundException("Family member not found"));
            records = medicalRecordRepository.findByUserAndFamilyMemberAndCategoryOrderByRecordDateDesc(user, member, category);
        } else if (familyMemberId != null) {
            FamilyMember member = familyMemberRepository.findByIdAndUser(familyMemberId, user)
                    .orElseThrow(() -> new ResourceNotFoundException("Family member not found"));
            records = medicalRecordRepository.findByUserAndFamilyMemberOrderByRecordDateDesc(user, member);
        } else if (category != null) {
            records = medicalRecordRepository.findByUserAndCategoryOrderByRecordDateDesc(user, category);
        } else {
            records = medicalRecordRepository.findByUserOrderByRecordDateDesc(user);
        }

        return records.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public MedicalRecordDto getMedicalRecordById(Long id, User user) {
        MedicalRecord record = medicalRecordRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with id: " + id));
        return mapToDto(record);
    }

    @Transactional
    public MedicalRecordDto createMedicalRecord(MedicalRecordDto dto, MultipartFile file, User user, String ipAddress) {
        FamilyMember member = familyMemberRepository.findByIdAndUser(dto.getFamilyMemberId(), user)
                .orElseThrow(() -> new ResourceNotFoundException("Family member not found with id: " + dto.getFamilyMemberId()));

        MedicalRecord record = new MedicalRecord();
        record.setUser(user);
        record.setFamilyMember(member);
        record.setCategory(dto.getCategory());
        record.setTitle(dto.getTitle());
        record.setDoctorOrHospitalName(dto.getDoctorOrHospitalName());
        record.setRecordDate(dto.getRecordDate());
        record.setBillAmount(dto.getBillAmount());
        record.setNotes(dto.getNotes());
        record.setTags(dto.getTags());

        if (file != null && !file.isEmpty()) {
            String storedFileName = fileStorageService.storeFile(file);
            record.setStoredFileName(storedFileName);
            record.setOriginalFileName(file.getOriginalFilename());
            record.setFileContentType(file.getContentType());
            record.setFileSize(file.getSize());
        }

        MedicalRecord saved = medicalRecordRepository.save(record);
        auditService.log(user.getId(), user.getRole(), "UPLOAD_RECORD", "Record #" + saved.getId(), ipAddress, "SUCCESS",
                "Uploaded " + saved.getCategory() + ": " + saved.getTitle());

        return mapToDto(saved);
    }

    public Resource downloadRecordDocument(Long recordId, User user, String ipAddress) {
        MedicalRecord record;

        // Check if user is owner or an authorized advisor
        if (user.getRole().equals("ROLE_ADVISOR") || user.getRole().equals("ROLE_ADMIN")) {
            record = medicalRecordRepository.findById(recordId)
                    .orElseThrow(() -> new ResourceNotFoundException("Record not found"));
            if (!record.getUser().isAllowAdvisorAccess()) {
                auditService.log(user.getId(), user.getRole(), "ADVISOR_ACCESS_DENIED", "Record #" + recordId, ipAddress, "DENIED",
                        "Client has not granted advisor authorization");
                throw new UnauthorizedAccessException("Client has not authorized advisor access to medical records.");
            }
        } else {
            record = medicalRecordRepository.findByIdAndUser(recordId, user)
                    .orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        }

        if (record.getStoredFileName() == null) {
            throw new ResourceNotFoundException("No document attached to this medical record.");
        }

        auditService.log(user.getId(), user.getRole(), "DOWNLOAD_DOCUMENT", "Record #" + recordId, ipAddress, "SUCCESS",
                "Downloaded file " + record.getOriginalFileName());

        return fileStorageService.loadFileAsResource(record.getStoredFileName());
    }

    @Transactional
    public void deleteMedicalRecord(Long id, User user, String ipAddress) {
        MedicalRecord record = medicalRecordRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with id: " + id));

        if (record.getStoredFileName() != null) {
            fileStorageService.deleteFile(record.getStoredFileName());
        }

        medicalRecordRepository.delete(record);
        auditService.log(user.getId(), user.getRole(), "DELETE_RECORD", "Record #" + id, ipAddress, "SUCCESS", "Deleted medical record");
    }

    public MedicalRecordDto mapToDto(MedicalRecord record) {
        MedicalRecordDto dto = new MedicalRecordDto();
        dto.setId(record.getId());
        dto.setFamilyMemberId(record.getFamilyMember().getId());
        dto.setFamilyMemberName(record.getFamilyMember().getFullName());
        dto.setRelationship(record.getFamilyMember().getRelationship());
        dto.setCategory(record.getCategory());
        dto.setTitle(record.getTitle());
        dto.setDoctorOrHospitalName(record.getDoctorOrHospitalName());
        dto.setRecordDate(record.getRecordDate());
        dto.setOriginalFileName(record.getOriginalFileName());
        dto.setStoredFileName(record.getStoredFileName());
        dto.setFileContentType(record.getFileContentType());
        dto.setFileSize(record.getFileSize());
        dto.setBillAmount(record.getBillAmount());
        dto.setNotes(record.getNotes());
        dto.setTags(record.getTags());
        dto.setCreatedAt(record.getCreatedAt());
        return dto;
    }
}
