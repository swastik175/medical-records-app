package com.myfriendinsurancewala.controller;

import com.myfriendinsurancewala.dto.FamilyMemberDto;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.service.FamilyMemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/family-members", "/api/family"})
public class FamilyMemberController {

    @Autowired
    private FamilyMemberService familyMemberService;

    @GetMapping
    public ResponseEntity<List<FamilyMemberDto>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(familyMemberService.getFamilyMembers(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FamilyMemberDto> getById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(familyMemberService.getFamilyMemberById(id, user));
    }

    @PostMapping
    public ResponseEntity<FamilyMemberDto> create(
            @Valid @RequestBody FamilyMemberDto dto,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        FamilyMemberDto created = familyMemberService.createFamilyMember(dto, user, request.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FamilyMemberDto> update(
            @PathVariable Long id,
            @Valid @RequestBody FamilyMemberDto dto,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        FamilyMemberDto updated = familyMemberService.updateFamilyMember(id, dto, user, request.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        familyMemberService.deleteFamilyMember(id, user, request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }
}
