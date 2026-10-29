package com.myfriendinsurancewala.service;

import com.myfriendinsurancewala.config.JwtTokenProvider;
import com.myfriendinsurancewala.dto.AuthRequest;
import com.myfriendinsurancewala.dto.AuthResponse;
import com.myfriendinsurancewala.dto.ConsentUpdateRequest;
import com.myfriendinsurancewala.dto.RegisterRequest;
import com.myfriendinsurancewala.exception.ResourceNotFoundException;
import com.myfriendinsurancewala.exception.UnauthorizedAccessException;
import com.myfriendinsurancewala.model.FamilyMember;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.repository.FamilyMemberRepository;
import com.myfriendinsurancewala.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AuditService auditService;

    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress) {
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new IllegalArgumentException("An account with mobile number " + request.getMobileNumber() + " already exists.");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setMobileNumber(request.getMobileNumber());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_CLIENT");
        user.setEmergencyContactName(request.getEmergencyContactName());
        user.setEmergencyContactPhone(request.getEmergencyContactPhone());
        user.setEmergencyContactRelation(request.getEmergencyContactRelation());
        user.setConsentGiven(request.isConsentGiven());
        user.setConsentTimestamp(LocalDateTime.now());
        user.setConsentVersion("1.0");
        user.setAllowAdvisorAccess(request.isAllowAdvisorAccess());

        User savedUser = userRepository.save(user);

        // Automatically create a "SELF" family profile for the primary client
        FamilyMember selfProfile = new FamilyMember();
        selfProfile.setUser(savedUser);
        selfProfile.setFullName(savedUser.getFullName());
        selfProfile.setRelationship("SELF");
        familyMemberRepository.save(selfProfile);

        auditService.log(savedUser.getId(), savedUser.getRole(), "REGISTER", "User Account", ipAddress, "SUCCESS", "Account registered with consent");

        String token = jwtTokenProvider.generateToken(savedUser.getMobileNumber(), savedUser.getRole(), savedUser.getId());
        return mapToAuthResponse(savedUser, token);
    }

    public AuthResponse login(AuthRequest request, String ipAddress) {
        User user = userRepository.findByMobileNumber(request.getMobileNumber())
                .orElseThrow(() -> new UnauthorizedAccessException("Invalid mobile number or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            auditService.log(user.getId(), user.getRole(), "LOGIN_FAILED", "Authentication", ipAddress, "DENIED", "Invalid password attempt");
            throw new UnauthorizedAccessException("Invalid mobile number or password");
        }

        auditService.log(user.getId(), user.getRole(), "LOGIN", "Authentication", ipAddress, "SUCCESS", "User logged in successfully");

        String token = jwtTokenProvider.generateToken(user.getMobileNumber(), user.getRole(), user.getId());
        return mapToAuthResponse(user, token);
    }

    public AuthResponse getCurrentUser(User user) {
        User refreshed = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToAuthResponse(refreshed, null);
    }

    @Transactional
    public AuthResponse updateConsent(User user, ConsentUpdateRequest request, String ipAddress) {
        User existing = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getConsentGiven() != null) {
            existing.setConsentGiven(request.getConsentGiven());
            existing.setConsentTimestamp(LocalDateTime.now());
        }
        if (request.getAllowAdvisorAccess() != null) {
            existing.setAllowAdvisorAccess(request.getAllowAdvisorAccess());
        }

        User updated = userRepository.save(existing);
        auditService.log(updated.getId(), updated.getRole(), "UPDATE_CONSENT", "Privacy Settings", ipAddress, "SUCCESS",
                "Consent: " + updated.isConsentGiven() + ", Advisor Access: " + updated.isAllowAdvisorAccess());

        return mapToAuthResponse(updated, null);
    }

    @Transactional
    public void requestDataDeletion(User user, String ipAddress) {
        auditService.log(user.getId(), user.getRole(), "DATA_DELETION_REQUEST", "Account", ipAddress, "SUCCESS", "Data deletion requested under DPDP Act");
        // Mark account as consent withdrawn
        user.setConsentGiven(false);
        user.setAllowAdvisorAccess(false);
        userRepository.save(user);
    }

    private AuthResponse mapToAuthResponse(User user, String token) {
        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getMobileNumber(),
                user.getEmail(),
                user.getRole(),
                user.isConsentGiven(),
                user.isAllowAdvisorAccess(),
                user.getEmergencyContactName(),
                user.getEmergencyContactPhone(),
                user.getEmergencyContactRelation()
        );
    }
}
