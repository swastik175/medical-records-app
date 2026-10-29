package com.myfriendinsurancewala.controller;

import com.myfriendinsurancewala.dto.AuthRequest;
import com.myfriendinsurancewala.dto.AuthResponse;
import com.myfriendinsurancewala.dto.ConsentUpdateRequest;
import com.myfriendinsurancewala.dto.RegisterRequest;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        AuthResponse response = authService.register(request, ip);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        AuthResponse response = authService.login(request, ip);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal User user) {
        AuthResponse response = authService.getCurrentUser(user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/consent")
    public ResponseEntity<AuthResponse> updateConsent(
            @AuthenticationPrincipal User user,
            @RequestBody ConsentUpdateRequest request,
            HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        AuthResponse response = authService.updateConsent(user, request, ip);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> requestDataDeletion(
            @AuthenticationPrincipal User user,
            HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        authService.requestDataDeletion(user, ip);
        return ResponseEntity.ok(Map.of(
                "message", "Your data deletion request under the Digital Personal Data Protection Act has been registered. Consent has been revoked.",
                "status", "CONSENT_REVOKED"
        ));
    }
}
