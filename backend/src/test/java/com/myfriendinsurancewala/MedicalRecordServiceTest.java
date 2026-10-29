package com.myfriendinsurancewala;

import com.myfriendinsurancewala.dto.MedicalRecordDto;
import com.myfriendinsurancewala.model.RecordCategory;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pure unit tests for MedicalRecordDto and RecordCategory — no Spring context.
 */
class MedicalRecordServiceTest {

    @Test
    void medicalRecordDtoDefaultConstructor() {
        MedicalRecordDto dto = new MedicalRecordDto();
        assertNull(dto.getId());
        assertNull(dto.getCategory());
        assertNull(dto.getTitle());
    }

    @Test
    void medicalRecordDtoSettersAndGetters() {
        MedicalRecordDto dto = new MedicalRecordDto();
        dto.setId(1L);
        dto.setFamilyMemberId(2L);
        dto.setFamilyMemberName("Rajesh Sharma");
        dto.setRelationship("SELF");
        dto.setCategory(RecordCategory.PRESCRIPTION);
        dto.setTitle("Diabetes Prescription");
        dto.setDoctorOrHospitalName("Dr. Mehta Clinic");
        dto.setRecordDate(LocalDate.of(2024, 1, 15));
        dto.setBillAmount(new BigDecimal("500.00"));
        dto.setNotes("Take twice daily");
        dto.setTags("diabetes,insulin");

        assertEquals(1L, dto.getId());
        assertEquals(2L, dto.getFamilyMemberId());
        assertEquals("Rajesh Sharma", dto.getFamilyMemberName());
        assertEquals("SELF", dto.getRelationship());
        assertEquals(RecordCategory.PRESCRIPTION, dto.getCategory());
        assertEquals("Diabetes Prescription", dto.getTitle());
        assertEquals("Dr. Mehta Clinic", dto.getDoctorOrHospitalName());
        assertEquals(LocalDate.of(2024, 1, 15), dto.getRecordDate());
        assertEquals(new BigDecimal("500.00"), dto.getBillAmount());
        assertEquals("Take twice daily", dto.getNotes());
        assertEquals("diabetes,insulin", dto.getTags());
    }

    @Test
    void recordCategoryDisplayNames() {
        assertEquals("Doctor Prescriptions", RecordCategory.PRESCRIPTION.getDisplayName());
        assertEquals("Blood Test & Lab Reports", RecordCategory.LAB_REPORT.getDisplayName());
        assertEquals("X-ray, CT Scan & MRI", RecordCategory.RADIOLOGY.getDisplayName());
        assertEquals("Hospital Admission & Discharge", RecordCategory.HOSPITAL_DISCHARGE.getDisplayName());
        assertEquals("Medical Bills & Receipts", RecordCategory.MEDICAL_BILL.getDisplayName());
        assertEquals("Vaccination Records", RecordCategory.VACCINATION.getDisplayName());
        assertEquals("Allergies & Current Medicines", RecordCategory.ALLERGY_MEDICINE.getDisplayName());
    }

    @Test
    void recordCategoryEnumCount() {
        assertEquals(7, RecordCategory.values().length);
    }

    @Test
    void medicalRecordDtoFileFields() {
        MedicalRecordDto dto = new MedicalRecordDto();
        dto.setOriginalFileName("blood_test.pdf");
        dto.setStoredFileName("uuid-blood_test.pdf");
        dto.setFileContentType("application/pdf");
        dto.setFileSize(102400L);

        assertEquals("blood_test.pdf", dto.getOriginalFileName());
        assertEquals("uuid-blood_test.pdf", dto.getStoredFileName());
        assertEquals("application/pdf", dto.getFileContentType());
        assertEquals(102400L, dto.getFileSize());
    }

    @Test
    void recordCategoryValuesAccessibleByName() {
        assertEquals(RecordCategory.LAB_REPORT, RecordCategory.valueOf("LAB_REPORT"));
        assertEquals(RecordCategory.VACCINATION, RecordCategory.valueOf("VACCINATION"));
    }
}
