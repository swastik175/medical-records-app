package com.myfriendinsurancewala.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.myfriendinsurancewala.dto.MedicalRecordDto;
import com.myfriendinsurancewala.model.RecordCategory;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.service.MedicalRecordService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @GetMapping
    public ResponseEntity<List<MedicalRecordDto>> getAll(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long familyMemberId,
            @RequestParam(required = false) RecordCategory category) {
        return ResponseEntity.ok(medicalRecordService.getMedicalRecords(user, familyMemberId, category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecordDto> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(medicalRecordService.getMedicalRecordById(id, user));
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<MedicalRecordDto> createWithFile(
            @RequestPart("record") String recordJson,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) throws IOException {
        MedicalRecordDto dto = objectMapper.readValue(recordJson, MedicalRecordDto.class);
        MedicalRecordDto created = medicalRecordService.createMedicalRecord(dto, file, user, request.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping(consumes = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<MedicalRecordDto> createJsonOnly(
            @RequestBody MedicalRecordDto dto,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        MedicalRecordDto created = medicalRecordService.createMedicalRecord(dto, null, user, request.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        Resource fileResource = medicalRecordService.downloadRecordDocument(id, user, request.getRemoteAddr());
        MedicalRecordDto recordDto = medicalRecordService.getMedicalRecordById(id, user);

        String contentType = recordDto.getFileContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        String fileName = recordDto.getOriginalFileName() != null ? recordDto.getOriginalFileName() : "medical_document";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(fileResource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        medicalRecordService.deleteMedicalRecord(id, user, request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }
}
