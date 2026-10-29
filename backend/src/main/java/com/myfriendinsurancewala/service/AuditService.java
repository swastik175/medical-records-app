package com.myfriendinsurancewala.service;

import com.myfriendinsurancewala.model.AuditLog;
import com.myfriendinsurancewala.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(Long userId, String role, String action, String resource, String ipAddress, String status, String details) {
        try {
            AuditLog log = new AuditLog(userId, role, action, resource, ipAddress, status, details);
            auditLogRepository.save(log);
        } catch (Exception ex) {
            // Non-blocking logging
            System.err.println("Audit log failed: " + ex.getMessage());
        }
    }

    public List<AuditLog> getUserAuditLogs(Long userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
