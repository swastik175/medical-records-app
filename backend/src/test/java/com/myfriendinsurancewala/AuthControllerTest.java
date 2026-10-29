package com.myfriendinsurancewala;

import com.myfriendinsurancewala.dto.AuthRequest;
import com.myfriendinsurancewala.dto.AuthResponse;
import com.myfriendinsurancewala.dto.RegisterRequest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pure unit tests for Auth DTOs — no Spring context required.
 */
class AuthControllerTest {

    @Test
    void authRequestStoresCredentials() {
        AuthRequest req = new AuthRequest("9876543210", "Password@123");
        assertEquals("9876543210", req.getMobileNumber());
        assertEquals("Password@123", req.getPassword());
    }

    @Test
    void authRequestDefaultConstructorAndSetters() {
        AuthRequest req = new AuthRequest();
        req.setMobileNumber("9876543210");
        req.setPassword("Password@123");
        assertEquals("9876543210", req.getMobileNumber());
        assertEquals("Password@123", req.getPassword());
    }

    @Test
    void registerRequestConsentDefaultIsFalse() {
        RegisterRequest req = new RegisterRequest();
        assertFalse(req.isConsentGiven());
    }

    @Test
    void registerRequestAdvisorAccessDefaultIsFalse() {
        RegisterRequest req = new RegisterRequest();
        assertFalse(req.isAllowAdvisorAccess());
    }

    @Test
    void registerRequestStoresAllFields() {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Rajesh Sharma");
        req.setMobileNumber("9876543210");
        req.setEmail("rajesh@example.com");
        req.setPassword("Password@123");
        req.setConsentGiven(true);
        req.setEmergencyContactName("Sunita Sharma");
        req.setEmergencyContactPhone("9876543211");
        req.setEmergencyContactRelation("Spouse");

        assertEquals("Rajesh Sharma", req.getFullName());
        assertEquals("9876543210", req.getMobileNumber());
        assertEquals("rajesh@example.com", req.getEmail());
        assertTrue(req.isConsentGiven());
        assertEquals("Sunita Sharma", req.getEmergencyContactName());
        assertEquals("9876543211", req.getEmergencyContactPhone());
        assertEquals("Spouse", req.getEmergencyContactRelation());
    }

    @Test
    void authResponseDefaultConstructorAndSetters() {
        AuthResponse resp = new AuthResponse();
        resp.setToken("test.jwt.token");
        resp.setFullName("Rajesh Sharma");
        resp.setMobileNumber("9876543210");
        resp.setRole("ROLE_USER");
        resp.setConsentGiven(true);

        assertEquals("test.jwt.token", resp.getToken());
        assertEquals("Rajesh Sharma", resp.getFullName());
        assertEquals("9876543210", resp.getMobileNumber());
        assertEquals("ROLE_USER", resp.getRole());
        assertTrue(resp.isConsentGiven());
    }

    @Test
    void authResponseFullConstructor() {
        AuthResponse resp = new AuthResponse(
                "jwt.token", 1L, "Rajesh Sharma", "9876543210",
                "rajesh@example.com", "ROLE_USER", true, false,
                "Sunita", "9876543211", "Spouse");
        assertEquals("jwt.token", resp.getToken());
        assertEquals("Rajesh Sharma", resp.getFullName());
        assertEquals("9876543210", resp.getMobileNumber());
        assertTrue(resp.isConsentGiven());
        assertFalse(resp.isAllowAdvisorAccess());
    }

    @Test
    void mobileNumberValidationPattern() {
        assertTrue("9876543210".matches("^[0-9]{10}$"));
        assertFalse("987654321".matches("^[0-9]{10}$"));
        assertFalse("98765432AB".matches("^[0-9]{10}$"));
        assertFalse("".matches("^[0-9]{10}$"));
    }
}
