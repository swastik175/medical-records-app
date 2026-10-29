package com.myfriendinsurancewala.controller;

import com.myfriendinsurancewala.dto.InsurancePolicyDto;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.service.InsurancePolicyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insurance-policies")
public class InsurancePolicyController {

    @Autowired
    private InsurancePolicyService policyService;

    @GetMapping
    public ResponseEntity<List<InsurancePolicyDto>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(policyService.getPolicies(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsurancePolicyDto> getById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(policyService.getPolicyById(id, user));
    }

    @PostMapping
    public ResponseEntity<InsurancePolicyDto> create(
            @Valid @RequestBody InsurancePolicyDto dto,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        InsurancePolicyDto created = policyService.createPolicy(dto, user, request.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsurancePolicyDto> update(
            @PathVariable Long id,
            @Valid @RequestBody InsurancePolicyDto dto,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        InsurancePolicyDto updated = policyService.updatePolicy(id, dto, user, request.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        policyService.deletePolicy(id, user, request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }
}
