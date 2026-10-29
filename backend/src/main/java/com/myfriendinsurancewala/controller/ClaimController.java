package com.myfriendinsurancewala.controller;

import com.myfriendinsurancewala.dto.ClaimDto;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.service.ClaimService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    @Autowired
    private ClaimService claimService;

    @GetMapping
    public ResponseEntity<List<ClaimDto>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(claimService.getClaims(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimDto> getById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(claimService.getClaimById(id, user));
    }

    @PostMapping
    public ResponseEntity<ClaimDto> create(
            @Valid @RequestBody ClaimDto dto,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        ClaimDto created = claimService.createClaim(dto, user, request.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClaimDto> update(
            @PathVariable Long id,
            @Valid @RequestBody ClaimDto dto,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        ClaimDto updated = claimService.updateClaim(id, dto, user, request.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        claimService.deleteClaim(id, user, request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }
}
