package com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.controller;

import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.request.LoginRequest;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.dto.response.ApiResponse;
import com.vivek.multi_tenant_project_management.multi_tenant_backend.tenant.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(
            @Valid @RequestBody LoginRequest request) {
        Map<String, Object> result = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", result));
    }
}