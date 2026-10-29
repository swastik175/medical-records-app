package com.myfriendinsurancewala.service;

import com.myfriendinsurancewala.dto.EmergencySummaryDto;
import com.myfriendinsurancewala.dto.InsurancePolicyDto;
import com.myfriendinsurancewala.exception.ResourceNotFoundException;
import com.myfriendinsurancewala.model.*;
import com.myfriendinsurancewala.repository.FamilyMemberRepository;
import com.myfriendinsurancewala.repository.MedicalRecordRepository;
import com.myfriendinsurancewala.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmergencySummaryService {

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private InsurancePolicyService insurancePolicyService;

    @Autowired
    private AuditService auditService;

    public EmergencySummaryDto generateEmergencySummary(Long familyMemberId, User user, String ipAddress) {
        FamilyMember member = familyMemberRepository.findByIdAndUser(familyMemberId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Family member not found with id: " + familyMemberId));

        EmergencySummaryDto summary = new EmergencySummaryDto();
        summary.setFamilyMemberId(member.getId());
        summary.setFullName(member.getFullName());
        summary.setRelationship(member.getRelationship());
        summary.setDateOfBirth(member.getDateOfBirth());
        summary.setGender(member.getGender());
        summary.setBloodGroup(member.getBloodGroup() != null ? member.getBloodGroup() : "Not Specified");
        summary.setAbhaAddress(member.getAbhaAddress());

        if (member.getDateOfBirth() != null) {
            summary.setAge(Period.between(member.getDateOfBirth(), LocalDate.now()).getYears());
        }

        // Primary client contact & emergency contact
        summary.setClientName(user.getFullName());
        summary.setClientMobile(user.getMobileNumber());
        summary.setEmergencyContactName(user.getEmergencyContactName());
        summary.setEmergencyContactPhone(user.getEmergencyContactPhone());
        summary.setEmergencyContactRelation(user.getEmergencyContactRelation());

        // Allergies & Chronic Conditions
        summary.setAllergies(member.getAllergies() != null && !member.getAllergies().isBlank() ? member.getAllergies() : "None reported");
        summary.setChronicConditions(member.getChronicConditions() != null && !member.getChronicConditions().isBlank() ? member.getChronicConditions() : "None reported");

        // Ongoing Medications (from active medicine reminders)
        List<Reminder> medicineReminders = reminderRepository.findByUserAndReminderTypeOrderByReminderDateAsc(user, ReminderType.MEDICINE);
        List<String> ongoingMeds = new ArrayList<>();
        for (Reminder rem : medicineReminders) {
            if (rem.isActive() && (rem.getFamilyMember() == null || rem.getFamilyMember().getId().equals(member.getId()))) {
                String med = rem.getTitle();
                if (rem.getDosageOrFrequency() != null && !rem.getDosageOrFrequency().isBlank()) {
                    med += " (" + rem.getDosageOrFrequency() + ")";
                }
                ongoingMeds.add(med);
            }
        }
        summary.setOngoingMedications(ongoingMeds);

        // Recent Prescriptions (last 5)
        List<MedicalRecord> prescriptions = medicalRecordRepository.findByUserAndFamilyMemberAndCategoryOrderByRecordDateDesc(user, member, RecordCategory.PRESCRIPTION);
        List<String> prescriptionSummaries = prescriptions.stream()
                .limit(5)
                .map(p -> p.getTitle() + " - " + (p.getDoctorOrHospitalName() != null ? p.getDoctorOrHospitalName() : "Doctor") + " (" + p.getRecordDate() + ")")
                .collect(Collectors.toList());
        summary.setRecentPrescriptions(prescriptionSummaries);

        // Active Insurance Policies
        List<InsurancePolicyDto> policies = insurancePolicyService.getPolicies(user).stream()
                .filter(InsurancePolicyDto::isActive)
                .collect(Collectors.toList());
        summary.setActivePolicies(policies);

        auditService.log(user.getId(), user.getRole(), "GENERATE_EMERGENCY_SUMMARY", "FamilyMember #" + member.getId(), ipAddress, "SUCCESS",
                "Generated summary card for " + member.getFullName());

        return summary;
    }
}
