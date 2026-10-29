package com.myfriendinsurancewala.config;

import com.myfriendinsurancewala.model.*;
import com.myfriendinsurancewala.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private InsurancePolicyRepository insurancePolicyRepository;

    @Autowired
    private InsuranceClaimRepository insuranceClaimRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByMobileNumber("9876543210").isPresent()) {
            return; // Data already initialized
        }

        // 1. Create Demo Client User
        User client = new User();
        client.setFullName("Rajesh Sharma");
        client.setMobileNumber("9876543210");
        client.setEmail("rajesh.sharma@example.com");
        client.setPassword(passwordEncoder.encode("Password@123"));
        client.setRole("ROLE_CLIENT");
        client.setEmergencyContactName("Sunita Sharma");
        client.setEmergencyContactPhone("9876543211");
        client.setEmergencyContactRelation("Spouse");
        client.setConsentGiven(true);
        client.setConsentTimestamp(LocalDateTime.now());
        client.setConsentVersion("1.0");
        client.setAllowAdvisorAccess(true); // Authorized My Friend Insurancewala Advisor
        User savedClient = userRepository.save(client);

        // 2. Create Family Profiles
        FamilyMember self = new FamilyMember(savedClient, "Rajesh Sharma", LocalDate.of(1984, 5, 14), "Male", "SELF", "O+");
        self.setAllergies("Penicillin");
        self.setChronicConditions("Mild Hypertension");
        self.setAbhaAddress("rajesh.sharma@abdm");
        FamilyMember savedSelf = familyMemberRepository.save(self);

        FamilyMember spouse = new FamilyMember(savedClient, "Sunita Sharma", LocalDate.of(1987, 8, 22), "Female", "SPOUSE", "B+");
        spouse.setAllergies("None");
        spouse.setChronicConditions("None");
        spouse.setAbhaAddress("sunita.sharma@abdm");
        FamilyMember savedSpouse = familyMemberRepository.save(spouse);

        FamilyMember child = new FamilyMember(savedClient, "Aarav Sharma", LocalDate.of(2014, 11, 5), "Male", "SON", "O+");
        child.setAllergies("Peanuts");
        child.setChronicConditions("None");
        familyMemberRepository.save(child);

        FamilyMember father = new FamilyMember(savedClient, "Ramesh Sharma", LocalDate.of(1955, 3, 10), "Male", "FATHER", "A+");
        father.setAllergies("Sulfa Drugs");
        father.setChronicConditions("Type 2 Diabetes, Mild Osteoarthritis");
        father.setAbhaAddress("ramesh.sharma55@abdm");
        FamilyMember savedFather = familyMemberRepository.save(father);

        // 3. Create Sample Medical Records
        MedicalRecord rec1 = new MedicalRecord();
        rec1.setUser(savedClient);
        rec1.setFamilyMember(savedSelf);
        rec1.setCategory(RecordCategory.PRESCRIPTION);
        rec1.setTitle("Prescription for Hypertension Maintenance");
        rec1.setDoctorOrHospitalName("Dr. Arvind Mehta, Max Healthcare");
        rec1.setRecordDate(LocalDate.now().minusDays(20));
        rec1.setNotes("Telmisartan 40mg once daily in morning. Follow-up in 3 months.");
        rec1.setTags("BP, Cardiology, Maintenance");
        medicalRecordRepository.save(rec1);

        MedicalRecord rec2 = new MedicalRecord();
        rec2.setUser(savedClient);
        rec2.setFamilyMember(savedSelf);
        rec2.setCategory(RecordCategory.LAB_REPORT);
        rec2.setTitle("Complete Blood Count (CBC) & Lipid Profile");
        rec2.setDoctorOrHospitalName("Dr. Lal PathLabs");
        rec2.setRecordDate(LocalDate.now().minusDays(18));
        rec2.setNotes("Cholesterol levels within normal limits. Hemoglobin: 14.8 g/dL.");
        rec2.setTags("CBC, Lipid, Annual");
        medicalRecordRepository.save(rec2);

        MedicalRecord rec3 = new MedicalRecord();
        rec3.setUser(savedClient);
        rec3.setFamilyMember(savedFather);
        rec3.setCategory(RecordCategory.RADIOLOGY);
        rec3.setTitle("Bilateral Knee Joint X-Ray (AP & Lateral)");
        rec3.setDoctorOrHospitalName("Apollo Diagnostics Imaging");
        rec3.setRecordDate(LocalDate.now().minusDays(45));
        rec3.setNotes("Mild reduction in medial joint space, suggestive of early degenerative osteoarthritis.");
        rec3.setTags("X-Ray, Ortho, Joint");
        medicalRecordRepository.save(rec3);

        MedicalRecord rec4 = new MedicalRecord();
        rec4.setUser(savedClient);
        rec4.setFamilyMember(savedSelf);
        rec4.setCategory(RecordCategory.HOSPITAL_DISCHARGE);
        rec4.setTitle("Hospital Discharge Summary - Day Care Knee Arthroscopy");
        rec4.setDoctorOrHospitalName("Fortis Hospital, Mohali");
        rec4.setRecordDate(LocalDate.now().minusDays(60));
        rec4.setNotes("Elective arthroscopic meniscus trim. Uneventful recovery. Advised physiotherapist exercises.");
        rec4.setTags("Discharge, Surgery, DayCare");
        medicalRecordRepository.save(rec4);

        MedicalRecord rec5 = new MedicalRecord();
        rec5.setUser(savedClient);
        rec5.setFamilyMember(savedSelf);
        rec5.setCategory(RecordCategory.MEDICAL_BILL);
        rec5.setTitle("Fortis Hospital Final Inpatient Bill & Pharmacy Breakup");
        rec5.setDoctorOrHospitalName("Fortis Hospital Billing Desk");
        rec5.setRecordDate(LocalDate.now().minusDays(60));
        rec5.setBillAmount(new BigDecimal("78500.00"));
        rec5.setNotes("Receipt #FHL-2026-90812 paid in full via debit card.");
        rec5.setTags("Bill, Hospital, Receipt");
        medicalRecordRepository.save(rec5);

        MedicalRecord rec6 = new MedicalRecord();
        rec6.setUser(savedClient);
        rec6.setFamilyMember(savedFather);
        rec6.setCategory(RecordCategory.ALLERGY_MEDICINE);
        rec6.setTitle("Allergy Alert: Sulfa Drugs & Current Diabetes Medicines");
        rec6.setDoctorOrHospitalName("Medanta Clinic");
        rec6.setRecordDate(LocalDate.now().minusDays(10));
        rec6.setNotes("Severe rash with Bactrim/Septran in past. Currently on Metformin 500mg BD.");
        rec6.setTags("Allergy, Chronic, Metformin");
        medicalRecordRepository.save(rec6);

        // 4. Create Insurance Policies
        InsurancePolicy policy1 = new InsurancePolicy();
        policy1.setUser(savedClient);
        policy1.setCompanyName("Star Health & Allied Insurance");
        policy1.setPolicyNumber("STAR-COM-2026-88912");
        policy1.setPolicyholderName("Rajesh Sharma");
        policy1.setInsuredMembersSummary("Rajesh Sharma, Sunita Sharma, Aarav Sharma");
        policy1.setStartDate(LocalDate.now().minusMonths(6));
        policy1.setExpiryDate(LocalDate.now().plusMonths(6));
        policy1.setSumInsured(new BigDecimal("1000000.00"));
        policy1.setRoomRentLimit("No Capping / Single Private Room");
        policy1.setTpaName("In-House Star Health TPA");
        policy1.setCashlessPortalUrl("https://www.starhealth.in/network-hospitals");
        policy1.setCustomerCareNumber("1800 425 2255");
        policy1.setRenewalReminderDays(30);
        policy1.setActive(true);
        InsurancePolicy savedPolicy1 = insurancePolicyRepository.save(policy1);

        InsurancePolicy policy2 = new InsurancePolicy();
        policy2.setUser(savedClient);
        policy2.setCompanyName("Care Health Insurance (Senior Shield)");
        policy2.setPolicyNumber("CARE-SR-2026-44391");
        policy2.setPolicyholderName("Rajesh Sharma");
        policy2.setInsuredMembersSummary("Ramesh Sharma (Father)");
        policy2.setStartDate(LocalDate.now().minusMonths(11));
        policy2.setExpiryDate(LocalDate.now().plusDays(28)); // Expiring soon to demonstrate alert!
        policy2.setSumInsured(new BigDecimal("500000.00"));
        policy2.setRoomRentLimit("1% of Sum Insured per day");
        policy2.setTpaName("Care Health Insurance TPA");
        policy2.setCashlessPortalUrl("https://www.careinsurance.com/find-hospital.html");
        policy2.setCustomerCareNumber("1800 102 4488");
        policy2.setRenewalReminderDays(30);
        policy2.setActive(true);
        insurancePolicyRepository.save(policy2);

        // 5. Create Sample Insurance Claim Dossier
        InsuranceClaim claim = new InsuranceClaim();
        claim.setUser(savedClient);
        claim.setPolicy(savedPolicy1);
        claim.setPatient(savedSelf);
        claim.setClaimReferenceNumber("STAR-CLM-2026-00451");
        claim.setHospitalName("Fortis Hospital, Mohali");
        claim.setAdmissionDate(LocalDate.now().minusDays(62));
        claim.setDischargeDate(LocalDate.now().minusDays(60));
        claim.setEstimatedAmount(new BigDecimal("78500.00"));
        claim.setSettledAmount(new BigDecimal("74200.00"));
        claim.setClaimStatus(ClaimStatus.SETTLED);
        claim.setHasDischargeSummary(true);
        claim.setHasHospitalBills(true);
        claim.setHasInvestigationReports(true);
        claim.setHasDoctorPrescriptions(true);
        claim.setHasPaymentReceipts(true);
        claim.setHasKycAndCancelledCheque(true);
        claim.setRemarks("Claim settled smoothly by Star Health with advisor assistance from My Friend Insurancewala. Deductions only for non-medical consumables.");
        insuranceClaimRepository.save(claim);

        // 6. Create Reminders
        Reminder rem1 = new Reminder();
        rem1.setUser(savedClient);
        rem1.setFamilyMember(savedSelf);
        rem1.setReminderType(ReminderType.MEDICINE);
        rem1.setTitle("Telmisartan 40mg");
        rem1.setDescription("Take 1 tablet every morning after breakfast for blood pressure control.");
        rem1.setReminderDate(LocalDate.now());
        rem1.setReminderTime("08:30 AM");
        rem1.setDosageOrFrequency("1 Tablet Daily");
        rem1.setActive(true);
        reminderRepository.save(rem1);

        Reminder rem2 = new Reminder();
        rem2.setUser(savedClient);
        rem2.setFamilyMember(savedFather);
        rem2.setReminderType(ReminderType.MEDICINE);
        rem2.setTitle("Metformin 500mg");
        rem2.setDescription("Take 1 tablet after dinner for diabetes.");
        rem2.setReminderDate(LocalDate.now());
        rem2.setReminderTime("08:30 PM");
        rem2.setDosageOrFrequency("1 Tablet Twice Daily");
        rem2.setActive(true);
        reminderRepository.save(rem2);

        Reminder rem3 = new Reminder();
        rem3.setUser(savedClient);
        rem3.setFamilyMember(savedFather);
        rem3.setReminderType(ReminderType.APPOINTMENT);
        rem3.setTitle("Dr. Arvind Mehta - Diabetic Foot & Blood Review");
        rem3.setDescription("Appointment at Max Clinic Room 204. Carry previous HbA1c lab report.");
        rem3.setReminderDate(LocalDate.now().plusDays(4));
        rem3.setReminderTime("11:00 AM");
        rem3.setDosageOrFrequency("Quarterly Followup");
        rem3.setActive(true);
        reminderRepository.save(rem3);

        Reminder rem4 = new Reminder();
        rem4.setUser(savedClient);
        rem4.setReminderType(ReminderType.POLICY_RENEWAL);
        rem4.setTitle("Care Senior Shield Policy Renewal Due");
        rem4.setDescription("Policy CARE-SR-2026-44391 for Father Ramesh Sharma expires in 28 days. Contact My Friend Insurancewala for renewal discount.");
        rem4.setReminderDate(LocalDate.now().plusDays(28));
        rem4.setReminderTime("10:00 AM");
        rem4.setDosageOrFrequency("Annual Renewal");
        rem4.setActive(true);
        reminderRepository.save(rem4);
    }
}
