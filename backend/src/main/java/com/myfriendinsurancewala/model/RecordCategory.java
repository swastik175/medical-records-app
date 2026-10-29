package com.myfriendinsurancewala.model;

public enum RecordCategory {
    PRESCRIPTION("Doctor Prescriptions"),
    LAB_REPORT("Blood Test & Lab Reports"),
    RADIOLOGY("X-ray, CT Scan & MRI"),
    HOSPITAL_DISCHARGE("Hospital Admission & Discharge"),
    MEDICAL_BILL("Medical Bills & Receipts"),
    VACCINATION("Vaccination Records"),
    ALLERGY_MEDICINE("Allergies & Current Medicines");

    private final String displayName;

    RecordCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
