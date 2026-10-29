package com.myfriendinsurancewala;

import com.myfriendinsurancewala.controller.HealthController;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pure unit test — no Spring context, no network, no MockMvc.
 */
class HealthControllerTest {

    private final HealthController controller = new HealthController();

    @Test
    void healthReturnsStatusUp() {
        Map<String, Object> resp = controller.buildHealthMap();
        assertEquals("UP", resp.get("status"));
    }

    @Test
    void healthReturnsCorrectApplicationName() {
        Map<String, Object> resp = controller.buildHealthMap();
        assertEquals("My Family Medical Records", resp.get("application"));
    }

    @Test
    void healthReturnsCorrectBrand() {
        Map<String, Object> resp = controller.buildHealthMap();
        assertEquals("My Friend Insurancewala", resp.get("brand"));
    }

    @Test
    void healthReturnsVersion() {
        Map<String, Object> resp = controller.buildHealthMap();
        assertEquals("1.0.0-PROD", resp.get("version"));
    }

    @Test
    void healthEndpointResponseEntityIsOk() {
        var response = controller.healthCheck();
        assertEquals(200, response.getStatusCode().value());
    }
}
