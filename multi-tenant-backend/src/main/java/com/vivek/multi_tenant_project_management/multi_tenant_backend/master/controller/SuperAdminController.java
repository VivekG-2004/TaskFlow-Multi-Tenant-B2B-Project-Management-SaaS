package com.vivek.multi_tenant_project_management.multi_tenant_backend.master.controller;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.LoginRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.response.ApiResponse;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.Tenant;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.service.SuperAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(
            @Valid @RequestBody LoginRequest request) {
        Map<String, Object> result = superAdminService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Super admin login successful", result));
    }

    @GetMapping("/tenants")
    public ResponseEntity<ApiResponse<List<Tenant>>> getAllTenants() {
        List<Tenant> tenants = superAdminService.getAllTenants();
        return ResponseEntity.ok(ApiResponse.success("Tenants fetched", tenants));
    }

    @PutMapping("/tenants/{id}/suspend")
    public ResponseEntity<ApiResponse<Tenant>> suspendTenant(@PathVariable Long id) {
        Tenant tenant = superAdminService.suspendTenant(id);
        return ResponseEntity.ok(ApiResponse.success("Tenant suspended", tenant));
    }

    @PutMapping("/tenants/{id}/reactivate")
    public ResponseEntity<ApiResponse<Tenant>> reactivateTenant(@PathVariable Long id) {
        Tenant tenant = superAdminService.reactivateTenant(id);
        return ResponseEntity.ok(ApiResponse.success("Tenant reactivated", tenant));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = superAdminService.getPlatformStats();
        return ResponseEntity.ok(ApiResponse.success("Platform stats", stats));
    }

    @GetMapping("/generate-password")
    public String generatePassword(@RequestParam String password) {
        return passwordEncoder.encode(password);
    }
}