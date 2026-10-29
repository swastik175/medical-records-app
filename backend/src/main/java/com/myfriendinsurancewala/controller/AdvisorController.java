package com.myfriendinsurancewala.controller;

import com.myfriendinsurancewala.dto.ClaimDto;
import com.myfriendinsurancewala.dto.FamilyMemberDto;
import com.myfriendinsurancewala.dto.InsurancePolicyDto;
import com.myfriendinsurancewala.dto.MedicalRecordDto;
import com.myfriendinsurancewala.exception.ResourceNotFoundException;
import com.myfriendinsurancewala.exception.UnauthorizedAccessException;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.repository.UserRepository;
import com.myfriendinsurancewala.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advisor")
public class AdvisorController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyMemberService familyMemberService;

    @Autowired
    private MedicalRecordService medicalRecordService;

    @Autowired
    private InsurancePolicyService insurancePolicyService;

    @Autowired
    private ClaimService claimService;

    @Autowired
    private AuditService auditService;

    @GetMapping("/client/{clientId}/claim-dossier")
    public ResponseEntity<Map<String, Object>> getClientClaimDossier(
            @PathVariable Long clientId,
            @AuthenticationPrincipal User advisor,
            HttpServletRequest request) {
        
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));

        // Strict authorization check: client must have explicitly granted advisor access
        if (!client.isAllowAdvisorAccess()) {
            auditService.log(advisor.getId(), advisor.getRole(), "ADVISOR_ACCESS_DENIED", "Client #" + clientId, request.getRemoteAddr(), "DENIED",
                    "Client has not granted advisor authorization");
            throw new UnauthorizedAccessException("Client " + client.getFullName() + " has not enabled advisor assistance access for claim documents.");
        }

        auditService.log(advisor.getId(), advisor.getRole(), "ADVISOR_ACCESS_GRANTED", "Client #" + clientId, request.getRemoteAddr(), "SUCCESS",
                "Accessed claim dossier for advisory service");

        List<FamilyMemberDto> familyMembers = familyMemberService.getFamilyMembers(client);
        List<InsurancePolicyDto> policies = insurancePolicyService.getPolicies(client);
        List<MedicalRecordDto> records = medicalRecordService.getMedicalRecords(client, null, null);
        List<ClaimDto> claims = claimService.getClaims(client);

        Map<String, Object> dossier = new HashMap<>();
        dossier.put("clientId", client.getId());
        dossier.put("clientName", client.getFullName());
        dossier.put("clientMobile", client.getMobileNumber());
        dossier.put("advisorAccessStatus", "AUTHORIZED_BY_CLIENT");
        dossier.put("familyMembers", familyMembers);
        dossier.put("policies", policies);
        dossier.put("medicalRecords", records);
        dossier.put("claims", claims);

        return ResponseEntity.ok(dossier);
    }
}
