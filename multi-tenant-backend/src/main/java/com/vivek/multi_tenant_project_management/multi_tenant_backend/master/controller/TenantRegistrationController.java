package com.vivek.multi_tenant_project_management.multi_tenant_backend.master.controller;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.TenantRegistrationRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.response.ApiResponse;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.entity.Tenant;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.master.service.TenantProvisioningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantRegistrationController {

    private final TenantProvisioningService tenantProvisioningService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Tenant>> register(
            @Valid @RequestBody TenantRegistrationRequest request) {
        Tenant tenant = tenantProvisioningService.provisionTenant(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tenant registered successfully", tenant));
    }


}