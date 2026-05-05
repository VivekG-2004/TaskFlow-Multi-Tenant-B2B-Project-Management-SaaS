package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.AuditLog;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public void log(Long userId, String action, String entityType, Long entityId,
                    Object oldValue, Object newValue) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setUserId(userId);
            auditLog.setAction(AuditLog.Action.valueOf(action));
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setOldValue(oldValue != null ? objectMapper.writeValueAsString(oldValue) : null);
            auditLog.setNewValue(newValue != null ? objectMapper.writeValueAsString(newValue) : null);
            auditLog.setCreatedAt(LocalDateTime.now());
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // audit failure should never break main flow
            log.error("Failed to write audit log for entity: {} id: {}", entityType, entityId, e);
        }
    }

    public List<AuditLog> getByUser(Long userId) {
        return auditLogRepository.findByUserId(userId);
    }

    public List<AuditLog> getByEntityType(String entityType) {
        return auditLogRepository.findByEntityType(entityType);
    }

    public List<AuditLog> getAll() {
        return auditLogRepository.findAll();
    }
}