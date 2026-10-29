package com.myfriendinsurancewala;

import com.myfriendinsurancewala.dto.EmergencySummaryDto;
import com.myfriendinsurancewala.dto.InsurancePolicyDto;
import com.myfriendinsurancewala.model.ClaimStatus;
import com.myfriendinsurancewala.model.ReminderType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pure unit tests for InsurancePolicyDto, EmergencySummaryDto, ClaimStatus,
 * and ReminderType — no Spring context required.
 */
class InsurancePolicyAndSummaryTest {

    @Test
    void insurancePolicyDtoDefaults() {
        InsurancePolicyDto dto = new InsurancePolicyDto();
        assertTrue(dto.isActive());
        assertEquals(30, dto.getRenewalReminderDays());
        assertFalse(dto.isExpiringSoon());
    }

    @Test
    void insurancePolicyDtoSettersAndGetters() {
        InsurancePolicyDto dto = new InsurancePolicyDto();
        dto.setId(1L);
        dto.setCompanyName("Star Health Insurance");
        dto.setPolicyNumber("SH-2024-001");
        dto.setPolicyholderName("Rajesh Sharma");
        dto.setInsuredMembersSummary("Rajesh Sharma, Sunita Sharma");
        dto.setStartDate(LocalDate.of(2024, 4, 1));
        dto.setExpiryDate(LocalDate.of(2025, 3, 31));
        dto.setSumInsured(new BigDecimal("500000"));
        dto.setRoomRentLimit("1% of sum insured per day");
        dto.setTpaName("MD India");
        dto.setCashlessPortalUrl("https://www.starhealth.in");
        dto.setCustomerCareNumber("1800-425-2255");
        dto.setDaysUntilExpiry(60L);
        dto.setExpiringSoon(false);
        dto.setActive(true);

        assertEquals(1L, dto.getId());
        assertEquals("Star Health Insurance", dto.getCompanyName());
        assertEquals("SH-2024-001", dto.getPolicyNumber());
        assertEquals("Rajesh Sharma", dto.getPolicyholderName());
        assertEquals("Rajesh Sharma, Sunita Sharma", dto.getInsuredMembersSummary());
        assertEquals(LocalDate.of(2024, 4, 1), dto.getStartDate());
        assertEquals(LocalDate.of(2025, 3, 31), dto.getExpiryDate());
        assertEquals(new BigDecimal("500000"), dto.getSumInsured());
        assertEquals("1% of sum insured per day", dto.getRoomRentLimit());
        assertEquals("MD India", dto.getTpaName());
        assertEquals("https://www.starhealth.in", dto.getCashlessPortalUrl());
        assertEquals("1800-425-2255", dto.getCustomerCareNumber());
        assertEquals(60L, dto.getDaysUntilExpiry());
        assertFalse(dto.isExpiringSoon());
        assertTrue(dto.isActive());
    }

    @Test
    void emergencySummaryDtoDefaultDisclaimer() {
        EmergencySummaryDto dto = new EmergencySummaryDto();
        assertNotNull(dto.getDisclaimer());
        assertTrue(dto.getDisclaimer().contains("My Friend Insurancewala"));
        assertNotNull(dto.getGeneratedAt());
    }

    @Test
    void emergencySummaryDtoStoresMedicalInfo() {
        EmergencySummaryDto dto = new EmergencySummaryDto();
        dto.setFamilyMemberId(1L);
        dto.setFullName("Rajesh Sharma");
        dto.setRelationship("SELF");
        dto.setAge(45);
        dto.setGender("Male");
        dto.setBloodGroup("O+");
        dto.setAllergies("Penicillin");
        dto.setChronicConditions("Type 2 Diabetes");
        dto.setOngoingMedications(List.of("Metformin 500mg", "Glipizide 5mg"));
        dto.setRecentPrescriptions(List.of("Crocin 500mg", "Ecosprin 75mg"));
        dto.setClientName("Rajesh Sharma");
        dto.setClientMobile("9876543210");
        dto.setEmergencyContactName("Sunita Sharma");
        dto.setEmergencyContactPhone("9876543211");
        dto.setEmergencyContactRelation("Spouse");

        assertEquals(1L, dto.getFamilyMemberId());
        assertEquals("Rajesh Sharma", dto.getFullName());
        assertEquals("SELF", dto.getRelationship());
        assertEquals(45, dto.getAge());
        assertEquals("Male", dto.getGender());
        assertEquals("O+", dto.getBloodGroup());
        assertEquals("Penicillin", dto.getAllergies());
        assertEquals("Type 2 Diabetes", dto.getChronicConditions());
        assertEquals(2, dto.getOngoingMedications().size());
        assertEquals(2, dto.getRecentPrescriptions().size());
        assertEquals("Sunita Sharma", dto.getEmergencyContactName());
        assertEquals("Spouse", dto.getEmergencyContactRelation());
    }

    @Test
    void emergencySummaryDtoActivePolicies() {
        EmergencySummaryDto dto = new EmergencySummaryDto();
        InsurancePolicyDto policy = new InsurancePolicyDto();
        policy.setCompanyName("Star Health Insurance");
        policy.setSumInsured(new BigDecimal("500000"));
        dto.setActivePolicies(List.of(policy));

        assertEquals(1, dto.getActivePolicies().size());
        assertEquals("Star Health Insurance", dto.getActivePolicies().get(0).getCompanyName());
    }

    @Test
    void claimStatusValues() {
        assertEquals(7, ClaimStatus.values().length);
        assertEquals(ClaimStatus.DRAFT, ClaimStatus.valueOf("DRAFT"));
        assertEquals(ClaimStatus.SUBMITTED, ClaimStatus.valueOf("SUBMITTED"));
        assertEquals(ClaimStatus.APPROVED, ClaimStatus.valueOf("APPROVED"));
        assertEquals(ClaimStatus.SETTLED, ClaimStatus.valueOf("SETTLED"));
        assertEquals(ClaimStatus.REJECTED, ClaimStatus.valueOf("REJECTED"));
        assertEquals(ClaimStatus.UNDER_REVIEW, ClaimStatus.valueOf("UNDER_REVIEW"));
        assertEquals(ClaimStatus.QUERY_RAISED, ClaimStatus.valueOf("QUERY_RAISED"));
    }

    @Test
    void reminderTypeValues() {
        ReminderType[] types = ReminderType.values();
        assertEquals(3, types.length);
        assertEquals(ReminderType.POLICY_RENEWAL, ReminderType.valueOf("POLICY_RENEWAL"));
        assertEquals(ReminderType.APPOINTMENT, ReminderType.valueOf("APPOINTMENT"));
        assertEquals(ReminderType.MEDICINE, ReminderType.valueOf("MEDICINE"));
    }
}
