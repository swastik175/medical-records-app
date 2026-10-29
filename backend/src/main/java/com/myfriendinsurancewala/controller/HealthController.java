package com.myfriendinsurancewala.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    public static final String STATUS_UP = "UP";
    public static final String APP_TITLE = "My Family Medical Records";
    public static final String BRAND_NAME = "My Friend Insurancewala";
    public static final String VERSION = "1.0.0-PROD";

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(buildHealthMap());
    }

    /** Public helper for unit testing without Spring context. */
    public Map<String, Object> buildHealthMap() {
        return Map.of(
                "status", STATUS_UP,
                "application", APP_TITLE,
                "brand", BRAND_NAME,
                "timestamp", LocalDateTime.now().toString(),
                "version", VERSION
        );
    }
}
