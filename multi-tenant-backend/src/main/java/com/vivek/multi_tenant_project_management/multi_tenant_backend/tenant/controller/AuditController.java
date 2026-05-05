package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.controller;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.response.ApiResponse;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.entity.AuditLog;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAll() {
        List<AuditLog> logs = auditService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Audit logs fetched", logs));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getByUser(@PathVariable Long userId) {
        List<AuditLog> logs = auditService.getByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Audit logs fetched", logs));
    }

    @GetMapping("/entity/{entityType}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getByEntityType(@PathVariable String entityType) {
        List<AuditLog> logs = auditService.getByEntityType(entityType);
        return ResponseEntity.ok(ApiResponse.success("Audit logs fetched", logs));
    }
}