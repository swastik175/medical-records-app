package com.myfriendinsurancewala.service;

import com.myfriendinsurancewala.config.JwtTokenProvider;
import com.myfriendinsurancewala.dto.*;
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

import java.security.SecureRandom;
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

    @Autowired
    private EmailService emailService;

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
        user.setMustChangePassword(false);

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

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request, String ipAddress) {
        String identifier = request.getIdentifier().trim();
        User user = userRepository.findByMobileNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("No account registered with " + identifier));

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("No email address is associated with this account. Please contact support.");
        }

        // Generate a cryptographically secure 8-character alphanumeric temporary password
        String tempPassword = generateRandomPassword(8);
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);

        auditService.log(user.getId(), user.getRole(), "FORGOT_PASSWORD", "Account", ipAddress, "SUCCESS", "Temporary password sent to email");

        // Send email with temporary password
        emailService.sendTemporaryPassword(user.getEmail(), user.getFullName(), tempPassword);
    }

    @Transactional
    public AuthResponse changePassword(User currentUser, ChangePasswordRequest request, String ipAddress) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // If the user wasn't in forced temporary password mode, verify old password
        if (!user.isMustChangePassword()) {
            if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new UnauthorizedAccessException("Current password does not match");
            }
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        User updated = userRepository.save(user);

        auditService.log(updated.getId(), updated.getRole(), "CHANGE_PASSWORD", "Account", ipAddress, "SUCCESS", "Password updated successfully");

        String token = jwtTokenProvider.generateToken(updated.getMobileNumber(), updated.getRole(), updated.getId());
        return mapToAuthResponse(updated, token);
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
        user.setConsentGiven(false);
        user.setAllowAdvisorAccess(false);
        userRepository.save(user);
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
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
                user.isMustChangePassword(),
                user.getEmergencyContactName(),
                user.getEmergencyContactPhone(),
                user.getEmergencyContactRelation()
        );
    }
}
