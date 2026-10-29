package com.myfriendinsurancewala.controller;

import com.myfriendinsurancewala.dto.EmergencySummaryDto;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.service.EmergencySummaryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emergency-summary")
public class EmergencySummaryController {

    @Autowired
    private EmergencySummaryService emergencySummaryService;

    @GetMapping("/{familyMemberId}")
    public ResponseEntity<EmergencySummaryDto> getEmergencySummary(
            @PathVariable Long familyMemberId,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        EmergencySummaryDto summary = emergencySummaryService.generateEmergencySummary(familyMemberId, user, request.getRemoteAddr());
        return ResponseEntity.ok(summary);
    }
}
