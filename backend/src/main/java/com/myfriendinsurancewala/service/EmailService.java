package com.myfriendinsurancewala.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${app.resend.api-key:}")
    private String resendApiKey;

    @Value("${app.resend.from-email:onboarding@resend.dev}")
    private String fromEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendTemporaryPassword(String toEmail, String fullName, String temporaryPassword) {
        String subject = "Your Temporary Password - My Family Medical Records";
        String content = "Hello " + (fullName != null ? fullName : "User") + ",\n\n"
                + "A temporary password has been generated for your account.\n\n"
                + "Temporary Password: " + temporaryPassword + "\n\n"
                + "Please sign in with your mobile number and this temporary password. "
                + "For your security, you will be prompted to choose a new password immediately upon logging in.\n\n"
                + "Best regards,\n"
                + "My Friend Insurancewala Team";

        log.info("===================================================================");
        log.info("DISPATCHING TEMPORARY PASSWORD EMAIL TO: {}", toEmail);
        log.info("TEMPORARY PASSWORD: {}", temporaryPassword);
        log.info("===================================================================");

        // If Resend API Key is provided, send real email via Resend API
        if (StringUtils.hasText(resendApiKey)) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(resendApiKey);
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> body = new HashMap<>();
                body.put("from", fromEmail);
                body.put("to", Collections.singletonList(toEmail));
                body.put("subject", subject);
                body.put("text", content);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                ResponseEntity<String> response = restTemplate.exchange("https://api.resend.com/emails", HttpMethod.POST, entity, String.class);
                log.info("Resend email response status: {}", response.getStatusCode());
            } catch (Exception ex) {
                log.error("Failed to send email via Resend: {}. Password logged above.", ex.getMessage());
            }
        } else {
            log.info("Resend API key not configured. Temporary password logged to console above.");
        }
    }
}
